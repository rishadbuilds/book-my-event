import type { TokenPayload } from '../../application/ports/services/ITokenService.js'

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload
    }
  }
}

export {}
