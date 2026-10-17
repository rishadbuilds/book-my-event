import { Link, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { useAuth } from '../features/auth/context/AuthContext'

export default function UserLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4 bg-violet-50 p-6 dark:bg-white/5">
        <Logo />
        <Link to="/app" className="hover:text-brand">Dashboard</Link>
        <Link to="/app/bookings" className="hover:text-brand">My bookings</Link>
        <button
          className="cursor-pointer text-left hover:text-brand"
          onClick={() => { logout(); navigate('/') }}
        >
          Log out
        </button>
      </aside>
      <section className="p-8"><Outlet /></section>
    </div>
  )
}