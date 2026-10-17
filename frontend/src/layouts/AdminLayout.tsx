import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4 bg-indigo-950 p-6 text-white">
        <span className="text-xl font-extrabold">Admin</span>
        <Link to="/admin" className="hover:text-violet-300">Overview</Link>
        <Link to="/admin/events" className="hover:text-violet-300">Manage events</Link>
        <button
          className="cursor-pointer text-left hover:text-violet-300"
          onClick={() => { logout(); navigate('/') }}
        >
          Log out
        </button>
      </aside>
      <section className="p-8"><Outlet /></section>
    </div>
  )
}