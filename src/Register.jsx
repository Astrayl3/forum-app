import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/register', {
        username: formData.username,
        password: formData.password 
        });

        if (response.data.success) {
        alert("Đăng ký thành công!");
        navigate('/Login');
        }
    } catch (err) {
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
              required 
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Register
          </button>
        </form>

        <div className="login-footer">
          <span>Already have an account? </span>
          <a href="/Login">Log In</a>
        </div>
      </div>
    </div>
  );
}

export default Register;