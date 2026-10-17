import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export type RegisterUserDto = z.infer<typeof registerSchema>
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