export type ServiceCategory =
  | 'venue'
  | 'hotel'
  | 'catering'
  | 'photography'
  | 'dj'
  | 'decoration'
  | 'event-planner'

export type PriceUnit = 'per-event' | 'per-day' | 'per-person' | 'per-hour'

export type ServiceSort = 'newest' | 'price-asc' | 'price-desc'

export interface ServiceProvider {
  id: string
  name: string
  businessName?: string
  avatarUrl?: string
  bio?: string
}

export interface ServiceContact {
  phone: string
  email?: string
}

export interface Service {
  id: string
  providerId: string
  provider: ServiceProvider | null
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
  contact: ServiceContact
  allowsMultipleBookings: boolean
  blockedDates: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceMeta {
  categories: Array<{ value: ServiceCategory; label: string }>
  locations: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  priceUnits: Array<{ value: PriceUnit; label: string }>
}

export interface ServiceListQuery {
  q?: string
  category?: ServiceCategory | ''
  location?: string
  minPrice?: number
  maxPrice?: number
  date?: string
  sort?: ServiceSort
  page?: number
  limit?: number
}

export interface ServiceInput {
  name: string
  category: ServiceCategory
  description: string
  images: string[]
  location: string
  price: number
  priceUnit: PriceUnit
  contact: {
    phone: string
    email?: string
  }
  allowsMultipleBookings: boolean
  blockedDates: string[]
  isActive: boolean
  providerId?: string
}

export type ServiceUpdateInput = Partial<ServiceInput>
