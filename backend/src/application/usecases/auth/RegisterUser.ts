import { randomUUID } from 'crypto'
import { inject, injectable } from 'tsyringe'
import { ConflictError } from '../../../domain/errors/AppError'
import { IUserRepository } from '../../ports/repositories/IUserRepositories'
import { IPasswordHasher } from '../../ports/services/IPasswordHasher'
import { ITokenService } from '../../ports/services/ITokenService'
import { AuthResponseDto, RegisterUserDto } from '../../dtos/auth.dto'
import { UserMapper } from '../../mappers/UserMapper'

@injectable()
export class RegisterUser {
  constructor(
    @inject("UserRepository") private readonly users: IUserRepository,
    @inject("PasswordHasher") private readonly hasher: IPasswordHasher,
    @inject("TokenService")private readonly tokens: ITokenService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictError('Email is already registered')
    }

    const user = new User(
      randomUUID(),
      dto.name,
      dto.email,
      await this.hasher.hash(dto.password),
      'user',
      new Date(),
    )
    await this.users.save(user)

    return {
      user: UserMapper.toResponse(user),
      accessToken: this.tokens.sign({ sub: user.id, role: user.role }),
    }
  }
}