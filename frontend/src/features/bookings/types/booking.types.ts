import type { PriceUnit } from '@/features/services/types/service.types'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'

export interface BookingCustomer {
  name: string
  email: string
  phone: string
}

export interface BookingServiceSnapshot {
  id: string
  name: string
  location: string
  image?: string
  unitPrice: number
  priceUnit: PriceUnit
}

export interface Booking {
  id: string
  userId: string
  providerId: string
  service: BookingServiceSnapshot
  eventDate: string
  guestCount: number
  totalPrice: number
  status: BookingStatus
  statusLabel: string
  notes?: string
  customer: BookingCustomer
  createdAt: string
  updatedAt: string
}

export interface CreateBookingInput {
  serviceId: string
  eventDate: string
  guestCount: number
  notes?: string
  phone?: string
}

export interface BookingListQuery {
  status?: BookingStatus | ''
  page?: number
  limit?: number
}

export interface ProviderBookingListQuery extends BookingListQuery {
  serviceId?: string
  date?: string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

/** Mirrors the backend state machine so buttons never offer invalid moves. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  rejected: [],
  cancelled: [],
  completed: [],
}

export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  'rejected',
  'cancelled',
  'completed',
]
