import type { PendingRegistration } from '../../../domain/entities/PendingRegistration.js'

export interface UpsertPendingRegistrationData {
  name: string
  email: string
  passwordHash: string
  otpHash: string
  expiresAt: Date
  lastSentAt: Date
}

export interface IPendingRegistrationRepository {
  findByEmail(email: string): Promise<PendingRegistration | null>
  upsert(data: UpsertPendingRegistrationData): Promise<PendingRegistration>
  updateOtp(
    email: string,
    data: { otpHash: string; expiresAt: Date; lastSentAt: Date },
  ): Promise<PendingRegistration | null>
  incrementAttempts(email: string): Promise<void>
  deleteByEmail(email: string): Promise<void>
}
