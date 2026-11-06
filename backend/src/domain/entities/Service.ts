import type {
  PriceUnit,
  ServiceCategory,
} from '../../shared/constants/Service.js'

export interface ServiceContact {
  phone: string
  email?: string
}

export interface Service {
  id: string
  providerId: string
  name: string
  slug: string
  category: ServiceCategory
  description: string
  images: string[]
  location: string
  price: number
  priceUnit: PriceUnit
  contact: ServiceContact
  allowsMultipleBookings: boolean
  blockedDates: Date[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
