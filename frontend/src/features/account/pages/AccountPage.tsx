import { Link } from 'react-router-dom'
import { CalendarDays, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/hooks/useAuth'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function AccountPage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <main className="min-h-svh bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-semibold text-violet-600"
          >
            <CalendarDays className="size-5" />
            BookMyEvent
          </Link>

          <Button variant="ghost" onClick={logout}>
            <LogOut />
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card>
          <CardHeader className="gap-1 px-6 pt-6">
            <CardTitle className="text-xl">Your account</CardTitle>
            <CardDescription>
              This page is protected. It only renders after the API verifies
              your access token.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <div className="flex items-center gap-4 py-4">
              <div className="grid size-14 place-items-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                {initials(user.name)}
              </div>
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator className="my-2" />

            <dl className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    User ID
                  </dt>
                  <dd className="mt-1 font-mono text-sm">{user.id}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm">{user.email}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm capitalize">{user.role}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Member since
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
