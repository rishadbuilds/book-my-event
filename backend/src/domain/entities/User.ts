import type { UserRole } from '../../shared/constants/Roles.js'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}
