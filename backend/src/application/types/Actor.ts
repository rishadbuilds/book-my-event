import type { UserRole } from '../../shared/constants/Roles.js'

/** Authenticated caller passed from the presentation layer to use cases. */
export interface Actor {
  userId: string
  role: UserRole
}
