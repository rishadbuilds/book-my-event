import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarX2,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ApiError } from '@/shared/lib/api-client'
import { assetUrl } from '@/shared/lib/assets'
import { formatCurrency, formatDate } from '@/shared/lib/format'
import { ErrorState, LoadingState } from '@/shared/components/StateMessage'
import { BookingForm } from '@/features/bookings/components/BookingForm'
import { serviceService } from '../services/service.service'
import type { Service } from '../types/service.types'

interface DetailResult {
  key: string
  service: Service | null
  error: string | null
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [activeImage, setActiveImage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = `${slug ?? ''}|${reloadKey}`
  const [result, setResult] = useState<DetailResult>({
    key: '',
    service: null,
    error: null,
  })

  const loading = result.key !== requestKey
  const service = loading ? null : result.service
  const error = loading ? null : result.error

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    serviceService
      .getBySlug(slug)
      .then((found) => {
        if (cancelled) return
        setResult({ key: requestKey, service: found, error: null })
        setActiveImage(0)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          service: null,
          error:
            cause instanceof ApiError
              ? cause.message
              : 'Unable to load this service.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [slug, requestKey])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <LoadingState label="Loading service details…" />
      </main>
    )
  }

  if (error || !service) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <ErrorState
          message={error ?? 'This service could not be found.'}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/services">
              <ArrowLeft />
              Back to services
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const images = service.images.map(assetUrl).filter(Boolean) as string[]
  const providerName =
    service.provider?.businessName ?? service.provider?.name ?? 'Provider'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/services">
          <ArrowLeft />
          All services
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="aspect-[16/10] bg-primary/15">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={service.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-7xl">
                  🎉
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === activeImage
                        ? 'border-violet-600'
                        : 'border-transparent'
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {service.categoryLabel}
              </span>
              {service.allowsMultipleBookings && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  <Users className="size-3" />
                  Multiple bookings per day
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold">{service.name}</h1>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {service.location}
            </p>

            <Separator className="my-5" />

            <h2 className="text-lg font-bold">About this service</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>

            <Separator className="my-5" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Starting price
                </p>
                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(service.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {service.priceUnitLabel}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Contact
                </p>
                <div className="mt-1 space-y-1 text-sm">
                  <a
                    href={`tel:${service.contact.phone}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Phone className="size-3.5" />
                    {service.contact.phone}
                  </a>
                  {service.contact.email && (
                    <a
                      href={`mailto:${service.contact.email}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Mail className="size-3.5" />
                      {service.contact.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {service.blockedDates.length > 0 && (
              <>
                <Separator className="my-5" />
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <CalendarX2 className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Provider unavailable</p>
                    <p className="mt-1 text-amber-800 dark:text-amber-300">
                      {service.blockedDates.map(formatDate).join(', ')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {service.provider && (
            <div className="mt-6 rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold">Meet the provider</h2>
              <div className="mt-3 flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                  {providerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 font-semibold">
                    {providerName}
                    <BadgeCheck className="size-4 text-primary" />
                  </p>
                  {service.provider.bio && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.provider.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm service={service} />
        </aside>
      </div>
    </main>
  )
}
