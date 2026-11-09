import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/shared/lib/api-client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { serviceService } from '@/features/services/services/service.service'
import type { Service } from '@/features/services/types/service.types'

const categories = [
  { value: 'venue', label: 'Venues', emoji: '🏛️' },
  { value: 'hotel', label: 'Hotels', emoji: '🏨' },
  { value: 'catering', label: 'Catering', emoji: '🍽️' },
  { value: 'photography', label: 'Photography', emoji: '📸' },
  { value: 'dj', label: 'DJs & music', emoji: '🎧' },
  { value: 'decoration', label: 'Decoration', emoji: '🎀' },
  { value: 'event-planner', label: 'Planners', emoji: '🗂️' },
]

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description:
      'Search by category, location, price, or the date you need. Availability is checked live.',
  },
  {
    icon: CalendarCheck,
    title: 'Request',
    description:
      'Send a booking request with your date and guest count. No payment is taken up front.',
  },
  {
    icon: ShieldCheck,
    title: 'Celebrate',
    description:
      'The provider confirms the details, you track everything from your dashboard, and the big day is yours.',
  },
]

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const [featured, setFeatured] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    serviceService
      .list({ sort: 'newest', limit: 3 })
      .then((result) => {
        if (!cancelled) setFeatured(result.data)
      })
      .catch((cause: unknown) => {
        if (!cancelled && cause instanceof ApiError) setFeatured([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-500 px-4 py-20 text-white md:px-6 md:py-28">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            Your next great memory starts here
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
            Discover services.
            <span className="block text-violet-100">
              Create unforgettable events.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-violet-100">
            Venues, catering, photography, music, and more — compare trusted
            providers, check live availability, and book in minutes.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/services">
                Explore services
                <ArrowRight />
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link to="/register">Create a free account</Link>
              </Button>
            )}
          </div>

          {isAuthenticated && user && (
            <p className="mt-5 text-sm text-violet-100">
              Signed in as {user.name}.{' '}
              <Link to="/bookings" className="font-semibold underline">
                View your bookings
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to bring the celebration together.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/services">
              See all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.value}
              to={`/services?category=${category.value}`}
              className="group rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
            >
              <span className="text-3xl">{category.emoji}</span>
              <p className="mt-2 text-sm font-semibold group-hover:text-violet-700">
                {category.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">
                Newest on BookMyEvent
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Freshly added services from our providers.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/services?sort=newest">
                View all services
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-2xl bg-gray-100"
                />
              ))
            ) : featured.length === 0 ? (
              <p className="col-span-full rounded-xl border bg-gray-50 p-8 text-center text-sm text-muted-foreground">
                No services are listed yet. Check back soon.
              </p>
            ) : (
              featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-center text-2xl font-extrabold md:text-3xl">
          Booking made simple
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <step.icon className="size-5" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <div className="rounded-3xl bg-gray-900 px-6 py-10 text-center text-white md:px-10">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Ready to plan your next event?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-300">
            Create an account to book services and keep every request in one
            place.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to={isAuthenticated ? '/services' : '/register'}>
              {isAuthenticated ? 'Browse services' : 'Get started free'}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
