import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return <div className="container"><h3>Please Log in to create a post!</h3></div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/posts', { title, content }, { withCredentials: true });
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.error || "Error creating post");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create New Post</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Content</label>
                        <textarea rows="5" value={content} onChange={(e) => setContent(e.target.value)} required 
                                  style={{width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '10px'}}></textarea>
                    </div>
                    <button type="submit" className="login-submit-btn">Post Now</button>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;