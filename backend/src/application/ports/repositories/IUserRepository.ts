import type { User } from '../../../domain/entities/User.js'

export interface CreateUserData {
  name: string
  email: string
  passwordHash: string
  role?: User['role']
  phone?: string
  avatarUrl?: string
  bio?: string
  businessName?: string
}

export interface UpdateUserProfileData {
  name?: string
  phone?: string
  avatarUrl?: string
  bio?: string
  businessName?: string
}

/**
 * Outbound port for user persistence.
 * The application layer depends on this abstraction, never on Mongoose.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  updateProfile(id: string, data: UpdateUserProfileData): Promise<User | null>
  updatePasswordHash(id: string, passwordHash: string): Promise<void>
}
