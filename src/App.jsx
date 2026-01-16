import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Login from './Login';
import Register from './Register';
import CreatePost from './CreatePost';
import EditPost from './EditPost';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  const { user, logout, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error("Lỗi lấy bài viết:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Do you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:3000/api/posts/${postId}`, { withCredentials: true });
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        alert(err.response?.data?.error || "Delete failed");
      }
    }
  };

  useEffect(() => {
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
        <h1><Link to="/">Our Wonderful App</Link></h1>
        <nav>
          {user ? (
            <div className="user-nav">
              <button onClick={logout} className="logout-button" style={{ backgroundColor: '#d61c1c' }}>Log Out</button>
            </div>
          ) : (
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
          <Route path="/" element={
            <>
              <h3>Welcome to our forum post {user ? <span className="highlight">{user.username}</span> : ""}</h3>
              <div className="forum-main">
                <div className="button-wrapper">
                  <Link to="/create-post" className="create-post-btn">Create Post</Link>
                </div>
                
                <div className="posts-list">
                  {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <h4>{post.title} {post.is_updated === 1 && <span className="updated-label">(updated)</span>}</h4>
                        {user && user.id === post.author_id && (
                          <div className="post-actions">
                            <Link to={`/edit-post/${post.id}`} className="edit-link">Edit</Link>
                            <button onClick={() => handleDelete(post.id)} className="delete-btn">Delete</button>
                          </div>
                        )}
                      </div>

                      <p>{post.content}</p>
                      {post.image && (
                          <div className="post-image">
                              <img src={`http://localhost:3000${post.image}`} alt="Post content" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />
                          </div>
                      )}
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

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
        </Routes>
      </main>

      <footer>
        <small>&copy;{new Date().getFullYear()} Our Wonderful App</small>
      </footer>
    </div>
  );
}

export default App;