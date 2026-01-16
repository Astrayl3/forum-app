import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get('/api/Me', { withCredentials: true });
            if (res.data.isLoggedIn) {
                setUser({ id: res.data.userId, username: res.data.username });
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

const logout = async () => {
    try {
        await axios.post('/api/Logout', {}, { withCredentials: true });
        setUser(null);
    } catch (err) {
        console.error("Lỗi khi đăng xuất:", err);
    }
};

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);