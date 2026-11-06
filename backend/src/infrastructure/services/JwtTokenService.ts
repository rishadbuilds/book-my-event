import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'
import { TOKENS } from '../../application/ports/tokens.js'
import type {
  ITokenService,
  TokenPayload,
} from '../../application/ports/services/ITokenService.js'
import { UnauthorizedError } from '../../domain/errors/AppError.js'
import type { Env } from '../config/env.config.js'

@injectable()
export class JwtTokenService implements ITokenService {
  private readonly secret: string
  private readonly expiresIn: SignOptions['expiresIn']

  constructor(@inject(TOKENS.Config) config: Env) {
    this.secret = config.jwt.secret
    this.expiresIn = config.jwt.expiresIn as SignOptions['expiresIn']
  }

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret)

      if (typeof decoded === 'string' || !decoded.sub) {
        throw new Error('Malformed token payload')
      }

      return {
        sub: String(decoded.sub),
        role: String((decoded as JwtPayload).role ?? ''),
      }
    } catch {
      throw new UnauthorizedError('Invalid or expired token')
    }
  }
}
