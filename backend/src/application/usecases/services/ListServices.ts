import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IBookingRepository } from '../../ports/repositories/IBookingRepository.js'
import type {
  ListServicesQueryDto,
  ServiceListDto,
} from '../../dtos/service.dto.js'
import { buildPaginationMeta } from '../../../shared/types/Pagination.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class ListServices {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.BookingRepository)
    private readonly bookings: IBookingRepository,
  ) {}

  async execute(query: ListServicesQueryDto): Promise<ServiceListDto> {
    const excludeServiceIds = query.date
      ? await this.bookings.findUnavailableServiceIds(query.date)
      : undefined

    const { items, total } = await this.services.findMany({
      search: query.q,
      category: query.category,
      location: query.location,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      date: query.date,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
      activeOnly: true,
      excludeServiceIds,
    })

    return {
      items: await toServiceResponses(items, this.users),
      meta: buildPaginationMeta(query.page, query.limit, total),
    }
  }
}
