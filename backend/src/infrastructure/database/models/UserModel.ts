import { Schema, model } from 'mongoose'
import { UserRole } from '../../../shared/constants/Roles.js'

export interface UserDocument {
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
)

export const UserModel = model<UserDocument>('User', userSchema)
