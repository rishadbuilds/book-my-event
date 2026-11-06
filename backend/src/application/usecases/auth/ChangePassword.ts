import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import {
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { ChangePasswordDto } from '../../dtos/auth.dto.js'

@injectable()
export class ChangePassword {
  constructor(
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    const matches = await this.hasher.compare(
      dto.currentPassword,
      user.passwordHash,
    )

    if (!matches) {
      throw new ValidationError('Current password is incorrect', [
        {
          field: 'currentPassword',
          message: 'Current password is incorrect',
        },
      ])
    }

    const passwordHash = await this.hasher.hash(dto.newPassword)
    await this.users.updatePasswordHash(userId, passwordHash)
  }
}
