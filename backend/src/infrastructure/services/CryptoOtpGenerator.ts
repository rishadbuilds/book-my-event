import { randomInt } from 'node:crypto'
import { injectable } from 'tsyringe'
import type { IOtpGenerator } from '../../application/ports/services/IOtpGenerator.js'

@injectable()
export class CryptoOtpGenerator implements IOtpGenerator {
  generate(): string {
    // cryptographically secure, uniformly distributed 6-digit code
    return randomInt(0, 1_000_000).toString().padStart(6, '0')
  }
}
