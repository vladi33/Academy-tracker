import React, { useState, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/auth/login', { username, password });
            const { token, role } = response.data;
            login(token, role);
            if (role === 'INSTRUCTOR') navigate('/instructor');
            else navigate('/student');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">Login</button>
                <p className="text-sm text-center text-gray-600">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link></p>
            </form>
        </div>
    );
};

export default Login;