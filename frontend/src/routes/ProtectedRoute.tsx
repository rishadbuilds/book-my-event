import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type Role } from '../features/auth/AuthContext'

export default function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { role } = useAuth()
  if (!role || !allow.includes(role)) return <Navigate to="/login" replace />
  return <Outlet />
}