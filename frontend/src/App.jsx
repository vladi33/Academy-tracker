import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-grow flex flex-col min-h-0">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;