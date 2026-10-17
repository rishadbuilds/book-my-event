import { User } from '../../domain/entities/User'
import { UserResponseDto } from '../dtos/auth.dto'

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }
  }
}