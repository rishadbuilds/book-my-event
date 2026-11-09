import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assetUrl } from '@/shared/lib/assets'
import { formatCurrency } from '@/shared/lib/format'
import type { Service } from '../types/service.types'

const CATEGORY_ACCENTS: Record<string, string> = {
  venue: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  hotel: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  catering:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  photography:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  dj: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300',
  decoration:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'event-planner': 'bg-primary/10 text-primary dark:bg-primary/20',
}

export function ServiceCard({ service }: { service: Service }) {
  const image = assetUrl(service.images[0])
  const providerName = service.provider?.businessName ?? service.provider?.name

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/services/${service.slug}`}
        className="relative block h-44 overflow-hidden bg-primary/15"
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
              'bg-primary/10 text-primary',
          )}
        >
          {service.categoryLabel}
        </span>
        {service.allowsMultipleBookings && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground">
            <Users className="size-3" />
            Multi-booking
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">
          <Link
            to={`/services/${service.slug}`}
            className="hover:text-primary"
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

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
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
