import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-violet-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-fuchsia-400/20 blur-3xl"
        />

        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 text-xl font-semibold"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-white/15">
            <CalendarDays className="size-5" />
          </span>
          BookMyEvent
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            Experiences worth showing up for
          </p>
          <h2 className="text-4xl leading-tight font-bold">
            Discover events. Create memories.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-violet-100">
            Concerts, workshops, weddings, and everything in between — all in
            one place, ready when you are.
          </p>
        </div>

        <p className="relative z-10 text-xs text-violet-200">
          © {new Date().getFullYear()} BookMyEvent
        </p>
      </aside>

      <section className="flex items-center justify-center bg-background px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-lg font-semibold lg:hidden"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
              <CalendarDays className="size-4" />
            </span>
            BookMyEvent
          </Link>

          <Card className="w-full">
            <CardHeader className="gap-1.5 px-6 pt-6 sm:px-8 sm:pt-8">
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="px-6 pt-6 pb-6 sm:px-8 sm:pb-8">
              {children}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  )
}
