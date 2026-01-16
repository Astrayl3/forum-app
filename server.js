import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const db = new Database('database.db');
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `).run();
    console.log("Bảng Users đã sẵn sàng.");
});

createTables();

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const statement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        const result = statement.run(username, hashedPassword);
        
        const userId = result.lastInsertRowid;

        const token = jwt.sign(
            { id: userId, username: username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.cookie('session_id', token, { 
            httpOnly: true, 
            secure: false, 
            sameSite: "lax", 
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, message: "User registered and logged in!" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Username already exists" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            const token = jwt.sign(
                { id: user.id, username: user.username }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );

            res.cookie('session_id', token, { 
                httpOnly: true, 
                secure: false, 
                sameSite: "lax", 
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, message: "Logged in successfully!" });
        } else {
            return res.status(400).json({ error: "Incorrect password" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/Me', (req, res) => {
    const token = req.cookies.session_id;

    if (!token) {
        return res.json({ isLoggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cua_ban');
        res.json({ 
            isLoggedIn: true, 
            username: decoded.username 
        });
    } catch (err) {
        res.json({ isLoggedIn: false });
    }
});

app.post('/api/Logout', (req, res) => {
    res.clearCookie('session_id', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
    });

    res.json({ success: true, message: "Đã đăng xuất thành công!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));