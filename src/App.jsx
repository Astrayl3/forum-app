import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './Login'
import './App.css';

function App() {
  
  const location = useLocation();

  return (
    <div className="container">
      <header>
        <h1>
          <Link to="/">Our Wonderful App</Link>
        </h1>
        <nav>
          {location.pathname !== '/Login' && (
          <Link to="/Login" className="login-button">Log In</Link>
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
        </Routes>
      </main>

      <footer>
        <small>&copy; Our Wonderful App</small>
      </footer>
    </div>
  );
}

export default App;