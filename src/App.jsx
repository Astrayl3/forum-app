import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Login from './Login'
import Register from './Register';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati dicta id architecto nesciunt explicabo fugit autem, optio temporibus animi harum. Ab repellendus molestiae ex laborum cum dolore. Cumque, tempore ducimus!</p>
            </>
          } />

          {/* Trang Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer>
        <small>&copy;{new Date().getFullYear()} Our Wonderful App</small>
      </footer>
    </div>
  );
}

export default App;