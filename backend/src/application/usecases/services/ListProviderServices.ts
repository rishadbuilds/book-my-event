import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type {
  ListProviderServicesQueryDto,
  ServiceListDto,
} from '../../dtos/service.dto.js'
import type { Actor } from '../../types/Actor.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import { buildPaginationMeta } from '../../../shared/types/Pagination.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class ListProviderServices {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(
    actor: Actor,
    query: ListProviderServicesQueryDto,
  ): Promise<ServiceListDto> {
    // Providers can only see their own services; admins may filter by any
    // provider or leave it empty to see the whole catalogue.
    const providerId =
      actor.role === UserRole.PROVIDER ? actor.userId : query.providerId

    const { items, total } = await this.services.findMany({
      search: query.q,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
      activeOnly: false,
      providerId,
    })

    return {
      items: await toServiceResponses(items, this.users),
      meta: buildPaginationMeta(query.page, query.limit, total),
    }
  }
}
