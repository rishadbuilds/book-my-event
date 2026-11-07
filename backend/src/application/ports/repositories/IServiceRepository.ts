import type { Service } from '../../../domain/entities/Service.js'
import type {
  ServiceCategory,
  ServiceSort,
} from '../../../shared/constants/Service.js'

export interface CreateServiceData {
  providerId: string
  name: string
  category: Service['category']
  description: string
  images?: string[]
  location: string
  price: number
  priceUnit: Service['priceUnit']
  contact: Service['contact']
  allowsMultipleBookings?: boolean
  blockedDates?: Date[]
  isActive?: boolean
}

export interface UpdateServiceData {
  name?: string
  category?: Service['category']
  description?: string
  images?: string[]
  location?: string
  price?: number
  priceUnit?: Service['priceUnit']
  contact?: Service['contact']
  allowsMultipleBookings?: boolean
  blockedDates?: Date[]
  isActive?: boolean
}

export interface ServiceFilters {
  search?: string
  category?: ServiceCategory
  location?: string
  minPrice?: number
  maxPrice?: number
  date?: Date
  sort?: ServiceSort
  page: number
  limit: number
  activeOnly?: boolean
  providerId?: string
  /** Services that already hold an exclusive booking on the requested day. */
  excludeServiceIds?: string[]
}

export interface ServicePage {
  items: Service[]
  total: number
}

export interface ServiceFacets {
  locations: string[]
  minPrice: number | null
  maxPrice: number | null
}

export interface IServiceRepository {
  create(data: CreateServiceData): Promise<Service>
  findById(id: string): Promise<Service | null>
  findBySlug(slug: string): Promise<Service | null>
  findMany(filters: ServiceFilters): Promise<ServicePage>
  getFacets(): Promise<ServiceFacets>
  findByProvider(providerId: string): Promise<Service[]>
  updateById(id: string, data: UpdateServiceData): Promise<Service | null>
  deleteById(id: string): Promise<boolean>
}
