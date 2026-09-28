import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { getDashboardPath } from '../utils/getDashboardPath'

function PublicOnlyRoute({ children }) {
  const { user } = useAuth()

  if (user) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    )
  }

  return children
}

export default PublicOnlyRoute