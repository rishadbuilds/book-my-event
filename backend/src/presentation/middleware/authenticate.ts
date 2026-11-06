import type { RequestHandler } from 'express'
import { container } from '../../infrastructure/di/container.js'
import { TOKENS } from '../../application/ports/tokens.js'
import type { ITokenService } from '../../application/ports/services/ITokenService.js'
import { UnauthorizedError } from '../../domain/errors/AppError.js'

/** Verifies the `Authorization: Bearer <token>` header and attaches the payload. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization')

  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing bearer token'))
  }

  try {
    const tokenService = container.resolve<ITokenService>(TOKENS.TokenService)
    req.auth = tokenService.verify(header.slice('Bearer '.length).trim())
    next()
  } catch (error) {
    next(error)
  }
}
