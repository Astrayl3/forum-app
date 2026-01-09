import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './Login'
import Register from './Register';
import './App.css';

function App() {
  
  const location = useLocation();
  const isAuthPage = location.pathname === '/Login' || location.pathname === '/Register';

  return (
    <div className="container">
      <header>
        <h1>
          <Link to="/">Our Wonderful App</Link>
        </h1>
        <nav>
          {!isAuthPage && (
            <>
              <Link to="/Login" className="login-button">Log In</Link>
              <Link to="/Register" className="login-button" style={{ backgroundColor: '#28a745' }}>Register</Link>
            </>
          )}      
        </nav>
      </header>

      <main>
        <Routes>
          {/* Trang chủ/Dashboard */}
          <Route path="/" element={
            <>
              <h3>Welcome to your dashboard!</h3>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati dicta id architecto nesciunt explicabo fugit autem, optio temporibus animi harum. Ab repellendus molestiae ex laborum cum dolore. Cumque, tempore ducimus!</p>
            </>
          } />

          {/* Trang Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer>
        <small>&copy; Our Wonderful App</small>
      </footer>
    </div>
  );
}

export default App;