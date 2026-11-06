import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import { ConflictError } from '../../../domain/errors/AppError.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { ITokenService } from '../../ports/services/ITokenService.js'
import type { AuthResponseDto, RegisterUserDto } from '../../dtos/auth.dto.js'
import { UserMapper } from '../../mappers/UserMapper.js'

@injectable()
export class RegisterUser {
  constructor(
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
    @inject(TOKENS.TokenService) private readonly tokens: ITokenService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email)
    if (existing) throw new ConflictError('Email is already registered')

    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await this.hasher.hash(dto.password),
      role: UserRole.USER,
    })

    return {
      user: UserMapper.toResponse(user),
      accessToken: this.tokens.sign({ sub: user.id, role: user.role }),
    }
  }
}
