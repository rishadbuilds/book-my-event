import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type { BookingResponseDto } from '../../dtos/booking.dto.js'
import type { Actor } from '../../types/Actor.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import { assertCanViewBooking } from '../../policies/bookingAccess.js'
import { BookingMapper } from '../../mappers/BookingMapper.js'

@injectable()
export class GetBooking {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
  ) {}

  async execute(id: string, actor: Actor): Promise<BookingResponseDto> {
    const booking = await this.bookings.findById(id)
    if (!booking) throw new NotFoundError('Booking not found')

    assertCanViewBooking(booking, actor)

    return BookingMapper.toResponse(booking)
  }
}
