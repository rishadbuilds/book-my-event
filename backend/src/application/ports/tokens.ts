/**
 * Injection tokens for the application's outbound ports.
 * Living in the application layer keeps the dependency direction inward:
 * infrastructure depends on these tokens, not the other way around.
 */
export const TOKENS = {
  Config: Symbol.for('Config'),
  UserRepository: Symbol.for('UserRepository'),
  PasswordHasher: Symbol.for('PasswordHasher'),
  TokenService: Symbol.for('TokenService'),
} as const
