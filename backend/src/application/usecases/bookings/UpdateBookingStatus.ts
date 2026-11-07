import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type {
  BookingResponseDto,
  UpdateBookingStatusDto,
} from '../../dtos/booking.dto.js'
import type { Actor } from '../../types/Actor.js'
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/AppError.js'
import { TERMINAL_BOOKING_STATUSES } from '../../../shared/constants/Booking.js'
import { assertCanChangeBookingStatus } from '../../policies/bookingAccess.js'
import { BookingMapper } from '../../mappers/BookingMapper.js'

@injectable()
export class UpdateBookingStatus {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateBookingStatusDto,
    actor: Actor,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookings.findById(id)
    if (!booking) throw new NotFoundError('Booking not found')

    assertCanChangeBookingStatus(booking, dto.status, actor)

    // Terminal states release the exclusive date slot. Pending and confirmed
    // keep the slot for exclusive services; multiple-booking rows stay false.
    const isActive = TERMINAL_BOOKING_STATUSES.includes(dto.status)
      ? false
      : booking.isActive

    const updated = await this.bookings.transition(
      id,
      booking.status,
      dto.status,
      isActive,
    )

    if (!updated) {
      throw new ConflictError(
        'This booking was updated by someone else. Refresh and try again.',
      )
    }

    return BookingMapper.toResponse(updated)
  }
}
