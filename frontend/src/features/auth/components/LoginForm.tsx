import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/shared/lib/api-client'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, toFieldErrors } from '../schemas/auth.schema'
import type { LoginValues } from '../schemas/auth.schema'
import { AuthLayout } from './AuthLayout'
import { FormError, FormField, SubmitButtonLabel } from './FormField'
import { PasswordInput } from './PasswordInput'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/'

  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function update(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '', form: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues))
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(parsed.data)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(
          Object.keys(error.fields).length
            ? error.fields
            : { form: error.message },
        )
      } else {
        setErrors({
          form: 'Unable to reach the server. Please try again.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your BookMyEvent account to keep exploring."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}

        <FormField id="email" label="Email address" error={errors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              className="h-10 pl-9"
            />
          </div>
        </FormField>

        <FormField id="password" label="Password" error={errors.password}>
          <PasswordInput
            id="password"
            value={values.password}
            onChange={(value) => update('password', value)}
            invalid={Boolean(errors.password)}
            disabled={loading}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <SubmitButtonLabel
            loading={loading}
            label="Sign in"
            loadingLabel="Signing in…"
          />
        </Button>
      </form>
    </AuthLayout>
  )
}
