import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import { UnauthorizedError } from '../../../domain/errors/AppError.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { ITokenService } from '../../ports/services/ITokenService.js'
import type { AuthResponseDto, LoginUserDto } from '../../dtos/auth.dto.js'
import { UserMapper } from '../../mappers/UserMapper.js'

@injectable()
export class LoginUser {
  constructor(
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
    @inject(TOKENS.TokenService) private readonly tokens: ITokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email)

    // Compare only when the user exists, but return the same error either
    // way so we never reveal whether an email is registered.
    const passwordMatches = user
      ? await this.hasher.compare(dto.password, user.passwordHash)
      : false

    if (!user || !passwordMatches) {
      throw new UnauthorizedError('Invalid email or password')
    }

    return {
      user: UserMapper.toResponse(user),
      accessToken: this.tokens.sign({ sub: user.id, role: user.role }),
    }
  }
}
