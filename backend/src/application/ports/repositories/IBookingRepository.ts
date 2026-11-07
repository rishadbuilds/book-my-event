import type { Booking } from '../../../domain/entities/Booking.js'
import type { BookingStatus } from '../../../shared/constants/Booking.js'

export interface CreateBookingData {
  userId: string
  providerId: string
  serviceId: string
  serviceName: string
  serviceLocation: string
  serviceImage?: string
  unitPrice: number
  priceUnit: Booking['priceUnit']
  totalPrice: number
  guestCount: number
  eventDate: Date
  status: BookingStatus
  notes?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  isActive: boolean
}

export interface BookingFilters {
  userId?: string
  providerId?: string
  serviceId?: string
  status?: BookingStatus
  date?: Date
  page: number
  limit: number
}

export interface BookingPage {
  items: Booking[]
  total: number
}

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<Booking>
  findById(id: string): Promise<Booking | null>
  findMany(filters: BookingFilters): Promise<BookingPage>
  /** Exclusive services already reserved on the given calendar day. */
  findUnavailableServiceIds(eventDate: Date): Promise<string[]>
  /**
   * Updates the status only if the booking is still in `fromStatus`.
   * Returns null when another request already changed it.
   */
  transition(
    id: string,
    fromStatus: BookingStatus,
    status: BookingStatus,
    isActive: boolean,
  ): Promise<Booking | null>
}
