import { injectable } from 'tsyringe'
import type { HydratedDocument } from 'mongoose'
import type {
  CreateUserData,
  IUserRepository,
  UpdateUserProfileData,
} from '../../../application/ports/repositories/IUserRepository.js'
import type { User } from '../../../domain/entities/User.js'
import { UserRole } from '../../../shared/constants/Roles.js'
import { UserModel, type UserDocument } from '../models/UserModel.js'

function toEntity(document: HydratedDocument<UserDocument>): User {
  return {
    id: document.id,
    name: document.name,
    email: document.email,
    passwordHash: document.passwordHash,
    role: document.role,
    phone: document.phone,
    avatarUrl: document.avatarUrl,
    bio: document.bio,
    businessName: document.businessName,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec()

    return document ? toEntity(document) : null
  }

  async findById(id: string): Promise<User | null> {
    const document = await UserModel.findById(id)
      .select('+passwordHash')
      .exec()

    return document ? toEntity(document) : null
  }

  async create(data: CreateUserData): Promise<User> {
    const document = await UserModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role ?? UserRole.USER,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      businessName: data.businessName,
    })

    return toEntity(document)
  }

  async updateProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<User | null> {
    const document = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    )
      .select('+passwordHash')
      .exec()

    return document ? toEntity(document) : null
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { passwordHash } }).exec()
  }
}
