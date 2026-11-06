import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import {
  ConflictError,
  TooManyRequestsError,
  ValidationError,
} from '../../../domain/errors/AppError.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import type { AppConfig } from '../../ports/AppConfig.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IPendingRegistrationRepository } from '../../ports/repositories/IPendingRegistrationRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { ITokenService } from '../../ports/services/ITokenService.js'
import type { AuthResponseDto, VerifyOtpDto } from '../../dtos/auth.dto.js'
import { UserMapper } from '../../mappers/UserMapper.js'

@injectable()
export class VerifyRegistrationOtp {
  constructor(
    @inject(TOKENS.Config) private readonly config: AppConfig,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.PendingRegistrationRepository)
    private readonly pending: IPendingRegistrationRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
    @inject(TOKENS.TokenService) private readonly tokens: ITokenService,
  ) {}

  async execute(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const pending = await this.pending.findByEmail(dto.email)

    if (!pending) {
      throw new ValidationError(
        'No pending registration was found for this email',
      )
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
      await this.pending.deleteByEmail(dto.email)
      throw new ValidationError(
        'The verification code has expired. Please register again.',
      )
    }

    if (pending.attempts >= this.config.otp.maxAttempts) {
      await this.pending.deleteByEmail(dto.email)
      throw new TooManyRequestsError(
        'Too many incorrect attempts. Please register again.',
      )
    }

    const isValid = await this.hasher.compare(dto.otp, pending.otpHash)
    if (!isValid) {
      await this.pending.incrementAttempts(dto.email)
      throw new ValidationError('Invalid verification code')
    }

    // Guard against a user being created between initiation and verification.
    if (await this.users.findByEmail(dto.email)) {
      await this.pending.deleteByEmail(dto.email)
      throw new ConflictError('Email is already registered')
    }

    const user = await this.users.create({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: UserRole.USER,
    })

    await this.pending.deleteByEmail(dto.email)

    return {
      user: UserMapper.toResponse(user),
      accessToken: this.tokens.sign({ sub: user.id, role: user.role }),
    }
  }
}
