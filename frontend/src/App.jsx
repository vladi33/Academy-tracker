import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AuthProvider from './context/AuthProvider'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import useAuth from './hooks/useAuth'
import { getDashboardPath } from './utils/getDashboardPath'

function HomeRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Navigate
      to={getDashboardPath(user.role)}
      replace
    />
  )
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col min-h-0">
        <Routes>
          <Route
            path="/"
            element={<HomeRedirect />}
          />

          <Route
            path="/login"
            element={(
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            )}
          />

          <Route
            path="/register"
            element={(
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            )}
          />

          <Route
            path="/student"
            element={(
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/instructor"
            element={(
              <ProtectedRoute allowedRole="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/admin"
            element={(
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App