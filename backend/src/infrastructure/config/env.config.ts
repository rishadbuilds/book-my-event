import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('BookMyEvent <no-reply@bookmyevent.local>'),

  UPLOAD_DIR: z.string().min(1).default('uploads'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().positive().max(25).default(5),
  UPLOAD_MAX_FILES: z.coerce.number().int().positive().max(8).default(6),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n')
  // Fail fast: a misconfigured environment should never boot.
  throw new Error(`Invalid environment configuration:\n${issues}`)
}

const data = parsed.data

if (data.NODE_ENV === 'production' && !data.SMTP_HOST) {
  throw new Error(
    'SMTP_HOST must be configured in production so OTP emails can be delivered',
  )
}

export const env = {
  nodeEnv: data.NODE_ENV,
  port: data.PORT,
  mongoUri: data.MONGODB_URI,
  jwt: {
    secret: data.JWT_SECRET,
    expiresIn: data.JWT_EXPIRES_IN,
  },
  frontendUrl: data.FRONTEND_URL,
  isProduction: data.NODE_ENV === 'production',
  otp: {
    ttlMinutes: data.OTP_TTL_MINUTES,
    maxAttempts: data.OTP_MAX_ATTEMPTS,
    resendCooldownSeconds: data.OTP_RESEND_COOLDOWN_SECONDS,
  },
  smtp: data.SMTP_HOST
    ? {
        host: data.SMTP_HOST,
        port: data.SMTP_PORT ?? 587,
        user: data.SMTP_USER,
        pass: data.SMTP_PASS,
        from: data.EMAIL_FROM,
      }
    : null,
  uploads: {
    dir: data.UPLOAD_DIR,
    maxFileSizeBytes: Math.round(data.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024),
    maxFiles: data.UPLOAD_MAX_FILES,
  },
} as const

export type Env = typeof env
