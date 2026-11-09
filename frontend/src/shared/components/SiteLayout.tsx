import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-violet-50 text-violet-700'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}

export function SiteLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const isManager = user?.role === 'provider' || user?.role === 'admin'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-svh flex-col bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-violet-600"
          >
            <CalendarDays className="size-5" />
            BookMyEvent
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/services" className={navLinkClass}>
              Browse services
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/bookings" className={navLinkClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="size-4" />
                  My bookings
                </span>
              </NavLink>
            )}

            {isManager && (
              <NavLink to="/dashboard" className={navLinkClass}>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </span>
              </NavLink>
            )}

            {isAuthenticated && user ? (
              <div className="ml-2 flex items-center gap-2 border-l pl-2">
                <Link
                  to="/account"
                  className="hidden text-sm font-medium text-muted-foreground hover:text-violet-600 sm:block"
                >
                  {user.name.split(' ')[0]}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2 border-l pl-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>© {new Date().getFullYear()} BookMyEvent</p>
          <p>Plan less. Celebrate more.</p>
        </div>
      </footer>
    </div>
  )
}
