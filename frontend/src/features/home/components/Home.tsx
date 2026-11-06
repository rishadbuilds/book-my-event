import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

const events = [
  {
    id: 1,
    title: 'The Wedding Edit',
    category: 'Wedding',
    location: 'Kozhikode',
    price: 499,
    emoji: '💐',
  },
  {
    id: 2,
    title: 'Sunset Sessions',
    category: 'Live Music',
    location: 'Malappuram',
    price: 799,
    emoji: '🎸',
  },
  {
    id: 3,
    title: 'Paint & Unwind',
    category: 'Workshop',
    location: 'Kochi',
    price: 349,
    emoji: '🎨',
  },
]

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 md:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-violet-600"
        >
          <CalendarDays className="size-6" />
          BookMyEvent
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/account"
                className="hidden text-sm font-medium text-gray-600 hover:text-violet-600 sm:block"
              >
                Hi, {user.name.split(' ')[0]}
              </Link>
              <Button variant="outline" size="lg" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="lg" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <section className="px-6 py-20 text-center">
        <p className="font-semibold text-violet-600">
          YOUR NEXT GREAT MEMORY STARTS HERE
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold md:text-6xl">
          Discover events.
          <span className="text-violet-600"> Create memories.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-gray-500">
          Find concerts, workshops, celebrations, and experiences worth
          showing up for.
        </p>

        <Button size="lg" className="mt-8" asChild>
          <a href="#events">Explore events</a>
        </Button>
      </section>

      <section id="events" className="px-6 py-12 md:px-12">
        <h2 className="mb-8 text-3xl font-bold">Popular events</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-40 items-center justify-center bg-violet-100 text-6xl">
                {event.emoji}
              </div>

              <div className="p-5">
                <p className="text-sm font-semibold text-violet-600">
                  {event.category}
                </p>

                <h3 className="mt-2 text-xl font-bold">{event.title}</h3>

                <p className="mt-2 text-sm text-gray-500">
                  📍 {event.location}
                </p>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <p className="text-lg font-bold">₹{event.price}</p>

                  <Button
                    variant="secondary"
                    onClick={() => alert(`Selected: ${event.title}`)}
                  >
                    View event
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
