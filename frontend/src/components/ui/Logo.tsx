import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="text-xl font-extrabold">
      Book<span className="text-brand">My</span>Event
    </Link>
  )
}