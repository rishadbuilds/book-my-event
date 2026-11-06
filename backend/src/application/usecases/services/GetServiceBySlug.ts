import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { ServiceResponseDto } from '../../dtos/service.dto.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class GetServiceBySlug {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(slug: string): Promise<ServiceResponseDto> {
    const service = await this.services.findBySlug(slug)

    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found')
    }

    const [response] = await toServiceResponses([service], this.users)
    return response
  }
}
