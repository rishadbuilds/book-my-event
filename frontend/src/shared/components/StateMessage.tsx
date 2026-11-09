import type { ReactNode } from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border bg-card py-16">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="grid place-items-center rounded-xl border bg-card py-16 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 px-4">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Inbox className="size-6" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action}
      </div>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-destructive/20 bg-card py-16 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 px-4">
        <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
