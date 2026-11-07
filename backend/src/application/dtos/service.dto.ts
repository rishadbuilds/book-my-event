import { z } from 'zod'
import type { PaginationMeta } from '../../shared/types/Pagination.js'
import {
  PriceUnit,
  ServiceCategory,
  ServiceSort,
} from '../../shared/constants/Service.js'
import { emailSchema, objectIdSchema, phoneSchema } from './common.dto.js'

const imageUrlSchema = z
  .string()
  .trim()
  .max(500, 'Image URL must be at most 500 characters')
  .refine(
    (value) => /^https?:\/\//.test(value) || value.startsWith('/'),
    'Enter a valid image URL',
  )

export const idParamsSchema = z.object({ id: objectIdSchema })

export const slugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Service slug is required')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Invalid service slug'),
})

const serviceFields = {
  name: z
    .string()
    .trim()
    .min(2, 'Service name must be at least 2 characters')
    .max(120, 'Service name must be at most 120 characters'),
  category: z.nativeEnum(ServiceCategory),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  images: z
    .array(imageUrlSchema)
    .max(8, 'A service can have at most 8 images'),
  location: z
    .string()
    .trim()
    .min(2, 'Location is required')
    .max(120, 'Location must be at most 120 characters'),
  price: z
    .number()
    .nonnegative('Price cannot be negative')
    .max(100_000_000, 'Price is too large'),
  priceUnit: z.nativeEnum(PriceUnit),
  contact: z.object({
    phone: phoneSchema,
    email: emailSchema.optional(),
  }),
  allowsMultipleBookings: z.boolean(),
  blockedDates: z.array(z.coerce.date()).max(365),
  isActive: z.boolean(),
}

const optionalServiceFields = {
  images: serviceFields.images.optional(),
  priceUnit: serviceFields.priceUnit.optional(),
  allowsMultipleBookings: serviceFields.allowsMultipleBookings.optional(),
  blockedDates: serviceFields.blockedDates.optional(),
  isActive: serviceFields.isActive.optional(),
}

export const createServiceSchema = z.object({
  ...serviceFields,
  ...optionalServiceFields,
  providerId: objectIdSchema.optional(),
})

export const updateServiceSchema = z
  .object(serviceFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
  })

export const listServicesQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    category: z.nativeEnum(ServiceCategory).optional(),
    location: z.string().trim().max(120).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    date: z.coerce.date().optional(),
    sort: z.nativeEnum(ServiceSort).default(ServiceSort.NEWEST),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: 'Minimum price cannot be greater than maximum price',
      path: ['minPrice'],
    },
  )

export const listProviderServicesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  sort: z.nativeEnum(ServiceSort).default(ServiceSort.NEWEST),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  providerId: objectIdSchema.optional(),
})

export type CreateServiceDto = z.infer<typeof createServiceSchema>
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>
export type ListServicesQueryDto = z.infer<typeof listServicesQuerySchema>
export type ListProviderServicesQueryDto = z.infer<
  typeof listProviderServicesQuerySchema
>

export interface ServiceProviderDto {
  id: string
  name: string
  businessName?: string
  avatarUrl?: string
  bio?: string
}

export interface ServiceResponseDto {
  id: string
  providerId: string
  provider: ServiceProviderDto | null
  name: string
  slug: string
  category: ServiceCategory
  categoryLabel: string
  description: string
  images: string[]
  location: string
  price: number
  priceUnit: PriceUnit
  priceUnitLabel: string
  contact: {
    phone: string
    email?: string
  }
  allowsMultipleBookings: boolean
  blockedDates: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceListDto {
  items: ServiceResponseDto[]
  meta: PaginationMeta
}

export interface ServiceMetaDto {
  categories: Array<{ value: ServiceCategory; label: string }>
  locations: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  priceUnits: Array<{ value: PriceUnit; label: string }>
}
