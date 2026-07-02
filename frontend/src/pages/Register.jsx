import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [secretCode, setSecretCode] = useState('');
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();


    let finalRole;

    if (role === 'INSTRUCTOR') {
        finalRole = secretCode;
    } else {
        finalRole = 'STUDENT';
    }

        try {
            await API.post('/auth/register', { username, password, role: finalRole });
            setMsg('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMsg('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
                {msg && <p className="text-center text-sm font-medium text-blue-600">{msg}</p>}

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">I am a:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                    </select>
                </div>


                {role === 'INSTRUCTOR' && (
                    <div className="transition-all duration-300 ease-in-out">
                        <label className="block text-red-600 font-medium mb-2">Instructor Secret Code</label>
                        <input
                            type="password"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Enter the secret academy code"
                            className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                            required={role === 'INSTRUCTOR'}
                        />
                    </div>
                )}

                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition">Register</button>
                <p className="text-sm text-center text-gray-600">Already registered? <Link to="/login" className="text-blue-500 hover:underline">Sign In</Link></p>
            </form>
        </div>
    );
};

export default Register;