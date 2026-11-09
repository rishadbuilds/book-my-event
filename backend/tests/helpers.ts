import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'
import request from 'supertest'
import type { Express } from 'express'
import {
  UserModel,
  type UserDocument,
} from '../src/infrastructure/database/models/UserModel.js'
import {
  ServiceModel,
  type ServiceDocument,
} from '../src/infrastructure/database/models/ServiceModel.js'
import { BookingModel } from '../src/infrastructure/database/models/BookingModel.js'
import { UserRole } from '../src/shared/constants/Roles.js'
import {
  PriceUnit,
  ServiceCategory,
} from '../src/shared/constants/Service.js'
import { slugify } from '../src/shared/utils/slug.js'

export const PASSWORD = 'Password1'

type UserOverrides = Partial<
  Pick<
    UserDocument,
    'name' | 'email' | 'role' | 'phone' | 'bio' | 'businessName'
  >
>

export async function createUser(overrides: UserOverrides = {}) {
  const suffix = new Types.ObjectId().toString().slice(-8)

  return UserModel.create({
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? `user-${suffix}@example.com`,
    passwordHash: await bcrypt.hash(PASSWORD, 4),
    role: overrides.role ?? UserRole.USER,
    phone: overrides.phone,
    bio: overrides.bio,
    businessName: overrides.businessName,
  })
}

type ServiceOverrides = Partial<
  Pick<
    ServiceDocument,
    | 'name'
    | 'slug'
    | 'category'
    | 'description'
    | 'images'
    | 'location'
    | 'price'
    | 'priceUnit'
    | 'contact'
    | 'allowsMultipleBookings'
    | 'blockedDates'
    | 'isActive'
  >
>

export async function createService(
  providerId: string,
  overrides: ServiceOverrides = {},
) {
  const suffix = new Types.ObjectId().toString().slice(-8)
  const name = overrides.name ?? `Test Service ${suffix}`

  return ServiceModel.create({
    providerId: new Types.ObjectId(providerId),
    name,
    slug: overrides.slug ?? slugify(name),
    category: overrides.category ?? ServiceCategory.VENUE,
    description:
      overrides.description ??
      'A service created by the automated integration test suite.',
    images: overrides.images ?? [],
    location: overrides.location ?? 'Test City',
    price: overrides.price ?? 10_000,
    priceUnit: overrides.priceUnit ?? PriceUnit.PER_EVENT,
    contact: overrides.contact ?? { phone: '+91 90000 00000' },
    allowsMultipleBookings: overrides.allowsMultipleBookings ?? false,
    blockedDates: overrides.blockedDates ?? [],
    isActive: overrides.isActive ?? true,
  })
}

export async function resetDatabase(): Promise<void> {
  await Promise.all([
    BookingModel.deleteMany({}),
    ServiceModel.deleteMany({}),
    UserModel.deleteMany({}),
  ])
}

export async function login(app: Express, email: string): Promise<string> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PASSWORD })

  if (response.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${response.status} ${JSON.stringify(
        response.body,
      )}`,
    )
  }

  return response.body.data.accessToken as string
}

export function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}
