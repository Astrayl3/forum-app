import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

// Multer Storege Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // File save in uploads
    },
    filename: (req, file, cb) => {
        // Filename = timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const db = new Database('database.db');
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    `).run();

    try {
        db.prepare(`ALTER TABLE posts ADD COLUMN is_updated INTEGER DEFAULT 0`).run();
    } catch (err) {
        if (!err.message.includes("duplicate column name")) {
            console.error("Lỗi khi thêm cột is_updated:", err.message);
        }
    }

    try {
    db.prepare(`ALTER TABLE posts ADD COLUMN image TEXT`).run();
    } catch (err){}

    console.log("Hệ thống Database đã sẵn sàng.");
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

        res.json({ success: true, userId: userId, username: username, message: "User registered and logged in!" });
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

            return res.json({ success: true, userId: user.id, username: user.username, message: "Logged in successfully!" });
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
            userId: decoded.id,
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

    res.json({ success: true, message: "Logged out successfully!" });
});

app.get('/api/posts', (req, res) => {
    const posts = db.prepare(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.author_id = users.id 
        ORDER BY posts.created_at DESC
    `).all();
    res.json(posts);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cua_ban');
        const { title, content } = req.body;
        
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const statement = db.prepare("INSERT INTO posts (title, content, author_id, image) VALUES (?, ?, ?, ?)");
        statement.run(title, content, decoded.id, imagePath);

        res.json({ success: true, message: "Đăng bài thành công!" });
    } catch (err) {
        res.status(401).json({ error: "Lỗi xác thực" });
    }
});

app.delete('/api/posts/:id', (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cua_ban');
        const statement = db.prepare("DELETE FROM posts WHERE id = ? AND author_id = ?");
        const result = statement.run(req.params.id, decoded.id);

        if (result.changes > 0) {
            res.json({ success: true, message: "Post deleted successfully!" });
        } else {
            res.status(403).json({ error: "You don't have permission to delete this post" });
        }
    } catch (err) {
        res.status(401).json({ error: "Authentication failed" });
    }
});

app.get('/api/posts/:id', (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
});

app.put('/api/posts/:id', (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cua_ban');
        const { title, content } = req.body;

        const statement = db.prepare("UPDATE posts SET title = ?, content = ?, is_updated = 1 WHERE id = ? AND author_id = ?");
        const result = statement.run(title, content, req.params.id, decoded.id);

        if (result.changes > 0) {
            res.json({ success: true });
        } else {
            res.status(403).json({ error: "You don't have permission to edit this post" });
        }
    } catch (err) {
        res.status(401).json({ error: "Authentication failed" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));