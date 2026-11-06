import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  email: emailSchema,
  password: passwordSchema,
})

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
})

export const resendOtpSchema = z.object({
  email: emailSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type RegisterUserDto = z.infer<typeof registerSchema>
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>
export type ResendOtpDto = z.infer<typeof resendOtpSchema>
export type LoginUserDto = z.infer<typeof loginSchema>

export interface UserResponseDto {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface AuthResponseDto {
  user: UserResponseDto
  accessToken: string
}

export interface RegistrationPendingDto {
  email: string
  message: string
  expiresAt: string
  resendAvailableAt: string
  /** Only present outside production so the flow can be tested without SMTP. */
  devOtp?: string
}
