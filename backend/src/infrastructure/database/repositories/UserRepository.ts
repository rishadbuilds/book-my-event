import { injectable } from 'tsyringe'
import type { HydratedDocument } from 'mongoose'
import type {
  CreateUserData,
  IUserRepository,
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
    createdAt: document.createdAt,
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
    })

    return toEntity(document)
  }
}
