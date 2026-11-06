import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ApiError } from '@/shared/lib/api-client'
import { useAuth } from '../hooks/useAuth'
import type { RegistrationPending } from '../types/auth.types'
import { AuthLayout } from './AuthLayout'
import { FormError, SubmitButtonLabel } from './FormField'

interface OtpVerificationProps {
  initialPending: RegistrationPending
  onBack: () => void
}

function secondsUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 1000))
}

export function OtpVerification({
  initialPending,
  onBack,
}: OtpVerificationProps) {
  const { verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()

  const [pending, setPending] = useState(initialPending)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(() =>
    secondsUntil(initialPending.resendAvailableAt),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (code.length !== 6) {
      setError('Enter the 6-digit verification code')
      return
    }

    setVerifying(true)
    setError('')

    try {
      await verifyOtp({ email: pending.email, otp: code })
      navigate('/', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.fields.otp ?? caught.fields.email ?? caught.message)
      } else {
        setError('Unable to verify the code. Please try again.')
      }
      setCode('')
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')

    try {
      const next = await resendOtp(pending.email)
      setPending(next)
      setCooldown(secondsUntil(next.resendAvailableAt))
      setCode('')
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Unable to resend the code. Please try again.',
      )
    } finally {
      setResending(false)
    }
  }

  const expiresAt = new Date(pending.expiresAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <AuthLayout
      title="Check your email"
      description={`We sent a 6-digit verification code to ${pending.email}.`}
      footer={
        <>
          Wrong email?{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Edit your details
          </button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleVerify} noValidate>
        {error && <FormError message={error} />}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification code</span>
            <span className="text-xs text-muted-foreground">
              Expires at {expiresAt}
            </span>
          </div>

          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              setCode(value)
              setError('')
            }}
            disabled={verifying}
            containerClassName="justify-center"
            autoFocus
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="size-11 text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <p className="text-xs text-muted-foreground">
            Paste or type the full code. It can only be used once.
          </p>
        </div>

        {pending.devOtp && (
          <Alert>
            <Info />
            <AlertDescription>
              Development mode: your code is{' '}
              <button
                type="button"
                onClick={() => setCode(pending.devOtp!)}
                className="font-mono font-bold tracking-widest text-foreground underline underline-offset-2"
              >
                {pending.devOtp}
              </button>
              . Set SMTP settings to send real emails.
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={verifying || code.length !== 6}
        >
          <SubmitButtonLabel
            loading={verifying}
            label="Verify and create account"
            loadingLabel="Verifying…"
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
        >
          {resending
            ? 'Sending a new code…'
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : 'Resend code'}
        </Button>
      </form>
    </AuthLayout>
  )
}
