import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './App.css';

function Register() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    setIsLoading(true);

    try {
        const response = await axios.post('http://localhost:3000/api/register', {
            username: formData.username,
            password: formData.password 
        }, {
            withCredentials: true 
        });

        if (response.data.success) {
            setUser({ 
                id: response.data.userId, 
                username: response.data.username 
            });

            alert("Đăng ký và đăng nhập thành công!");
            navigate('/'); 
        }
    } catch (err) {
        setIsLoading(false);
        alert(err.response?.data?.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account</h2>
        <p>Join our wonderful community today.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Pick a username"
              className="dark-input"
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
              placeholder="Create a password"
              className="dark-input"
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="dark-input"
              required 
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="login-footer">
          <span>Already have an account? </span>
          <a href="/login">Log In</a>
        </div>
      </div>
    </div>
  );
}

export default Register;