import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors()); // Cho phép API
app.use(express.json()); // Để đọc JSON

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

app.post('/api/Register', async(req, res) => {
    const { username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const statement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        statement.run(username, hashedPassword);

        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Username already exists" });
    }
});

app.post('/api/Login', async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.json({ success: true, message: "Logged in successfully!" });
    } else {
        res.status(400).json({ error: "Incorrect password" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));