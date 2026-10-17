import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { btnSmall } from '../components/ui/buttonStyles'

export default function PublicLayout() {
  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-500/20 bg-white/90 px-[6vw] py-4 backdrop-blur dark:bg-[#14121a]/90">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
          <a href="/#events" className="hover:text-brand">Events</a>
          <a href="/#how" className="hover:text-brand">How it works</a>
          <Link to="/login" className={btnSmall}>Sign in</Link>
        </nav>
      </header>

      <main><Outlet /></main>

      <footer className="border-t border-zinc-500/20 px-6 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} BookMyEvent. All rights reserved.
      </footer>
    </>
  )
}