import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../ports/tokens.js'
import {
  TooManyRequestsError,
  ValidationError,
} from '../../../domain/errors/AppError.js'
import type { AppConfig } from '../../ports/AppConfig.js'
import type { IPendingRegistrationRepository } from '../../ports/repositories/IPendingRegistrationRepository.js'
import type { IPasswordHasher } from '../../ports/services/IPasswordHasher.js'
import type { IOtpGenerator } from '../../ports/services/IOtpGenerator.js'
import type { IEmailService } from '../../ports/services/IEmailService.js'
import type {
  RegistrationPendingDto,
  ResendOtpDto,
} from '../../dtos/auth.dto.js'

@injectable()
export class ResendRegistrationOtp {
  constructor(
    @inject(TOKENS.Config) private readonly config: AppConfig,
    @inject(TOKENS.PendingRegistrationRepository)
    private readonly pending: IPendingRegistrationRepository,
    @inject(TOKENS.PasswordHasher) private readonly hasher: IPasswordHasher,
    @inject(TOKENS.OtpGenerator) private readonly otpGenerator: IOtpGenerator,
    @inject(TOKENS.EmailService) private readonly email: IEmailService,
  ) {}

  async execute(dto: ResendOtpDto): Promise<RegistrationPendingDto> {
    const pending = await this.pending.findByEmail(dto.email)

    if (!pending) {
      throw new ValidationError(
        'No pending registration was found for this email',
      )
    }

    const now = Date.now()
    const cooldownMs = this.config.otp.resendCooldownSeconds * 1000
    const elapsed = now - pending.lastSentAt.getTime()

    if (elapsed < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - elapsed) / 1000)
      throw new TooManyRequestsError(
        `Please wait ${retryAfter}s before requesting a new code`,
      )
    }

    const otp = this.otpGenerator.generate()
    const otpHash = await this.hasher.hash(otp)
    const expiresAt = new Date(now + this.config.otp.ttlMinutes * 60_000)
    const lastSentAt = new Date(now)

    const updated = await this.pending.updateOtp(dto.email, {
      otpHash,
      expiresAt,
      lastSentAt,
    })

    if (!updated) {
      throw new ValidationError(
        'No pending registration was found for this email',
      )
    }

    await this.email.sendRegistrationOtp({
      to: pending.email,
      name: pending.name,
      otp,
      expiresInMinutes: this.config.otp.ttlMinutes,
    })

    return {
      email: pending.email,
      message: 'A new verification code has been sent.',
      expiresAt: expiresAt.toISOString(),
      resendAvailableAt: new Date(now + cooldownMs).toISOString(),
      ...(this.config.isProduction ? {} : { devOtp: otp }),
    }
  }
}
