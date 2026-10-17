import { btnSmall } from "../ui/buttonStyles"
import type { EventItem } from "../../features/events/types"

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-violet-50 transition-transform hover:-translate-y-1 dark:bg-white/5">
      <div className="grid h-32 place-items-center bg-gradient-to-br from-violet-700 to-pink-600 text-5xl">
        {event.emoji}
      </div>
      <div className="p-4">
        <span className="text-xs font-bold uppercase text-brand">{event.category}</span>
        <h3 className="mb-1 mt-2 text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-zinc-500">{event.date} · {event.city}</p>
        <div className="mt-3 flex items-center justify-between">
          <strong>₹{event.price}</strong>
          <button className={btnSmall}>Book now</button>
        </div>
      </div>
    </article>
  )
}