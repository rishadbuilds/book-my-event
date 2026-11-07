import type { BookingStatus } from '../../shared/constants/Booking.js'
import type { PriceUnit } from '../../shared/constants/Service.js'

export interface Booking {
  id: string
  userId: string
  providerId: string
  serviceId: string
  serviceName: string
  serviceLocation: string
  serviceImage?: string
  unitPrice: number
  priceUnit: PriceUnit
  totalPrice: number
  guestCount: number
  eventDate: Date
  status: BookingStatus
  notes?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  /**
   * When true this booking holds the service's exclusive slot for
   * `eventDate`. Multiple-booking services are created with `isActive: false`,
   * which is how they bypass the partial unique index.
   */
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
