import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type {
  CreateServiceDto,
  ServiceResponseDto,
} from '../../dtos/service.dto.js'
import type { Actor } from '../../types/Actor.js'
import { ValidationError } from '../../../domain/errors/AppError.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import { PriceUnit } from '../../../shared/constants/Service.js'
import { normalizeDates } from '../../../shared/utils/date.js'
import { toServiceResponses } from './serviceHelpers.js'

@injectable()
export class CreateService {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(
    dto: CreateServiceDto,
    actor: Actor,
  ): Promise<ServiceResponseDto> {
    const providerId = await this.resolveProviderId(dto, actor)

    const service = await this.services.create({
      providerId,
      name: dto.name,
      category: dto.category,
      description: dto.description,
      images: dto.images ?? [],
      location: dto.location,
      price: dto.price,
      priceUnit: dto.priceUnit ?? PriceUnit.PER_EVENT,
      contact: dto.contact,
      allowsMultipleBookings: dto.allowsMultipleBookings ?? false,
      blockedDates: dto.blockedDates ? normalizeDates(dto.blockedDates) : [],
      isActive: dto.isActive ?? true,
    })

    const [response] = await toServiceResponses([service], this.users)
    return response
  }

  private async resolveProviderId(
    dto: CreateServiceDto,
    actor: Actor,
  ): Promise<string> {
    if (actor.role === UserRole.PROVIDER) return actor.userId

    if (!dto.providerId) {
      throw new ValidationError('Select the provider this service belongs to', [
        { field: 'providerId', message: 'Provider is required' },
      ])
    }

    const provider = await this.users.findById(dto.providerId)

    if (!provider || provider.role !== UserRole.PROVIDER) {
      throw new ValidationError('Select a valid provider account', [
        { field: 'providerId', message: 'Provider not found' },
      ])
    }

    return provider.id
  }
}
