import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '@/shared/types/pagination.types'

export function Pagination({
  meta,
  onChange,
}: {
  meta: PaginationMeta
  onChange: (page: number) => void
}) {
  if (meta.totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} result
        {meta.total === 1 ? '' : 's'}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
