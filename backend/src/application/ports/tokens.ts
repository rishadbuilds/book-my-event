export const TOKENS = {
  Config: Symbol.for('Config'),
  UserRepository: Symbol.for('UserRepository'),
  PendingRegistrationRepository: Symbol.for('PendingRegistrationRepository'),
  PasswordHasher: Symbol.for('PasswordHasher'),
  TokenService: Symbol.for('TokenService'),
  OtpGenerator: Symbol.for('OtpGenerator'),
  EmailService: Symbol.for('EmailService'),
} as const
