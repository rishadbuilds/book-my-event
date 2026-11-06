import 'reflect-metadata'
import { container } from 'tsyringe'
import { TOKENS } from '../../application/ports/tokens.js'
import { env } from '../config/env.config.js'
import { MongoPendingRegistrationRepository } from '../database/repositories/PendingRegistrationRepository.js'
import { MongoUserRepository } from '../database/repositories/UserRepository.js'
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher.js'
import { ConsoleEmailService } from '../services/ConsoleEmailService.js'
import { CryptoOtpGenerator } from '../services/CryptoOtpGenerator.js'
import { JwtTokenService } from '../services/JwtTokenService.js'
import { SmtpEmailService } from '../services/SmtpEmailService.js'

/**
 * Composition root: the only place that knows which concrete
 * implementations satisfy the application's ports.
 */
container.register(TOKENS.Config, { useValue: env })
container.register(TOKENS.UserRepository, { useClass: MongoUserRepository })
container.register(TOKENS.PendingRegistrationRepository, {
  useClass: MongoPendingRegistrationRepository,
})
container.register(TOKENS.PasswordHasher, { useClass: BcryptPasswordHasher })
container.register(TOKENS.TokenService, { useClass: JwtTokenService })
container.register(TOKENS.OtpGenerator, { useClass: CryptoOtpGenerator })
container.register(TOKENS.EmailService, {
  useClass: env.smtp ? SmtpEmailService : ConsoleEmailService,
})

export { container }
