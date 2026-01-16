import React, {useState, useEffect} from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Login from './Login'
import Register from './Register';
import CreatePost from './CreatePost';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  
  const { user, logout, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error("Lỗi lấy bài viết:", err);
      }
    };
      if (location.pathname === '/') {
      fetchPosts();
    }
  }, [location.pathname]);

  if (loading) {
    return <div className="loading-screen">Loading application...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>
          <Link to="/">Our Wonderful App</Link>
        </h1>
        <nav>
          {/* If Logged In, show Logout button */}
          {user ? (
            <div className="user-nav">
              <button onClick={logout} className="logout-button" style={{ backgroundColor: '#d61c1c' }}>Log Out</button>
            </div>
          ) : (
            /* If not show Login/Register */
            !isAuthPage && (
              <>
                <Link to="/login" className="login-button">Log In</Link>
                <Link to="/register" className="login-button" style={{ backgroundColor: '#28a745' }}>Register</Link>
              </>
            )
          )}     
        </nav>
      </header>

      <main>
        <Routes>
          {/* Trang chủ/Dashboard */}
          <Route path="/" element={
            <>
              <h3>Welcome to our forum post {user ? <span className="highlight">{user.username}</span> : ""}</h3>
              <div className="forum-main">
                <Link to="/create-post" className="login-button" style={{backgroundColor: '#17a2b8'}}>Create Post</Link>
                <div className="posts-list">
                  {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="post-card">
                      <h4>{post.title}</h4>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <span>Posted by: <strong>{post.username}</strong></span>
                        <small>{new Date(post.created_at).toLocaleString()}</small>
                      </div>
                    </div>
                  )) : <p>Don't have any post yet.</p>}
                </div>
              </div>
            </>
          } />

          {/* Trang Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Routes>
      </main>

      <footer>
        <small>&copy;{new Date().getFullYear()} Our Wonderful App</small>
      </footer>
    </div>
  );
}

export default App;