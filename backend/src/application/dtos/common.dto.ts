import { z } from 'zod'

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid identifier')

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')

export const phoneSchema = z
  .string()
  .trim()
  .max(20, 'Phone number must be at most 20 characters')
  .regex(/^[+\d][\d\s-]{6,19}$/, 'Enter a valid phone number')
