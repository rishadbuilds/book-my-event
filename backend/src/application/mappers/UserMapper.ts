import type { User } from '../../domain/entities/User.js'
import type { UserResponseDto } from '../dtos/auth.dto.js'

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      businessName: user.businessName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: (user.updatedAt ?? user.createdAt).toISOString(),
    }
  }
}
