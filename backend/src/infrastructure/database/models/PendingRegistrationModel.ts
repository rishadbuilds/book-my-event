import { Schema, model } from 'mongoose'

export interface PendingRegistrationDocument {
  name: string
  email: string
  passwordHash: string
  otpHash: string
  attempts: number
  lastSentAt: Date
  expiresAt: Date
  createdAt: Date
}

const pendingRegistrationSchema = new Schema<PendingRegistrationDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    lastSentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

// Mongo removes abandoned registrations automatically once they expire.
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PendingRegistrationModel = model<PendingRegistrationDocument>(
  'PendingRegistration',
  pendingRegistrationSchema,
)
