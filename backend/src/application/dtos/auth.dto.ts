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

const phoneSchema = z
  .string()
  .trim()
  .max(20, 'Phone number must be at most 20 characters')
  .refine(
    (value) => value === '' || /^[+\d][\d\s-]{6,19}$/.test(value),
    'Enter a valid phone number',
  )

const avatarUrlSchema = z
  .string()
  .trim()
  .max(500, 'Image URL must be at most 500 characters')
  .refine(
    (value) =>
      value === '' || /^https?:\/\//.test(value) || value.startsWith('/'),
    'Enter a valid image URL',
  )

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

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must be at most 60 characters')
      .optional(),
    phone: phoneSchema.optional(),
    avatarUrl: avatarUrlSchema.optional(),
    bio: z
      .string()
      .trim()
      .max(500, 'Bio must be at most 500 characters')
      .optional(),
    businessName: z
      .string()
      .trim()
      .max(120, 'Business name must be at most 120 characters')
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })

export type RegisterUserDto = z.infer<typeof registerSchema>
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>
export type ResendOtpDto = z.infer<typeof resendOtpSchema>
export type LoginUserDto = z.infer<typeof loginSchema>
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>

export interface UserResponseDto {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  avatarUrl?: string
  bio?: string
  businessName?: string
  createdAt: string
  updatedAt: string
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
