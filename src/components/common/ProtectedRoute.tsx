import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  requireStaff?: boolean
}

export function ProtectedRoute({ requireStaff = false }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (requireStaff && !user?.staff_profile) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
