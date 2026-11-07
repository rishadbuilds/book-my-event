import { z } from 'zod'
import type { PaginationMeta } from '../../shared/types/Pagination.js'
import {
  BOOKING_STATUS_VALUES,
  BookingStatus,
} from '../../shared/constants/Booking.js'
import type { PriceUnit } from '../../shared/constants/Service.js'
import { objectIdSchema, phoneSchema } from './common.dto.js'

export const bookingIdParamsSchema = z.object({ id: objectIdSchema })

export const createBookingSchema = z.object({
  serviceId: objectIdSchema,
  eventDate: z.coerce.date(),
  guestCount: z.coerce
    .number()
    .int('Guest count must be a whole number')
    .min(1, 'At least one guest is required')
    .max(100_000, 'Guest count is too large'),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional(),
  phone: phoneSchema.optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUS_VALUES),
})

export const listBookingsQuerySchema = z.object({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export const listProviderBookingsQuerySchema = z.object({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  serviceId: objectIdSchema.optional(),
  date: z.coerce.date().optional(),
  providerId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export type CreateBookingDto = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusDto = z.infer<
  typeof updateBookingStatusSchema
>
export type ListBookingsQueryDto = z.infer<typeof listBookingsQuerySchema>
export type ListProviderBookingsQueryDto = z.infer<
  typeof listProviderBookingsQuerySchema
>

export interface BookingCustomerDto {
  name: string
  email: string
  phone: string
}

export interface BookingServiceDto {
  id: string
  name: string
  location: string
  image?: string
  unitPrice: number
  priceUnit: PriceUnit
}

export interface BookingResponseDto {
  id: string
  userId: string
  providerId: string
  service: BookingServiceDto
  eventDate: string
  guestCount: number
  totalPrice: number
  status: BookingStatus
  statusLabel: string
  notes?: string
  customer: BookingCustomerDto
  createdAt: string
  updatedAt: string
}

export interface BookingListDto {
  items: BookingResponseDto[]
  meta: PaginationMeta
}
