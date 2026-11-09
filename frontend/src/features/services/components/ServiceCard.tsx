import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assetUrl } from '@/shared/lib/assets'
import { formatCurrency } from '@/shared/lib/format'
import type { Service } from '../types/service.types'

const CATEGORY_ACCENTS: Record<string, string> = {
  venue: 'bg-rose-50 text-rose-700',
  hotel: 'bg-sky-50 text-sky-700',
  catering: 'bg-amber-50 text-amber-700',
  photography: 'bg-indigo-50 text-indigo-700',
  dj: 'bg-fuchsia-50 text-fuchsia-700',
  decoration: 'bg-emerald-50 text-emerald-700',
  'event-planner': 'bg-violet-50 text-violet-700',
}

export function ServiceCard({ service }: { service: Service }) {
  const image = assetUrl(service.images[0])
  const providerName = service.provider?.businessName ?? service.provider?.name

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/services/${service.slug}`}
        className="relative block h-44 overflow-hidden bg-violet-100"
      >
        {image ? (
          <img
            src={image}
            alt={service.name}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-5xl">🎉</div>
        )}
        <span
          className={cn(
            'absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold',
            CATEGORY_ACCENTS[service.category] ??
              'bg-violet-50 text-violet-700',
          )}
        >
          {service.categoryLabel}
        </span>
        {service.allowsMultipleBookings && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700">
            <Users className="size-3" />
            Multi-booking
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">
          <Link
            to={`/services/${service.slug}`}
            className="hover:text-violet-600"
          >
            {service.name}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {service.location}
        </p>

        {providerName && (
          <p className="mt-2 text-xs text-muted-foreground">
            by {providerName}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          {service.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-lg font-bold">
              {formatCurrency(service.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {service.priceUnitLabel}
            </p>
          </div>

          <Button variant="secondary" size="sm" asChild>
            <Link to={`/services/${service.slug}`}>
              <CalendarDays />
              View & book
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
