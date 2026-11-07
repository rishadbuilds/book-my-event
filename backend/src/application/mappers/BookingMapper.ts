import type { Booking } from '../../domain/entities/Booking.js'
import { BOOKING_STATUS_LABELS } from '../../shared/constants/Booking.js'
import type { BookingResponseDto } from '../dtos/booking.dto.js'

export class BookingMapper {
  static toResponse(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      userId: booking.userId,
      providerId: booking.providerId,
      service: {
        id: booking.serviceId,
        name: booking.serviceName,
        location: booking.serviceLocation,
        image: booking.serviceImage,
        unitPrice: booking.unitPrice,
        priceUnit: booking.priceUnit,
      },
      eventDate: booking.eventDate.toISOString(),
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      notes: booking.notes,
      customer: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
      },
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }
  }
}
