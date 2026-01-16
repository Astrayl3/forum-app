import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.post('http://localhost:3000/api/posts', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Đăng bài thành công!");
            navigate('/');
        } catch (err) {
            alert("Lỗi khi đăng bài");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create New Post</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="dark-input" />
                    </div>
                    
                    <div className="input-group">
                        <label>Upload Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="dark-input" />
                    </div>

                    <div className="input-group">
                        <label>Context</label>
                        <textarea rows="6" value={content} onChange={(e) => setContent(e.target.value)} required className="dark-input no-resize" />
                    </div>

                    <button type="submit" className="login-submit-btn">Post</button>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;