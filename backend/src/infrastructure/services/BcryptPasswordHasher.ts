import bcrypt from 'bcryptjs'
import { injectable } from 'tsyringe'
import type { IPasswordHasher } from '../../application/ports/services/IPasswordHasher.js'

const SALT_ROUNDS = 12

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
