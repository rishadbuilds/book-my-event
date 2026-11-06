import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import { NotFoundError } from '../../../domain/errors/AppError.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { UserResponseDto } from '../../dtos/auth.dto.js'
import { UserMapper } from '../../mappers/UserMapper.js'

@injectable()
export class GetCurrentUser {
  constructor(
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.users.findById(userId)
    if (!user) throw new NotFoundError('User not found')
    return UserMapper.toResponse(user)
  }
}
