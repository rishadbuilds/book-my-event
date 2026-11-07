import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type {
  BookingListDto,
  ListProviderBookingsQueryDto,
} from '../../dtos/booking.dto.js'
import type { Actor } from '../../types/Actor.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import { buildPaginationMeta } from '../../../shared/types/Pagination.js'
import { BookingMapper } from '../../mappers/BookingMapper.js'

@injectable()
export class ListProviderBookings {
  constructor(
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
  ) {}

  async execute(
    actor: Actor,
    query: ListProviderBookingsQueryDto,
  ): Promise<BookingListDto> {
    // Providers are always scoped to their own bookings. Admins may filter
    // by provider or omit the filter to see the whole platform.
    const providerId =
      actor.role === UserRole.PROVIDER ? actor.userId : query.providerId

    const { items, total } = await this.bookings.findMany({
      providerId,
      serviceId: query.serviceId,
      status: query.status,
      date: query.date,
      page: query.page,
      limit: query.limit,
    })

    return {
      items: items.map((booking) => BookingMapper.toResponse(booking)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    }
  }
}
