import { cn } from '@/lib/utils'
import type { BookingStatus } from '../types/booking.types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800',
  confirmed:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800',
  rejected:
    'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800',
  cancelled: 'bg-muted text-muted-foreground ring-border',
  completed:
    'bg-primary/10 text-primary ring-violet-200 dark:ring-violet-800',
}

export function BookingStatusBadge({
  status,
  label,
  className,
}: {
  status: BookingStatus
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUS_STYLES[status],
        className,
      )}
    >
      {label ?? status}
    </span>
  )
}
