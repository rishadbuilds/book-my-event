import { useState } from 'react'
import type { FormEvent } from 'react'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/lib/api-client'
import { assetUrl } from '@/shared/lib/assets'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceService } from '@/features/services/services/service.service'
import type {
  PriceUnit,
  Service,
  ServiceCategory,
  ServiceInput,
} from '@/features/services/types/service.types'

const CATEGORY_OPTIONS: Array<{ value: ServiceCategory; label: string }> = [
  { value: 'venue', label: 'Venue' },
  { value: 'hotel', label: 'Hotel & resort' },
  { value: 'catering', label: 'Catering' },
  { value: 'photography', label: 'Photography' },
  { value: 'dj', label: 'DJ & music' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'event-planner', label: 'Event planner' },
]

const PRICE_UNIT_OPTIONS: Array<{ value: PriceUnit; label: string }> = [
  { value: 'per-event', label: 'Per event' },
  { value: 'per-day', label: 'Per day' },
  { value: 'per-person', label: 'Per person' },
  { value: 'per-hour', label: 'Per hour' },
]

interface ServiceFormValues {
  name: string
  category: ServiceCategory
  description: string
  location: string
  price: string
  priceUnit: PriceUnit
  contactPhone: string
  contactEmail: string
  allowsMultipleBookings: boolean
  isActive: boolean
  blockedDates: string
  providerId: string
}

function toValues(service?: Service | null): ServiceFormValues {
  return {
    name: service?.name ?? '',
    category: service?.category ?? 'venue',
    description: service?.description ?? '',
    location: service?.location ?? '',
    price: service ? String(service.price) : '',
    priceUnit: service?.priceUnit ?? 'per-event',
    contactPhone: service?.contact.phone ?? '',
    contactEmail: service?.contact.email ?? '',
    allowsMultipleBookings: service?.allowsMultipleBookings ?? false,
    isActive: service?.isActive ?? true,
    blockedDates: (service?.blockedDates ?? []).map((date) => date.slice(0, 10)).join(', '),
    providerId: service?.providerId ?? '',
  }
}

export function ServiceForm({
  service,
  onSaved,
  onCancel,
}: {
  service?: Service | null
  onSaved: (service: Service) => void
  onCancel: () => void
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const editing = Boolean(service)

  const [values, setValues] = useState<ServiceFormValues>(() =>
    toValues(service),
  )
  const [images, setImages] = useState<string[]>(service?.images ?? [])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function update<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)
    try {
      const result = await serviceService.uploadImages([...files])
      setImages((current) => [...current, ...result.images].slice(0, 8))
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : 'Image upload failed.',
      )
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((image) => image !== url))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const price = Number(values.price)
    if (!values.name.trim()) {
      setFieldErrors({ name: 'Service name is required' })
      return
    }
    if (!values.location.trim()) {
      setFieldErrors({ location: 'Location is required' })
      return
    }
    if (values.description.trim().length < 20) {
      setFieldErrors({
        description: 'Description must be at least 20 characters',
      })
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setFieldErrors({ price: 'Enter a valid price' })
      return
    }
    if (!values.contactPhone.trim()) {
      setFieldErrors({ contactPhone: 'Contact phone is required' })
      return
    }

    const blockedDates = values.blockedDates
      .split(/[\n,]+/)
      .map((date) => date.trim())
      .filter(Boolean)

    const payload: ServiceInput = {
      name: values.name.trim(),
      category: values.category,
      description: values.description.trim(),
      images,
      location: values.location.trim(),
      price,
      priceUnit: values.priceUnit,
      contact: {
        phone: values.contactPhone.trim(),
        email: values.contactEmail.trim() || undefined,
      },
      allowsMultipleBookings: values.allowsMultipleBookings,
      blockedDates,
      isActive: values.isActive,
      ...(isAdmin && values.providerId.trim()
        ? { providerId: values.providerId.trim() }
        : {}),
    }

    setSaving(true)
    try {
      const saved = editing
        ? await serviceService.update(service!.id, payload)
        : await serviceService.create(payload)
      onSaved(saved)
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors(cause.fields)
        setError(cause.message)
      } else {
        setError('Unable to save this service.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            {editing ? 'Edit service' : 'New service'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {editing
              ? 'Changes are visible to customers immediately.'
              : 'Add a service customers can discover and book.'}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="service-name">Name</Label>
          <Input
            id="service-name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name && (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-category">Category</Label>
          <select
            id="service-form-category"
            value={values.category}
            onChange={(event) =>
              update('category', event.target.value as ServiceCategory)
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-location">Location</Label>
          <Input
            id="service-form-location"
            value={values.location}
            onChange={(event) => update('location', event.target.value)}
            aria-invalid={Boolean(fieldErrors.location)}
          />
          {fieldErrors.location && (
            <p className="text-xs text-destructive">{fieldErrors.location}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="service-form-description">Description</Label>
          <textarea
            id="service-form-description"
            rows={4}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-invalid={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description && (
            <p className="text-xs text-destructive">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-price">Price (₹)</Label>
          <Input
            id="service-form-price"
            type="number"
            min={0}
            value={values.price}
            onChange={(event) => update('price', event.target.value)}
            aria-invalid={Boolean(fieldErrors.price)}
          />
          {fieldErrors.price && (
            <p className="text-xs text-destructive">{fieldErrors.price}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-unit">Price unit</Label>
          <select
            id="service-form-unit"
            value={values.priceUnit}
            onChange={(event) =>
              update('priceUnit', event.target.value as PriceUnit)
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {PRICE_UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-phone">Contact phone</Label>
          <Input
            id="service-form-phone"
            type="tel"
            value={values.contactPhone}
            onChange={(event) => update('contactPhone', event.target.value)}
            aria-invalid={Boolean(fieldErrors.contactPhone)}
          />
          {fieldErrors.contactPhone && (
            <p className="text-xs text-destructive">
              {fieldErrors.contactPhone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-form-email">
            Contact email{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="service-form-email"
            type="email"
            value={values.contactEmail}
            onChange={(event) => update('contactEmail', event.target.value)}
            aria-invalid={Boolean(fieldErrors['contact.email'])}
          />
          {fieldErrors['contact.email'] && (
            <p className="text-xs text-destructive">
              {fieldErrors['contact.email']}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="service-form-blocked">
            Blocked dates{' '}
            <span className="font-normal text-muted-foreground">
              (comma separated, YYYY-MM-DD)
            </span>
          </Label>
          <Input
            id="service-form-blocked"
            value={values.blockedDates}
            onChange={(event) => update('blockedDates', event.target.value)}
            placeholder="2027-04-01, 2027-04-02"
          />
        </div>

        {isAdmin && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-form-provider">
              Provider ID{' '}
              <span className="font-normal text-muted-foreground">
                (required when creating as admin)
              </span>
            </Label>
            <Input
              id="service-form-provider"
              value={values.providerId}
              onChange={(event) => update('providerId', event.target.value)}
              placeholder="MongoDB ObjectId"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.allowsMultipleBookings}
              onChange={(event) =>
                update('allowsMultipleBookings', event.target.checked)
              }
              className="size-4 accent-violet-600"
            />
            Allow multiple bookings per day
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => update('isActive', event.target.checked)}
              className="size-4 accent-violet-600"
            />
            Visible to customers
          </label>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                void handleUpload(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="mt-2 grid place-items-center rounded-xl border border-dashed py-6 text-sm text-muted-foreground">
            <ImagePlus className="mb-1 size-5" />
            No images yet
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image) => (
              <div
                key={image}
                className="group relative h-20 w-28 overflow-hidden rounded-lg border"
              >
                <img
                  src={assetUrl(image)}
                  alt=""
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {fieldErrors.images && (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.images}</p>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving && <Loader2 className="animate-spin" />}
          {editing ? 'Save changes' : 'Create service'}
        </Button>
      </div>
    </form>
  )
}
