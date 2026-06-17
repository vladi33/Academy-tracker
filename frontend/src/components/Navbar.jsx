import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
            <Link to="/" className="text-xl font-bold tracking-wider">Academy Tracker</Link>
            <div>
                {user ? (
                    <button onClick={handleLogout} className="px-4 py-2 rounded transition">
                        Logout
                    </button>
                ) : (
                    <div className="space-x-4">
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;