import 'reflect-metadata'
import { container } from 'tsyringe'
import { TOKENS } from '../../application/ports/tokens.js'
import { env } from '../config/env.config.js'
import { MongoUserRepository } from '../database/repositories/UserRepository.js'
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher.js'
import { JwtTokenService } from '../services/JwtTokenService.js'

/**
 * Composition root: the only place that knows which concrete
 * implementations satisfy the application's ports.
 */
container.register(TOKENS.Config, { useValue: env })
container.register(TOKENS.UserRepository, { useClass: MongoUserRepository })
container.register(TOKENS.PasswordHasher, { useClass: BcryptPasswordHasher })
container.register(TOKENS.TokenService, { useClass: JwtTokenService })

export { container }
