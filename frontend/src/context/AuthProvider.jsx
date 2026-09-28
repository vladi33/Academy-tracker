import { useMemo, useState } from 'react'
import AuthContext from './AuthContext'

function readStoredUser() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')

  return token && role ? { token, role, username } : null
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const value = useMemo(() => ({
    user,
    login(token, role, username) {
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('username', username)
      setUser({ token, role, username })
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
