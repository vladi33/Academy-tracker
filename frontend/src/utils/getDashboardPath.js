export function getDashboardPath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'INSTRUCTOR':
      return '/instructor'
    case 'STUDENT':
      return '/student'
    default:
      return '/login'
  }
}