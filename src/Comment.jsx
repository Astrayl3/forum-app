import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaRegImage } from 'react-icons/fa6';

const CommentPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    };

    const loadData = async () => {
        try {
            const res = await axios.get(`/api/posts/${id}/details`);
            setPost(res.data.post);
            setComments(res.data.comments);
        } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleReply = async () => {
        if (!text.trim() && !image) return;
        const formData = new FormData();
        formData.append('content', text);
        if (image) formData.append('image', image);

        try {
            await axios.post(`/api/posts/${id}/comments`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setText(''); setImage(null); setPreview('');
            loadData();
        } catch (err) { alert("Không thể gửi bình luận"); }
    };

    if (!post) return <div className="container">Loading...</div>;

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '600px', textAlign: 'left', padding: '20px' }}>
                
                <div className="original-post-section" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#000' }}>{post.title}</h3>
                    <p style={{ color: '#333', whiteSpace: 'pre-wrap', fontSize: '1rem' }}>{post.content}</p>
                    {post.image && <img src={post.image} style={{ width: '100%', borderRadius: '12px', marginTop: '10px' }} alt="post" />}
                    <div style={{ color: '#777', fontSize: '0.8rem', marginTop: '10px' }}>
                        By <strong>{post.username}</strong> • {new Date(post.created_at).toLocaleString()}
                    </div>
                </div>

                <hr style={{ border: '0.5px solid #eee', margin: '15px 0' }} />

                <div className="reply-container">
                    <textarea 
                        ref={textareaRef}
                        className="reply-input"
                        placeholder="Post your reply"
                        value={text}
                        onChange={(e) => { setText(e.target.value); adjustHeight(); }}
                        style={{ width: '100%', border: 'none', outline: 'none', color: '#000', fontSize: '1.2rem', resize: 'none', padding: '0' }}
                    />
                    
                    {preview && (
                        <div style={{ position: 'relative', marginTop: '10px' }}>
                            <img src={preview} style={{ width: '100%', borderRadius: '15px', border: '1px solid #eee' }} alt="preview" />
                            <button 
                                onClick={() => { setImage(null); setPreview(''); }}
                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px' }}
                            >✕</button>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ marginLeft: '-8px' }}>
                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                style={{ background: 'none', border: 'none', color: '#1d9bf0', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                                className="icon-hover"
                            >
                                <FaRegImage size={22} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                hidden 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }} 
                            />
                        </div>
                        
                        <button 
                            className="login-submit-btn" 
                            onClick={handleReply} 
                            style={{ width: 'auto', margin: 0, padding: '6px 20px', borderRadius: '20px' }}
                            disabled={!text.trim() && !image}
                        >
                            Reply
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: '30px' }}>
                    {comments.length > 0 ? comments.map(c => (
                        <div key={c.id} style={{ padding: '15px 0', borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                                <strong style={{ color: '#000' }}>{c.username}</strong> 
                                <span style={{ color: '#777' }}> • {new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <p style={{ color: '#000', margin: '0', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                            {c.image && <img src={c.image} style={{ width: '100%', borderRadius: '15px', marginTop: '10px', border: '1px solid #eee' }} alt="comment" />}
                        </div>
                    )) : <p style={{ color: '#777', textAlign: 'center' }}>No replies yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default CommentPage;