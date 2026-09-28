import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../api/axiosConfig'
import useAuth from '../hooks/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'
import { getDashboardPath } from '../utils/getDashboardPath'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await API.post('/auth/login', { username, password })
      const { token, role, username: authenticatedUsername } = response.data
      login(token, role, authenticatedUsername)

      const requestedPath = location.state?.from?.pathname
      const defaultPath = getDashboardPath(role)
      navigate(requestedPath || defaultPath, { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Invalid credentials. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-96 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
