import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import type { IServiceRepository } from '../../ports/repositories/IServiceRepository.js'
import type { Actor } from '../../types/Actor.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import { assertCanManageService } from '../../policies/serviceAccess.js'

@injectable()
export class DeleteService {
  constructor(
    @inject(TOKENS.ServiceRepository)
    private readonly services: IServiceRepository,
  ) {}

  async execute(id: string, actor: Actor): Promise<void> {
    const service = await this.services.findById(id)
    if (!service) throw new NotFoundError('Service not found')

    assertCanManageService(service, actor)

    // Soft delete keeps booking history and links intact. The service
    // disappears from public listings and can be reactivated by its owner.
    const updated = await this.services.updateById(id, { isActive: false })
    if (!updated) throw new NotFoundError('Service not found')
  }
}
