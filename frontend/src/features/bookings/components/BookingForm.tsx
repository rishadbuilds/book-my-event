import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/lib/api-client'
import {
  formatCurrency,
  formatDate,
  formatDateInput,
  todayInputValue,
} from '@/shared/lib/format'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { bookingService } from '../services/booking.service'
import type { Booking } from '../types/booking.types'
import type { Service } from '@/features/services/types/service.types'

interface BookingFormValues {
  eventDate: string
  guestCount: string
  notes: string
  phone: string
}

export function BookingForm({ service }: { service: Service }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  const [values, setValues] = useState<BookingFormValues>({
    eventDate: '',
    guestCount: service.priceUnit === 'per-person' ? '50' : '1',
    notes: '',
    phone: user?.phone ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<Booking | null>(null)

  const blockedDates = useMemo(
    () => new Set(service.blockedDates.map(formatDateInput)),
    [service.blockedDates],
  )

  const guestCount = Number(values.guestCount) || 0
  const estimate =
    service.priceUnit === 'per-person'
      ? service.price * Math.max(guestCount, 0)
      : service.price

  function update<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}

    if (!values.eventDate) {
      errors.eventDate = 'Choose an event date'
    } else if (values.eventDate < todayInputValue()) {
      errors.eventDate = 'Event date cannot be in the past'
    } else if (blockedDates.has(values.eventDate)) {
      errors.eventDate = 'The provider is unavailable on this date'
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      errors.guestCount = 'Enter at least one guest'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const booking = await bookingService.create({
        serviceId: service.id,
        eventDate: values.eventDate,
        guestCount,
        notes: values.notes.trim() || undefined,
        phone: values.phone.trim() || undefined,
      })
      setCreated(booking)
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors(cause.fields)
        setError(cause.message)
      } else {
        setError('Unable to create your booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-3 text-lg font-bold text-emerald-900">
          Booking request sent
        </h2>
        <p className="mt-1 text-sm text-emerald-800">
          {created.service.name} on {formatDate(created.eventDate)} ·{' '}
          {formatCurrency(created.totalPrice)}
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          The provider will review your request. You can track its status in My
          bookings.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/bookings">View my bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/services/${service.slug}`}>Back to service</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-bold">Book this service</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to check availability and send a booking request. It only
          takes a minute.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link
              to="/login"
              state={{ from: `${location.pathname}${location.search}` }}
            >
              Log in to book
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Book this service</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(service.price)} {service.priceUnitLabel}
          </p>
        </div>
        <CalendarCheck className="size-5 text-violet-600" />
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="booking-date">Event date</Label>
          <Input
            id="booking-date"
            type="date"
            min={todayInputValue()}
            value={values.eventDate}
            onChange={(event) => update('eventDate', event.target.value)}
            aria-invalid={Boolean(fieldErrors.eventDate)}
          />
          {fieldErrors.eventDate && (
            <p className="text-xs text-destructive">{fieldErrors.eventDate}</p>
          )}
          {blockedDates.size > 0 && (
            <p className="text-xs text-muted-foreground">
              Unavailable dates:{' '}
              {[...blockedDates].slice(0, 5).map(formatDate).join(', ')}
              {blockedDates.size > 5 ? ` +${blockedDates.size - 5} more` : ''}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-guests">Guests</Label>
          <Input
            id="booking-guests"
            type="number"
            min={1}
            max={100000}
            value={values.guestCount}
            onChange={(event) => update('guestCount', event.target.value)}
            aria-invalid={Boolean(fieldErrors.guestCount)}
          />
          {fieldErrors.guestCount && (
            <p className="text-xs text-destructive">
              {fieldErrors.guestCount}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-phone">
            Contact phone{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="booking-phone"
            type="tel"
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-notes">
            Notes{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <textarea
            id="booking-notes"
            value={values.notes}
            onChange={(event) => update('notes', event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Tell the provider about your event…"
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-violet-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-violet-900">Estimated total</span>
          <span className="text-lg font-bold text-violet-900">
            {formatCurrency(estimate)}
          </span>
        </div>
        {service.priceUnit === 'per-person' && (
          <p className="mt-1 text-xs text-violet-700">
            {formatCurrency(service.price)} × {guestCount || 0} guests
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-5 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="animate-spin" />
            Sending request…
          </>
        ) : (
          <>
            <CalendarCheck />
            Request booking
          </>
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        You won't be charged now. The provider confirms availability first.
      </p>
    </form>
  )
}
