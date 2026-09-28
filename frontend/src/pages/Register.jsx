import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axiosConfig'
import { getErrorMessage } from '../utils/getErrorMessage'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [instructorCode, setInstructorCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      await API.post('/auth/register', {
        username,
        password,
        role,
        instructorCode: role === 'INSTRUCTOR' ? instructorCode : null,
      })
      setMessage('Registration successful. Redirecting to login...')
      window.setTimeout(() => navigate('/login'), 1200)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Registration failed. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-96 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
        {message && <p className="text-center text-sm font-medium text-green-700">{message}</p>}
        {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={3}
            maxLength={50}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="register-role">I am a:</label>
          <select
            id="register-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        {role === 'INSTRUCTOR' && (
          <div>
            <label className="block text-red-600 font-medium mb-2" htmlFor="instructor-code">Instructor Secret Code</label>
            <input
              id="instructor-code"
              type="password"
              value={instructorCode}
              onChange={(event) => setInstructorCode(event.target.value)}
              placeholder="Enter the secret academy code"
              className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Already registered? <Link to="/login" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
