import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './App.css';


function Login() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(''); // Lưu lỗi từ server
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isLoading) return;
    setIsLoading(true);

      try {
        const response = await axios.post('http://localhost:3000/api/login', formData, { withCredentials: true });

        if (response.data.success) {
          setUser({ username: formData.username });
          alert("Đăng nhập thành công!");
          // Lưu token hoặc thông tin user nếu cần, sau đó về Dashboard
          navigate('/'); 
        }
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <p>Welcome back! Please enter your details.</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Log In
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account? </span>
          <a href="/register">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;