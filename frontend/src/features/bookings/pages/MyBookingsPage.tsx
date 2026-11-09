import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/shared/lib/api-client'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/StateMessage'
import type { PaginationMeta } from '@/shared/types/pagination.types'
import { BookingCard } from '../components/BookingCard'
import { bookingService } from '../services/booking.service'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_TRANSITIONS,
  type Booking,
  type BookingStatus,
} from '../types/booking.types'

const STATUS_TABS: Array<{ value: BookingStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  ...(
    Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]
  ).map((status) => ({ value: status, label: BOOKING_STATUS_LABELS[status] })),
]

const PAGE_SIZE = 12

export default function MyBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') ?? '') as BookingStatus | ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(() => {
    let cancelled = false

    bookingService
      .list({ status, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setBookings(result.data)
        setMeta(result.meta)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError(
          cause instanceof ApiError
            ? cause.message
            : 'Unable to load your bookings.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [status, page])

  useEffect(() => load(), [load])

  function selectStatus(next: BookingStatus | '') {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (next) params.set('status', next)
    setSearchParams(params)
  }

  function changePage(next: number) {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams(searchParams)
    if (next <= 1) params.delete('page')
    else params.set('page', String(next))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retry() {
    setLoading(true)
    setError(null)
    load()
  }

  async function cancelBooking(booking: Booking) {
    if (!window.confirm('Cancel this booking request?')) return

    setBusyId(booking.id)
    setActionError(null)
    try {
      const updated = await bookingService.updateStatus(
        booking.id,
        'cancelled',
      )
      setBookings((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : 'Unable to cancel this booking.',
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track requests and manage upcoming celebrations.
          </p>
        </div>
        <Button asChild>
          <Link to="/services">Book another service</Link>
        </Button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => selectStatus(tab.value)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              status === tab.value
                ? 'bg-violet-600 text-white'
                : 'bg-card text-muted-foreground ring-1 ring-border hover:bg-primary/10',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <div className="mt-5 space-y-4">
        {loading ? (
          <LoadingState label="Loading your bookings…" />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings here yet"
            description={
              status
                ? `You have no ${BOOKING_STATUS_LABELS[status].toLowerCase()} bookings.`
                : 'When you request a service, it will show up here.'
            }
            action={
              <Button asChild>
                <Link to="/services">Browse services</Link>
              </Button>
            }
          />
        ) : (
          bookings.map((booking) => {
            const canCancel = BOOKING_TRANSITIONS[booking.status].includes(
              'cancelled',
            )

            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                actions={
                  canCancel ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === booking.id}
                      onClick={() => void cancelBooking(booking)}
                    >
                      {busyId === booking.id && (
                        <Loader2 className="animate-spin" />
                      )}
                      Cancel booking
                    </Button>
                  ) : undefined
                }
              />
            )
          })
        )}
      </div>

      {meta && !loading && !error && (
        <Pagination meta={meta} onChange={changePage} />
      )}
    </main>
  )
}
