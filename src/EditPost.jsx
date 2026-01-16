import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/posts/${id}`)
            .then(res => {
                setTitle(res.data.title);
                setContent(res.data.content);
            });
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/posts/${id}`, { title, content }, { withCredentials: true });
            navigate('/');
        } catch (err) {
            alert("Lỗi khi cập nhật");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Edit Post</h2>
                <form onSubmit={handleUpdate}>
                    <div className="input-group">
                        <label htmlFor="title">Title</label>
                        <input 
                            type="text" 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="dark-input"
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="content">Context</label>
                        <textarea 
                            id="content" 
                            rows="6"
                            value={content}
                            className="dark-input"
                            onChange={(e) => setContent(e.target.value)}
                            required 
                        ></textarea>
                    </div>
                    <button type="submit" className="login-submit-btn">Save Change</button>
                </form>
            </div>
        </div>
    );
}

export default EditPost;