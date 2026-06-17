import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const role = localStorage.getItem('role');
            setUser({ token, role });
        }
    }, []);

    const login = (token, role, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setUser({ token, role });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};