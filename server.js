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
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
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

    db.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            author_id INTEGER,
            content TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id)
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Create Post
app.post('/api/posts', upload.single('image'), (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { title, content } = req.body;
        
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const statement = db.prepare("INSERT INTO posts (title, content, author_id, image) VALUES (?, ?, ?, ?)");
        statement.run(title, content, decoded.id, imagePath);

        res.json({ success: true, message: "Đăng bài thành công!" });
    } catch (err) {
        res.status(401).json({ error: "Lỗi xác thực" });
    }
});

// Delete Post
app.delete('/api/posts/:id', (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Edit Post
app.get('/api/posts/:id', (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
});

app.put('/api/posts/:id', upload.single('image'), (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { title, content, existingImage } = req.body;
        const postId = req.params.id;

        let imagePath = existingImage;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        const statement = db.prepare(`
            UPDATE posts 
            SET title = ?, content = ?, image = ?, is_updated = 1 
            WHERE id = ? AND author_id = ?
        `);

        const result = statement.run(title, content, imagePath, postId, decoded.id);

        if (result.changes > 0) {
            res.json({ success: true, image: imagePath });
        } else {
            res.status(403).json({ error: "Không có quyền sửa hoặc bài viết không tồn tại" });
        }
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Authentication failed" });
    }
});

// Comment Post
app.get('/api/posts/:id/comments', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC"); //
        const comments = stmt.all(req.params.id); //
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:id/details', (req, res) => {
    try {
        const post = db.prepare(`
            SELECT posts.*, users.username 
            FROM posts 
            JOIN users ON posts.author_id = users.id 
            WHERE posts.id = ?
        `).get(req.params.id);

        const comments = db.prepare(`
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.author_id = users.id 
            WHERE post_id = ? 
            ORDER BY created_at DESC
        `).all(req.params.id);

        res.json({ post, comments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1 Picture per comment
app.post('/api/posts/:id/comments', upload.single('image'), (req, res) => {
    const token = req.cookies.session_id;
    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { content } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const stmt = db.prepare("INSERT INTO comments (post_id, author_id, content, image) VALUES (?, ?, ?, ?)"); //
        stmt.run(req.params.id, decoded.id, content, imagePath); //

        res.json({ success: true });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});
// For static file from folder dist (after npm run build)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Handle 404 for Single Page Application (React Router)
// If user refresh page /login, Node will sent back file index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});