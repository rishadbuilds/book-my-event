import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type {
  BookingResponseDto,
  CreateBookingDto,
} from '../../dtos/booking.dto.js'
import type { Actor } from '../../types/Actor.js'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js'
import { BookingStatus } from '../../../shared/constants/Booking.js'
import { PriceUnit } from '../../../shared/constants/Service.js'
import { startOfUtcDay } from '../../../shared/utils/date.js'
import { BookingMapper } from '../../mappers/BookingMapper.js'

@injectable()
export class CreateBooking {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(
    dto: CreateBookingDto,
    actor: Actor,
  ): Promise<BookingResponseDto> {
    const service = await this.services.findById(dto.serviceId)

    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found')
    }

    if (service.providerId === actor.userId) {
      throw new ValidationError('You cannot book your own service')
    }

    const eventDate = startOfUtcDay(dto.eventDate)
    const today = startOfUtcDay(new Date())

    if (eventDate.getTime() < today.getTime()) {
      throw new ValidationError('Event date cannot be in the past', [
        { field: 'eventDate', message: 'Choose today or a future date' },
      ])
    }

    const isBlocked = service.blockedDates.some(
      (blocked) => startOfUtcDay(blocked).getTime() === eventDate.getTime(),
    )

    if (isBlocked) {
      throw new ValidationError(
        'The provider is unavailable on the selected date',
        [{ field: 'eventDate', message: 'Select another date' }],
      )
    }

    if (!service.allowsMultipleBookings) {
      const unavailable = await this.bookings.findUnavailableServiceIds(
        eventDate,
      )

      // Friendly early check; the partial unique index still protects against
      // two requests racing between this read and the insert.
      if (unavailable.includes(service.id)) {
        throw new ConflictError(
          'This service is already booked for the selected date',
        )
      }
    }

    const customer = await this.users.findById(actor.userId)
    if (!customer) throw new NotFoundError('User not found')

    const customerPhone = dto.phone ?? customer.phone

    if (!customerPhone) {
      throw new ValidationError('Add a contact phone number to book', [
        { field: 'phone', message: 'Phone number is required' },
      ])
    }

    const totalPrice =
      service.priceUnit === PriceUnit.PER_PERSON
        ? service.price * dto.guestCount
        : service.price

    const booking = await this.bookings.create({
      userId: actor.userId,
      providerId: service.providerId,
      serviceId: service.id,
      serviceName: service.name,
      serviceLocation: service.location,
      serviceImage: service.images[0],
      unitPrice: service.price,
      priceUnit: service.priceUnit,
      totalPrice,
      guestCount: dto.guestCount,
      eventDate,
      status: BookingStatus.PENDING,
      notes: dto.notes,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone,
      // Exclusive services lock the day through the partial unique index.
      // Multiple-booking services never participate in that index.
      isActive: !service.allowsMultipleBookings,
    })

    return BookingMapper.toResponse(booking)
  }
}
