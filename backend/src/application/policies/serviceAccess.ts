import { ForbiddenError } from '../../domain/errors/AppError.js'
import type { Service } from '../../domain/entities/Service.js'
import { UserRole } from '../../shared/constants/Roles.js'
import type { Actor } from '../types/Actor.js'

/**
 * Providers may only manage their own services. Admins may manage any
 * service. Ownership is enforced here, not in controllers.
 */
export function assertCanManageService(
  service: Service,
  actor: Actor,
): void {
  if (actor.role === UserRole.ADMIN) return

  if (actor.role === UserRole.PROVIDER && service.providerId === actor.userId) {
    return
  }

  throw new ForbiddenError('You can only manage your own services')
}
