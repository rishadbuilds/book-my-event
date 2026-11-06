import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type {
  IServiceRepository,
  UpdateServiceData,
} from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type {
  ServiceResponseDto,
  UpdateServiceDto,
} from '../../dtos/service.dto.js'
import type { Actor } from '../../types/Actor.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import { normalizeDates } from '../../../shared/utils/date.js'
import { assertCanManageService } from '../../policies/serviceAccess.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class UpdateService {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateServiceDto,
    actor: Actor,
  ): Promise<ServiceResponseDto> {
    const existing = await this.services.findById(id)
    if (!existing) throw new NotFoundError('Service not found')

    assertCanManageService(existing, actor)

    const data: UpdateServiceData = {
      ...dto,
      ...(dto.blockedDates
        ? { blockedDates: normalizeDates(dto.blockedDates) }
        : {}),
    }

    const service = await this.services.updateById(id, data)
    if (!service) throw new NotFoundError('Service not found')

    const [response] = await toServiceResponses([service], this.users)
    return response
  }
}
