import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  ServiceListQuery,
  ServiceMeta,
  ServiceSort,
} from '../types/service.types'

const SORT_OPTIONS: Array<{ value: ServiceSort; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

interface FiltersState {
  q: string
  category: string
  location: string
  minPrice: string
  maxPrice: string
  date: string
  sort: ServiceSort
}

function toState(value: ServiceListQuery): FiltersState {
  return {
    q: value.q ?? '',
    category: value.category ?? '',
    location: value.location ?? '',
    minPrice: value.minPrice === undefined ? '' : String(value.minPrice),
    maxPrice: value.maxPrice === undefined ? '' : String(value.maxPrice),
    date: value.date ?? '',
    sort: value.sort ?? 'newest',
  }
}

export function ServiceFilters({
  meta,
  value,
  onApply,
  onClear,
}: {
  meta: ServiceMeta | null
  value: ServiceListQuery
  onApply: (next: ServiceListQuery) => void
  onClear: () => void
}) {
  const [form, setForm] = useState<FiltersState>(() => toState(value))

  function update<K extends keyof FiltersState>(
    key: K,
    next: FiltersState[K],
  ) {
    setForm((current) => ({ ...current, [key]: next }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onApply({
      q: form.q.trim() || undefined,
      category: (form.category || undefined) as ServiceListQuery['category'],
      location: form.location || undefined,
      minPrice: form.minPrice === '' ? undefined : Number(form.minPrice),
      maxPrice: form.maxPrice === '' ? undefined : Number(form.maxPrice),
      date: form.date || undefined,
      sort: form.sort,
      page: 1,
    })
  }

  function handleClear() {
    setForm(toState({}))
    onClear()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 pb-4 text-sm font-semibold">
        <SlidersHorizontal className="size-4 text-violet-600" />
        Find the right fit
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="service-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="service-search"
              value={form.q}
              onChange={(event) => update('q', event.target.value)}
              placeholder="Venue, photographer, caterer…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-category">Category</Label>
          <select
            id="service-category"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All categories</option>
            {(meta?.categories ?? []).map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-location">Location</Label>
          <select
            id="service-location"
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Any location</option>
            {(meta?.locations ?? []).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-date">Event date</Label>
          <Input
            id="service-date"
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Price range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={form.minPrice}
              onChange={(event) => update('minPrice', event.target.value)}
              placeholder="Min"
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min={0}
              value={form.maxPrice}
              onChange={(event) => update('maxPrice', event.target.value)}
              placeholder="Max"
              aria-label="Maximum price"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-sort">Sort by</Label>
          <select
            id="service-sort"
            value={form.sort}
            onChange={(event) =>
              update('sort', event.target.value as ServiceSort)
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Search />
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            <X />
            Clear
          </Button>
        </div>
      </div>
    </form>
  )
}
