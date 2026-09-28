import {
  Link,
  useNavigate,
} from 'react-router-dom'

import useAuth from '../hooks/useAuth'
import { getDashboardPath } from '../utils/getDashboardPath'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const homePath = user
    ? getDashboardPath(user.role)
    : '/login'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <Link
        to={homePath}
        className="text-xl font-bold tracking-wider"
      >
        Academy Tracker
      </Link>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-blue-100">
              {user.username} · {user.role}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login">
              Login
            </Link>

            <Link
              to="/register"
              className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar