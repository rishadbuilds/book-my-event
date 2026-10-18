import { inject, injectable } from 'tsyringe'
import { UnauthorizedError } from '../../domain/errors/AppError'
import { IUserRepository } from '../ports/IUserRepository'
import { IPasswordHasher } from '../ports/IPasswordHasher'
import { ITokenService } from '../ports/ITokenService'
import { AuthResponseDto, LoginUserDto } from '../dtos/auth.dto'
import { UserMapper } from '../mappers/UserMapper'

@injectable()
export class LoginUser {
  constructor(
    @inject("UserRepository") private readonly users: IUserRepository,
    @inject("PasswordHasher") private readonly hasher: IPasswordHasher,
    @inject("TokenService") private readonly tokens: ITokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email)
    const valid = user && (await this.hasher.compare(dto.password, user.passwordHash))
    if (!user || !valid) throw new UnauthorizedError('Invalid email or password')

    return {
      user: UserMapper.toResponse(user),
      accessToken: this.tokens.sign({ sub: user.id, role: user.role }),
    }
  }
}