import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const element = textareaRef.current;
        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    };

    useEffect(() => {
        axios.get(`/api/posts/${id}`).then(res => {
            setTitle(res.data.title || '');
            setContent(res.data.content);
            setPreview(res.data.image);
            setTimeout(adjustHeight, 100);
        });
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);
        else formData.append('existingImage', preview);

        try {
            await axios.put(`/api/posts/${id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            alert("Lỗi cập nhật");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '600px' }}>
                <h2>Edit Post</h2>
                <form onSubmit={handleUpdate}>
                    <div className="input-group">
                        <label>Title</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-group input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Content</label>
                        <textarea 
                            ref={textareaRef}
                            className="dark-input" 
                            style={{ 
                                overflow: 'hidden', 
                                minHeight: '100px', 
                                resize: 'none' 
                            }}
                            value={content} 
                            onChange={(e) => {
                                setContent(e.target.value);
                                adjustHeight();
                            }} 
                        />
                    </div>
                    
                    <div style={{ margin: '15px 0', textAlign: 'left' }}>
                        <p style={{ color: '#555', fontSize: '0.85rem' }}>Image:</p>
                        {preview && <img src={preview} alt="Old" style={{ width: '100%', borderRadius: '8px' }} />}
                        <input 
                            type="file" 
                            style={{ marginTop: '10px' }}
                            onChange={(e) => {
                                setImage(e.target.files[0]);
                                setPreview(URL.createObjectURL(e.target.files[0]));
                            }} 
                        />
                    </div>

                    <button type="submit" className="login-submit-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditPost;