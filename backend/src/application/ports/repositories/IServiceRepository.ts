import type { Service } from '../../../domain/entities/Service.js'

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

export interface IServiceRepository {
  create(data: CreateServiceData): Promise<Service>
  findById(id: string): Promise<Service | null>
  findBySlug(slug: string): Promise<Service | null>
  findByProvider(providerId: string): Promise<Service[]>
  updateById(id: string, data: UpdateServiceData): Promise<Service | null>
  deleteById(id: string): Promise<boolean>
}
