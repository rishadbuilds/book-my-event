import { injectable } from 'tsyringe'
import type { HydratedDocument } from 'mongoose'
import type {
  IPendingRegistrationRepository,
  UpsertPendingRegistrationData,
} from '../../../application/ports/repositories/IPendingRegistrationRepository.js'
import type { PendingRegistration } from '../../../domain/entities/PendingRegistration.js'
import {
  PendingRegistrationModel,
  type PendingRegistrationDocument,
} from '../models/PendingRegistrationModel.js'

function toEntity(
  document: HydratedDocument<PendingRegistrationDocument>,
): PendingRegistration {
  return {
    name: document.name,
    email: document.email,
    passwordHash: document.passwordHash,
    otpHash: document.otpHash,
    attempts: document.attempts,
    lastSentAt: document.lastSentAt,
    expiresAt: document.expiresAt,
  }
}

@injectable()
export class MongoPendingRegistrationRepository
  implements IPendingRegistrationRepository
{
  async findByEmail(email: string): Promise<PendingRegistration | null> {
    const document = await PendingRegistrationModel.findOne({
      email: email.toLowerCase(),
    }).exec()

    return document ? toEntity(document) : null
  }

  async upsert(
    data: UpsertPendingRegistrationData,
  ): Promise<PendingRegistration> {
    const document = await PendingRegistrationModel.findOneAndUpdate(
      { email: data.email.toLowerCase() },
      {
        $set: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          otpHash: data.otpHash,
          attempts: 0,
          lastSentAt: data.lastSentAt,
          expiresAt: data.expiresAt,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).exec()

    return toEntity(document)
  }

  async updateOtp(
    email: string,
    data: { otpHash: string; expiresAt: Date; lastSentAt: Date },
  ): Promise<PendingRegistration | null> {
    const document = await PendingRegistrationModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          otpHash: data.otpHash,
          expiresAt: data.expiresAt,
          lastSentAt: data.lastSentAt,
          attempts: 0,
        },
      },
      { new: true },
    ).exec()

    return document ? toEntity(document) : null
  }

  async incrementAttempts(email: string): Promise<void> {
    await PendingRegistrationModel.updateOne(
      { email: email.toLowerCase() },
      { $inc: { attempts: 1 } },
    ).exec()
  }

  async deleteByEmail(email: string): Promise<void> {
    await PendingRegistrationModel.deleteOne({
      email: email.toLowerCase(),
    }).exec()
  }
}
