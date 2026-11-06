import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/shared/lib/api-client'
import { useAuth } from '../hooks/useAuth'
import { registerSchema, toFieldErrors } from '../schemas/auth.schema'
import type { RegisterValues } from '../schemas/auth.schema'
import type { RegistrationPending } from '../types/auth.types'
import { AuthLayout } from './AuthLayout'
import { FormError, FormField, SubmitButtonLabel } from './FormField'
import { OtpVerification } from './OtpVerification'
import { PasswordInput } from './PasswordInput'

const initialValues: RegisterValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterForm() {
  const { register } = useAuth()

  const [values, setValues] = useState<RegisterValues>(initialValues)
  const [pending, setPending] = useState<RegistrationPending | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function update(field: keyof RegisterValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '', form: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues))
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await register({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      })
      setPending(result)
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

  if (pending) {
    return (
      <OtpVerification
        initialPending={pending}
        onBack={() => setPending(null)}
      />
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Join BookMyEvent and never miss an experience worth showing up for."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}

        <FormField id="name" label="Full name" error={errors.name}>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              className="h-10 pl-9"
            />
          </div>
        </FormField>

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

        <FormField
          id="password"
          label="Password"
          error={errors.password}
          hint="At least 8 characters with an uppercase letter, a lowercase letter, and a number."
        >
          <PasswordInput
            id="password"
            value={values.password}
            onChange={(value) => update('password', value)}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            disabled={loading}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="confirmPassword"
            value={values.confirmPassword}
            onChange={(value) => update('confirmPassword', value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            disabled={loading}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <SubmitButtonLabel
            loading={loading}
            label="Continue"
            loadingLabel="Sending code…"
          />
        </Button>
      </form>
    </AuthLayout>
  )
}
