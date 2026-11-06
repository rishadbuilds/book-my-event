import type { Service } from '../../../domain/entities/Service.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { ServiceResponseDto } from '../../dtos/service.dto.js'
import { ServiceMapper } from '../../mappers/ServiceMapper.js'

/**
 * Batch-loads provider summaries so list endpoints avoid N+1 queries.
 */
export async function toServiceResponses(
  services: Service[],
  users: IUserRepository,
): Promise<ServiceResponseDto[]> {
  const providerIds = [...new Set(services.map((service) => service.providerId))]
  const providers = await users.findSummariesByIds(providerIds)
  const providersById = new Map(
    providers.map((provider) => [provider.id, provider]),
  )

  return services.map((service) =>
    ServiceMapper.toResponse(
      service,
      providersById.get(service.providerId) ?? null,
    ),
  )
}
