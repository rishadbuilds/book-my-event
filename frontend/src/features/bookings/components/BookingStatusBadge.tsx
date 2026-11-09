import { cn } from '@/lib/utils'
import type { BookingStatus } from '../types/booking.types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  cancelled: 'bg-gray-100 text-gray-600 ring-gray-200',
  completed: 'bg-violet-50 text-violet-700 ring-violet-200',
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
