import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/shared/lib/api-client'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/StateMessage'
import type { PaginationMeta } from '@/shared/types/pagination.types'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { bookingService } from '@/features/bookings/services/booking.service'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_TRANSITIONS,
  type Booking,
  type BookingStatus,
} from '@/features/bookings/types/booking.types'

const PAGE_SIZE = 20

const ACTION_LABELS: Partial<Record<BookingStatus, string>> = {
  confirmed: 'Confirm',
  rejected: 'Reject',
  cancelled: 'Cancel',
  completed: 'Mark completed',
}

export function ProviderBookingsPanel() {
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [page, setPage] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(() => {
    let cancelled = false

    bookingService
      .providerList({ status, page, limit: PAGE_SIZE })
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
            : 'Unable to load provider bookings.',
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

  function changeStatus(next: BookingStatus | '') {
    setLoading(true)
    setError(null)
    setStatus(next)
    setPage(1)
  }

  function changePage(next: number) {
    setLoading(true)
    setError(null)
    setPage(next)
  }

  function retry() {
    setLoading(true)
    setError(null)
    load()
  }

  async function applyStatus(booking: Booking, next: BookingStatus) {
    if (
      next === 'cancelled' &&
      !window.confirm('Cancel this booking? The date will be released.')
    ) {
      return
    }

    setBusy(`${booking.id}:${next}`)
    setActionError(null)
    try {
      const updated = await bookingService.updateStatus(booking.id, next)
      setBookings((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : 'Unable to update this booking.',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Booking requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm availability, reject conflicts, and close out completed
            events.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            changeStatus(event.target.value as BookingStatus | '')
          }
          className="h-8 rounded-lg border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All statuses</option>
          {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
            (value) => (
              <option key={value} value={value}>
                {BOOKING_STATUS_LABELS[value]}
              </option>
            ),
          )}
        </select>
      </div>

      {actionError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <div className="mt-5 space-y-4">
        {loading ? (
          <LoadingState label="Loading bookings…" />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No booking requests"
            description={
              status
                ? `There are no ${BOOKING_STATUS_LABELS[status].toLowerCase()} bookings.`
                : 'New customer requests will appear here.'
            }
          />
        ) : (
          bookings.map((booking) => {
            const transitions = BOOKING_TRANSITIONS[booking.status]

            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                showCustomer
                actions={
                  transitions.length === 0 ? undefined : (
                    <>
                      {transitions.map((next) => {
                        const key = `${booking.id}:${next}`
                        const isBusy = busy === key

                        return (
                          <Button
                            key={next}
                            size="sm"
                            variant={
                              next === 'cancelled' || next === 'rejected'
                                ? 'outline'
                                : 'default'
                            }
                            disabled={busy !== null}
                            onClick={() => void applyStatus(booking, next)}
                          >
                            {isBusy ? (
                              <Loader2 className="animate-spin" />
                            ) : next === 'confirmed' ||
                              next === 'completed' ? (
                              <Check />
                            ) : (
                              <X />
                            )}
                            {ACTION_LABELS[next] ?? next}
                          </Button>
                        )
                      })}
                    </>
                  )
                }
              />
            )
          })
        )}
      </div>

      {meta && !loading && !error && (
        <Pagination meta={meta} onChange={changePage} />
      )}
    </div>
  )
}
