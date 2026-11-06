/**
 * A registration that is waiting for email/OTP verification.
 * The user row is only created after the OTP is confirmed.
 */
export interface PendingRegistration {
  name: string
  email: string
  passwordHash: string
  otpHash: string
  attempts: number
  lastSentAt: Date
  expiresAt: Date
}
