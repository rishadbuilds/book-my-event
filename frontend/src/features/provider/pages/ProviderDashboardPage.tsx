import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/shared/lib/api-client'
import { assetUrl } from '@/shared/lib/assets'
import { formatCurrency } from '@/shared/lib/format'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/StateMessage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceService } from '@/features/services/services/service.service'
import type { Service } from '@/features/services/types/service.types'
import { ProviderBookingsPanel } from '../components/ProviderBookingsPanel'
import { ServiceForm } from '../components/ServiceForm'

type Tab = 'services' | 'bookings'

export default function ProviderDashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('services')

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(() => {
    let cancelled = false

    serviceService
      .providerList({ limit: 100 })
      .then((result) => {
        if (cancelled) return
        setServices(result.data)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError(
          cause instanceof ApiError
            ? cause.message
            : 'Unable to load your services.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  function retry() {
    setLoading(true)
    setError(null)
    load()
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setFormOpen(true)
  }

  function handleSaved(saved: Service) {
    setServices((current) => {
      const exists = current.some((service) => service.id === saved.id)
      return exists
        ? current.map((service) => (service.id === saved.id ? saved : service))
        : [saved, ...current]
    })
    setFormOpen(false)
    setEditing(null)
  }

  async function toggleActive(service: Service) {
    setBusyId(service.id)
    setActionError(null)
    try {
      const updated = await serviceService.update(service.id, {
        isActive: !service.isActive,
      })
      setServices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : 'Unable to update this service.',
      )
    } finally {
      setBusyId(null)
    }
  }

  async function removeService(service: Service) {
    if (
      !window.confirm(
        `Remove “${service.name}” from customer listings? Existing bookings are kept.`,
      )
    ) {
      return
    }

    setBusyId(service.id)
    setActionError(null)
    try {
      await serviceService.remove(service.id)
      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? { ...item, isActive: false } : item,
        ),
      )
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : 'Unable to remove this service.',
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            {user?.role === 'admin' ? 'Admin' : 'Provider'} dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your services and respond to booking requests.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link to="/services">
            <CalendarDays />
            View public listings
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex gap-2 border-b">
        {(
          [
            { value: 'services', label: 'Services' },
            { value: 'bookings', label: 'Bookings' },
          ] as Array<{ value: Tab; label: string }>
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === item.value
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'bookings' ? (
        <div className="mt-6">
          <ProviderBookingsPanel />
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Your services</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {services.length} service{services.length === 1 ? '' : 's'} ·{' '}
                {services.filter((service) => service.isActive).length} live
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus />
              New service
            </Button>
          </div>

          {actionError && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}

          {formOpen && (
            <div className="mt-5">
              <ServiceForm
                service={editing}
                onSaved={handleSaved}
                onCancel={() => {
                  setFormOpen(false)
                  setEditing(null)
                }}
              />
            </div>
          )}

          <div className="mt-5 space-y-3">
            {loading ? (
              <LoadingState label="Loading your services…" />
            ) : error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : services.length === 0 ? (
              <EmptyState
                title="No services yet"
                description="Create your first service so customers can find and book you."
                action={
                  <Button onClick={openCreate}>
                    <Plus />
                    New service
                  </Button>
                }
              />
            ) : (
              services.map((service) => {
                const image = assetUrl(service.images[0])
                const busy = busyId === service.id

                return (
                  <article
                    key={service.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-violet-100 sm:w-32">
                      {image ? (
                        <img
                          src={image}
                          alt={service.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-3xl">
                          🎉
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{service.name}</h3>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            service.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {service.isActive ? 'Live' : 'Hidden'}
                        </span>
                        {service.allowsMultipleBookings && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                            Multi-booking
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.categoryLabel} · {service.location}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatCurrency(service.price)}{' '}
                        <span className="font-normal text-muted-foreground">
                          {service.priceUnitLabel}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => openEdit(service)}
                      >
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => void toggleActive(service)}
                      >
                        {busy ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Power />
                        )}
                        {service.isActive ? 'Hide' : 'Publish'}
                      </Button>
                      {service.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => void removeService(service)}
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      )}
    </main>
  )
}
