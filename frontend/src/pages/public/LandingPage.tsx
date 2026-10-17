import { Link } from 'react-router-dom'
import { btn, btnLight } from '../../components/ui/buttonStyles'
import EventCard from '../../components/events/EventCard'
import { mockEvents } from '../../features/events/mockEvents'

const categories = ['🎵 Music', '🎭 Theatre', '😂 Comedy', '🍽️ Food', '💼 Business', '🏏 Sports']

const steps = [
  { n: '01', t: 'Discover', d: 'Browse events happening around you.' },
  { n: '02', t: 'Book', d: 'Pick your seats and pay securely.' },
  { n: '03', t: 'Enjoy', d: 'Show your e-ticket and have fun.' },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(109,40,217,0.2),transparent_60%)] px-[6vw] pb-16 pt-24 text-center">
        <h1 className="text-4xl font-extrabold sm:text-6xl">
          Find it. Book it. <em className="not-italic text-brand">Live it.</em>
        </h1>
        <p className="mt-3 text-zinc-500">
          Concerts, comedy, workshops and more, all in one place.
        </p>

        <div className="mx-auto mb-5 mt-7 flex max-w-xl gap-2">
          <input
            placeholder="Search events, artists, venues…"
            className="flex-1 rounded-full border border-zinc-500/40 bg-transparent px-5 py-3 outline-none focus:border-brand"
          />
          <button className={btn}>Search</button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <span key={c} className="rounded-full bg-violet-100 px-4 py-2 text-sm dark:bg-white/10">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="px-[6vw] py-16">
        <h2 className="mb-6 text-3xl font-bold">Trending events</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
          {mockEvents.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-violet-50 px-[6vw] py-16 dark:bg-white/5">
        <h2 className="mb-6 text-3xl font-bold">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <span className="text-3xl font-extrabold text-brand">{s.n}</span>
              <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
              <p className="text-zinc-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-700 to-pink-600 px-[6vw] py-20 text-center text-white">
        <h2 className="mb-2 text-3xl font-bold">Hosting an event?</h2>
        <p className="mb-6 opacity-90">
          List it on BookMyEvent and reach thousands of attendees.
        </p>
        <Link to="/login" className={btnLight}>Get started</Link>
      </section>
    </>
  )
}