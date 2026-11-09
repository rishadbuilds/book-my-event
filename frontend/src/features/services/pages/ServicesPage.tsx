import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ApiError } from '@/shared/lib/api-client'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/StateMessage'
import type { PaginationMeta } from '@/shared/types/pagination.types'
import { ServiceCard } from '../components/ServiceCard'
import { ServiceFilters } from '../components/ServiceFilters'
import { serviceService } from '../services/service.service'
import type {
  Service,
  ServiceListQuery,
  ServiceMeta,
  ServiceSort,
} from '../types/service.types'

const PAGE_SIZE = 12

function parseQuery(params: URLSearchParams): ServiceListQuery {
  const number = (key: string) => {
    const raw = params.get(key)
    if (raw === null || raw === '') return undefined
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
  }

  return {
    q: params.get('q') ?? undefined,
    category:
      (params.get('category') as ServiceListQuery['category']) || undefined,
    location: params.get('location') ?? undefined,
    minPrice: number('minPrice'),
    maxPrice: number('maxPrice'),
    date: params.get('date') ?? undefined,
    sort: (params.get('sort') as ServiceSort) || 'newest',
    page: number('page') ?? 1,
    limit: PAGE_SIZE,
  }
}

function toSearchParams(query: ServiceListQuery): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of [
    'q',
    'category',
    'location',
    'minPrice',
    'maxPrice',
    'date',
    'sort',
  ] as const) {
    const value = query[key]
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  if (query.page && query.page > 1) params.set('page', String(query.page))

  return params
}

interface ServicesResult {
  key: string
  services: Service[]
  meta: PaginationMeta | null
  error: string | null
}

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsKey = searchParams.toString()
  const query = useMemo(
    () => parseQuery(new URLSearchParams(paramsKey)),
    [paramsKey],
  )

  const [filterMeta, setFilterMeta] = useState<ServiceMeta | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${paramsKey}|${reloadToken}`
  const [result, setResult] = useState<ServicesResult>({
    key: '',
    services: [],
    meta: null,
    error: null,
  })

  const loading = result.key !== requestKey
  const services = loading ? [] : result.services
  const meta = loading ? null : result.meta
  const error = loading ? null : result.error

  useEffect(() => {
    let cancelled = false

    serviceService
      .meta()
      .then((metaResult) => {
        if (!cancelled) setFilterMeta(metaResult)
      })
      .catch(() => {
        // Filters still work with the built-in defaults.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    serviceService
      .list(query)
      .then((response) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          services: response.data,
          meta: response.meta,
          error: null,
        })
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          services: [],
          meta: null,
          error:
            cause instanceof ApiError
              ? cause.message
              : 'Unable to load services right now.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [query, requestKey])

  const applyFilters = useCallback(
    (next: ServiceListQuery) => {
      setSearchParams(toSearchParams({ ...next, page: 1 }))
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const changePage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams)
      if (page <= 1) next.delete('page')
      else next.set('page', String(page))
      setSearchParams(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [searchParams, setSearchParams],
  )

  return (

    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* Hero Section */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-neutral-950 px-6 py-10 text-white dark:bg-black md:px-10">
        <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-neutral-500/10 blur-3xl" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            Every celebration, one place
          </p>

          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold md:text-5xl">
            Find the perfect team for your next event
          </h1>

          <p className="mt-3 max-w-xl text-sm text-neutral-300 md:text-base">
            Compare venues, caterers, photographers, DJs and more. Check live
            availability and book in minutes.
          </p>
        </div>
      </section>

      {/* Filters */}
      <ServiceFilters
        key={paramsKey}
        meta={filterMeta}
        value={query}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      {/* Results Heading */}
      <div className="mt-8 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">
          {query.q ? `Results for “${query.q}”` : 'Available services'}
        </h2>

        {meta && (
          <p className="text-sm text-muted-foreground">
            {meta.total} service{meta.total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* Services Results */}
      <div className="mt-5">
        {loading ? (
          <LoadingState label="Finding services…" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadToken((token) => token + 1)}
          />
        ) : services.length === 0 ? (
          <EmptyState
            title="No services match those filters"
            description="Try widening your price range, choosing another category, or clearing the filters."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {meta && <Pagination meta={meta} onChange={changePage} />}
          </>
        )}
      </div>
    </main>

  )
}
