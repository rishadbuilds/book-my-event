import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FullPageLoader } from '@/shared/components/FullPageLoader'

/** Keeps signed-in users away from /login and /register. */
export function GuestRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') return <Navigate to="/" replace />

  return <Outlet />
}
