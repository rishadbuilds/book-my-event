import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { ServiceResponseDto } from '../../dtos/service.dto.js'
import type { Actor } from '../../types/Actor.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import { assertCanManageService } from '../../policies/serviceAccess.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class GetProviderService {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(id: string, actor: Actor): Promise<ServiceResponseDto> {
    const service = await this.services.findById(id)
    if (!service) throw new NotFoundError('Service not found')

    assertCanManageService(service, actor)

    const [response] = await toServiceResponses([service], this.users)
    return response
  }
}
