import { injectable } from 'tsyringe'
import type { IUserRepository } from '../../../application/ports/repositories/IUserRepositories.js'
import { CreateUserData } from '../../../application/types/ports/repository.js'
import type { User } from '../../../domain/entities/User.js'
import { UserModel } from '../models/UserModel.js'

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email })
      .select('+passwordHash')
      .exec()

    if (!document) return null

    return {
      id: document.id,
      name: document.name,
      email: document.email,
      passwordHash: document.passwordHash,
      role: document.role,
      createdAt: document.createdAt,
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const document = await UserModel.create({
      ...data,
      role: 'user',
    })

    return {
      id: document.id,
      name: document.name,
      email: document.email,
      passwordHash: document.passwordHash,
      role: document.role,
      createdAt: document.createdAt,
    }
  }
}