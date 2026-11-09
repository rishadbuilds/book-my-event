import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

/** Renders the nested route only for the listed roles. */
export function RoleRoute({ roles }: { roles: string[] }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
