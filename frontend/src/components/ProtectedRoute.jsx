import { Navigate, useLocation, } from 'react-router-dom'

import useAuth from '../hooks/useAuth'
import { getDashboardPath } from '../utils/getDashboardPath'

function ProtectedRoute({
  allowedRole,
  children,
}) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute