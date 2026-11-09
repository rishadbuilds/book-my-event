import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/lib/api-client'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface ProfileValues {
  name: string
  phone: string
  avatarUrl: string
  bio: string
  businessName: string
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth()

  const [values, setValues] = useState<ProfileValues>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    avatarUrl: user?.avatarUrl ?? '',
    bio: user?.bio ?? '',
    businessName: user?.businessName ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const isProvider = user?.role === 'provider'

  function update(field: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setSuccess(false)
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (values.name.trim().length < 2) {
      setFieldErrors({ name: 'Name must be at least 2 characters' })
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: values.name.trim(),
        phone: values.phone.trim(),
        avatarUrl: values.avatarUrl.trim(),
        bio: values.bio.trim(),
        ...(isProvider ? { businessName: values.businessName.trim() } : {}),
      })
      setSuccess(true)
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors(cause.fields)
        setError(cause.message)
      } else {
        setError('Unable to save your profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name && (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-avatar">Avatar URL</Label>
          <Input
            id="profile-avatar"
            value={values.avatarUrl}
            onChange={(event) => update('avatarUrl', event.target.value)}
            placeholder="https://… or /uploads/…"
            aria-invalid={Boolean(fieldErrors.avatarUrl)}
          />
          {fieldErrors.avatarUrl && (
            <p className="text-xs text-destructive">{fieldErrors.avatarUrl}</p>
          )}
        </div>

        {isProvider && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="profile-business">Business name</Label>
            <Input
              id="profile-business"
              value={values.businessName}
              onChange={(event) => update('businessName', event.target.value)}
              aria-invalid={Boolean(fieldErrors.businessName)}
            />
            {fieldErrors.businessName && (
              <p className="text-xs text-destructive">
                {fieldErrors.businessName}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-bio">Bio</Label>
          <textarea
            id="profile-bio"
            rows={3}
            maxLength={500}
            value={values.bio}
            onChange={(event) => update('bio', event.target.value)}
            placeholder="Tell customers a little about yourself…"
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {fieldErrors.bio && (
            <p className="text-xs text-destructive">{fieldErrors.bio}</p>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          Profile updated
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin" />}
        Save profile
      </Button>
    </form>
  )
}
