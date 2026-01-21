SocialForum: A Full-Stack Modern Communication Platform

SocialForum is a modern communication platform inspired by the core functionalities of X (Twitter), designed to facilitate multimedia discussions in a secure and scalable environment. This project prioritizes sophisticated user experience (UX) and demonstrates high-level backend integration and professional DevOps workflows.
🚀 Key Features

Frontend (User Experience)
- Dynamic UX: Built on React, prioritizing fluid and seamless interactions.
- Smart Content Creation:
  - Auto-expanding textareas that adapt to content length.
  - Direct clipboard image-paste functionality for rapid post creation.
- Multimedia Support: Comprehensive support for high-quality image uploads and rendering in both original posts and nested replies.
- Responsive Design: A fully adaptive interface ensuring an optimal viewing experience across all devices.

Backend & Security
- Efficient Data Management: Powered by better-sqlite3 to manage relational data (Users, Posts, and Nested Comment Threads) with high performance.
- Nested Conversations: Implementation of sophisticated algorithms for handling deep-nested comment threads and organized discussions.
- Robust Authentication: * Stateless authentication via JSON Web Tokens (JWT).
  - Enhanced security using HTTP-only cookies to mitigate XSS (Cross-Site Scripting) vulnerabilities.
- Multipart Media Handling: Integrated Multer to manage complex multipart media upload workflows for original content and replies.

Infrastructure & DevOps
- Containerization: The entire application stack is containerized using Docker Compose, ensuring environment consistency across development and production.
- Secure Remote Access: Deployed via Cloudflare Tunnel, enabling secure remote access and cross-device testing without traditional port forwarding or exposing local infrastructure.

🛠 Tech Stack
- Front-End: React, Tailwind CSS, Lucide React
- Backend: Node.js, Express
- Database: Better-SQLite3
- Authentication: JWT, HTTP-only Cookies
- File Handling: Multer
- DevOps: Docker, Docker Compose, Cloudflare Tunnel

📦 Installation & Deployment

System Requirements:
- Docker & Docker Compose
- Node.js (if running locally without Docker)

Quick Start with Docker
1. Clone the repository:
git clone [https://github.com/username/social-forum.git](https://github.com/Astrayl3/forum-app.git)
cd forum-app

2. Configure Environment Variables: Create a .env file based on the provided .env.example.

3. Launch with Docker Compose:
docker-compose up -d

🔒 Security Integrated
- The project is built with a "Security-First" philosophy:
- Passwords are securely hashed before storage.
- Stateless authentication architecture via JWT.
- Strict separation of Frontend and Backend logic through a RESTful API.

🎯 Project Objectives
- This project was developed to demonstrate expertise in:
- Building sophisticated, high-performance Frontend UX.
- Designing secure and efficient Backend data processing logic.
- Implementing professional DevOps workflows for modern application deployment and operation.
