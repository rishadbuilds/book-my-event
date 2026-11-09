import type { ReactNode } from 'react'
import { CalendarDays, MapPin, ReceiptText, Users } from 'lucide-react'
import { assetUrl } from '@/shared/lib/assets'
import { formatCurrency, formatDate } from '@/shared/lib/format'
import { BookingStatusBadge } from './BookingStatusBadge'
import type { Booking } from '../types/booking.types'

export function BookingCard({
  booking,
  actions,
  showCustomer = false,
}: {
  booking: Booking
  actions?: ReactNode
  showCustomer?: boolean
}) {
  const image = assetUrl(booking.service.image)

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-violet-100 sm:w-36">
          {image ? (
            <img
              src={image}
              alt={booking.service.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-4xl">🎉</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold leading-snug">
                {booking.service.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {booking.service.location}
              </p>
            </div>
            <BookingStatusBadge
              status={booking.status}
              label={booking.statusLabel}
            />
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Event date</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                <CalendarDays className="size-3.5 text-violet-600" />
                {formatDate(booking.eventDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Guests</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                <Users className="size-3.5 text-violet-600" />
                {booking.guestCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold">
                <ReceiptText className="size-3.5 text-violet-600" />
                {formatCurrency(booking.totalPrice)}
              </dd>
            </div>
          </dl>

          {booking.notes && (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              “{booking.notes}”
            </p>
          )}

          {showCustomer && (
            <p className="mt-3 text-sm text-muted-foreground">
              Requested by{' '}
              <span className="font-medium text-foreground">
                {booking.customer.name}
              </span>{' '}
              · {booking.customer.email} · {booking.customer.phone}
            </p>
          )}

          {actions && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
