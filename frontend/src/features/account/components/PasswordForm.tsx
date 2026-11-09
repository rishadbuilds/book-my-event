import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/lib/api-client'
import { authService } from '@/features/auth/services/auth.service'

interface PasswordValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const EMPTY: PasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function PasswordForm() {
  const [values, setValues] = useState<PasswordValues>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(field: keyof PasswordValues, value: string) {
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

    const errors: Record<string, string> = {}
    if (!values.currentPassword) {
      errors.currentPassword = 'Enter your current password'
    }
    if (values.newPassword.length < 8) {
      errors.newPassword = 'Use at least 8 characters'
    } else if (
      !/[A-Z]/.test(values.newPassword) ||
      !/[a-z]/.test(values.newPassword) ||
      !/[0-9]/.test(values.newPassword)
    ) {
      errors.newPassword =
        'Include an uppercase letter, a lowercase letter and a number'
    } else if (values.newPassword === values.currentPassword) {
      errors.newPassword = 'Choose a password different from the current one'
    }
    if (values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setValues(EMPTY)
      setSuccess(true)
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors(cause.fields)
        setError(cause.message)
      } else {
        setError('Unable to change your password.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password-current">Current password</Label>
        <Input
          id="password-current"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) => update('currentPassword', event.target.value)}
          aria-invalid={Boolean(fieldErrors.currentPassword)}
        />
        {fieldErrors.currentPassword && (
          <p className="text-xs text-destructive">
            {fieldErrors.currentPassword}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password-new">New password</Label>
          <Input
            id="password-new"
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(event) => update('newPassword', event.target.value)}
            aria-invalid={Boolean(fieldErrors.newPassword)}
          />
          {fieldErrors.newPassword && (
            <p className="text-xs text-destructive">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password-confirm">Confirm new password</Label>
          <Input
            id="password-confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" />
          Password updated
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin" />}
        Update password
      </Button>
    </form>
  )
}
