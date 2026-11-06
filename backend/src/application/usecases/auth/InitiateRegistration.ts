import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import { ConflictError, TooManyRequestsError } from '../../../domain/errors/AppError.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import type { AppConfig } from '../../ports/AppConfig.js'
import type { IUserRepository } from '../../ports/repositories/IUserRepository.js'
import type { IPendingRegistrationRepository } from '../../ports/repositories/IPendingRegistrationRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { IOtpGenerator } from '../../ports/services/IOtpGenerator.js'
import type { IEmailService } from '../../ports/services/IEmailService.js'
import type {
  RegisterUserDto,
  RegistrationPendingDto,
} from '../../dtos/auth.dto.js'

@injectable()
export class InitiateRegistration {
  constructor(
    @inject(TOKENS.Config) private readonly config: AppConfig,
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(TOKENS.PendingRegistrationRepository)
    private readonly pending: IPendingRegistrationRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
    @inject(TOKENS.OtpGenerator) private readonly otpGenerator: IOtpGenerator,
    @inject(TOKENS.EmailService) private readonly email: IEmailService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegistrationPendingDto> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictError('Email is already registered')
    }

    const now = Date.now()
    const cooldownMs = this.config.otp.resendCooldownSeconds * 1000
    const existing = await this.pending.findByEmail(dto.email)

    if (existing) {
      const elapsed = now - existing.lastSentAt.getTime()
      if (elapsed < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - elapsed) / 1000)
        throw new TooManyRequestsError(
          `Please wait ${retryAfter}s before requesting a new code`,
        )
      }
    }

    const otp = this.otpGenerator.generate()
    const [passwordHash, otpHash] = await Promise.all([
      this.hasher.hash(dto.password),
      this.hasher.hash(otp),
    ])

    const expiresAt = new Date(now + this.config.otp.ttlMinutes * 60_000)
    const lastSentAt = new Date(now)

    // Upsert lets a user restart registration with the same email safely.
    await this.pending.upsert({
      name: dto.name,
      email: dto.email,
      passwordHash,
      otpHash,
      expiresAt,
      lastSentAt,
    })

    await this.email.sendRegistrationOtp({
      to: dto.email,
      name: dto.name,
      otp,
      expiresInMinutes: this.config.otp.ttlMinutes,
    })

    return {
      email: dto.email,
      message: 'Verification code sent. Check your email to continue.',
      expiresAt: expiresAt.toISOString(),
      resendAvailableAt: new Date(now + cooldownMs).toISOString(),
      ...(this.config.isProduction ? {} : { devOtp: otp }),
    }
  }
}
