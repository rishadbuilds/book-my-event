import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type {
  BookingListDto,
  ListBookingsQueryDto,
} from '../../dtos/booking.dto.js'
import type { Actor } from '../../types/Actor.js'
import { buildPaginationMeta } from '../../../shared/types/Pagination.js'
import { BookingMapper } from '../../mappers/BookingMapper.js'

@injectable()
export class ListBookings {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
  ) {}

  async execute(
    actor: Actor,
    query: ListBookingsQueryDto,
  ): Promise<BookingListDto> {
    const { items, total } = await this.bookings.findMany({
      userId: actor.userId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })

    return {
      items: items.map((booking) => BookingMapper.toResponse(booking)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    }
  }
}
