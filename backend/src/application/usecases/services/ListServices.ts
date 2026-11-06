import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
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
  ) {}

  async execute(query: ListServicesQueryDto): Promise<ServiceListDto> {
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
    })

    return {
      items: await toServiceResponses(items, this.users),
      meta: buildPaginationMeta(query.page, query.limit, total),
    }
  }
}
