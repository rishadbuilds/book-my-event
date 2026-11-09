import { apiClient } from '@/shared/lib/api-client'
import { buildQuery } from '@/shared/lib/format'
import type { PaginationMeta } from '@/shared/types/pagination.types'
import type {
  Booking,
  BookingListQuery,
  BookingStatus,
  CreateBookingInput,
  ProviderBookingListQuery,
} from '../types/booking.types'

export const bookingService = {
  create: (input: CreateBookingInput) =>
    apiClient.post<Booking>('/bookings', input),

  list: (query: BookingListQuery = {}) =>
    apiClient.getList<Booking[], PaginationMeta>(
      `/bookings${buildQuery({
        status: query.status,
        page: query.page,
        limit: query.limit,
      })}`,
    ),

  get: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  updateStatus: (id: string, status: BookingStatus) =>
    apiClient.patch<Booking>(`/bookings/${id}/status`, { status }),

  providerList: (query: ProviderBookingListQuery = {}) =>
    apiClient.getList<Booking[], PaginationMeta>(
      `/provider/bookings${buildQuery({
        status: query.status,
        serviceId: query.serviceId,
        date: query.date,
        page: query.page,
        limit: query.limit,
      })}`,
    ),
}
