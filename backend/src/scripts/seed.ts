import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { env } from '../infrastructure/config/env.config.js'
import {
  UserModel,
  type UserDocument,
} from '../infrastructure/database/models/UserModel.js'
import { ServiceModel } from '../infrastructure/database/models/ServiceModel.js'
import { UserRole } from '../shared/constants/Roles.js'
import {
  PriceUnit,
  SERVICE_CATEGORY_LABELS,
  ServiceCategory,
} from '../shared/constants/Service.js'
import { slugify } from '../shared/utils/slug.js'

interface SeedUser {
  name: string
  email: string
  role: UserRole
  phone?: string
  businessName?: string
  bio?: string
}

interface SeedService {
  providerIndex: 0 | 1
  name: string
  category: ServiceCategory
  location: string
  price: number
  priceUnit: PriceUnit
  description: string
  allowsMultipleBookings?: boolean
}

const SEED_USERS: SeedUser[] = [
  {
    name: 'Platform Admin',
    email: 'admin@bookmyevent.local',
    role: UserRole.ADMIN,
    phone: '+91 90000 10000',
  },
  {
    name: 'Aarav Mehta',
    email: 'provider@bookmyevent.local',
    role: UserRole.PROVIDER,
    phone: '+91 98200 11223',
    businessName: 'Grand Occasions',
    bio: 'Curating premium venues, hotels, decor, and event planning across India since 2012.',
  },
  {
    name: 'Meera Kapoor',
    email: 'studio@bookmyevent.local',
    role: UserRole.PROVIDER,
    phone: '+91 98765 44556',
    businessName: 'Celebration Studio',
    bio: 'A collective of caterers, photographers, and music artists for memorable celebrations.',
  },
  {
    name: 'Riya Sharma',
    email: 'user@bookmyevent.local',
    role: UserRole.USER,
    phone: '+91 99887 76655',
  },
]

const SEED_SERVICES: SeedService[] = [
  {
    providerIndex: 0,
    name: 'The Grand Palace Banquet',
    category: ServiceCategory.VENUE,
    location: 'Mumbai',
    price: 250000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'A regal banquet hall with crystal chandeliers, a grand stage, and space for up to 600 guests. Includes valet parking, bridal suite, and in-house event coordination.',
  },
  {
    providerIndex: 0,
    name: 'Riverside Lawns',
    category: ServiceCategory.VENUE,
    location: 'Pune',
    price: 180000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'An open-air lawn beside the river with sunset views, fairy-light canopies, and a covered dining pavilion for 350 guests.',
  },
  {
    providerIndex: 0,
    name: 'Sunset Terrace Goa',
    category: ServiceCategory.VENUE,
    location: 'Goa',
    price: 140000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'A breezy rooftop terrace overlooking the Arabian Sea, ideal for intimate weddings and cocktail receptions of up to 180 guests.',
  },
  {
    providerIndex: 0,
    name: 'The Aurora Hotel',
    category: ServiceCategory.HOTEL,
    location: 'New Delhi',
    price: 120000,
    priceUnit: PriceUnit.PER_DAY,
    description:
      'A five-star business hotel with a ballroom, four meeting rooms, and 90 rooms for out-of-town guests. Corporate rates available.',
    allowsMultipleBookings: true,
  },
  {
    providerIndex: 0,
    name: 'Lakeview Resort',
    category: ServiceCategory.HOTEL,
    location: 'Udaipur',
    price: 160000,
    priceUnit: PriceUnit.PER_DAY,
    description:
      'A lakeside resort with private villas, a poolside lawn, and curated destination-wedding packages for up to 250 guests.',
    allowsMultipleBookings: true,
  },
  {
    providerIndex: 1,
    name: 'Spice Route Catering',
    category: ServiceCategory.CATERING,
    location: 'Mumbai',
    price: 1200,
    priceUnit: PriceUnit.PER_PERSON,
    description:
      'Multi-cuisine catering with live counters, vegetarian and non-vegetarian menus, and a dedicated tasting session before your event.',
  },
  {
    providerIndex: 1,
    name: 'Royal Feast Caterers',
    category: ServiceCategory.CATERING,
    location: 'New Delhi',
    price: 1500,
    priceUnit: PriceUnit.PER_PERSON,
    description:
      'North Indian and Mughlai specialities prepared by award-winning chefs, with silver-service dining and custom dessert bars.',
  },
  {
    providerIndex: 1,
    name: 'Frame & Focus Studio',
    category: ServiceCategory.PHOTOGRAPHY,
    location: 'Bengaluru',
    price: 90000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'Two photographers and a cinematographer capture candid moments, portraits, and a same-day highlight reel. Includes edited online gallery.',
  },
  {
    providerIndex: 1,
    name: 'Candid Tales Photography',
    category: ServiceCategory.PHOTOGRAPHY,
    location: 'Jaipur',
    price: 75000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'Documentary-style wedding photography with a focus on natural light, royal locations, and unposed family moments.',
  },
  {
    providerIndex: 1,
    name: 'Beatline DJs',
    category: ServiceCategory.DJ,
    location: 'Bengaluru',
    price: 45000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'A high-energy DJ setup with professional sound, dance-floor lighting, and a curated playlist spanning Bollywood, retro, and house.',
  },
  {
    providerIndex: 1,
    name: 'Vinyl Nights',
    category: ServiceCategory.DJ,
    location: 'Goa',
    price: 55000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'A boutique music experience with vinyl DJs, ambient lighting, and acoustic sets for beachside cocktails and after-parties.',
  },
  {
    providerIndex: 0,
    name: 'Bloom & Branch Decor',
    category: ServiceCategory.DECORATION,
    location: 'Hyderabad',
    price: 85000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'Floral installations, mandap styling, entrance arches, and table centrepieces designed around your palette and theme.',
  },
  {
    providerIndex: 0,
    name: 'Elegant Events Decor',
    category: ServiceCategory.DECORATION,
    location: 'Chennai',
    price: 70000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'Contemporary stage design, drapery, lighting, and custom signage for engagements, receptions, and corporate galas.',
  },
  {
    providerIndex: 0,
    name: 'Moment Makers Planners',
    category: ServiceCategory.EVENT_PLANNER,
    location: 'Mumbai',
    price: 200000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'End-to-end planning covering venue shortlisting, vendor management, timelines, guest logistics, and on-day coordination.',
  },
  {
    providerIndex: 1,
    name: 'Celebrate Co.',
    category: ServiceCategory.EVENT_PLANNER,
    location: 'New Delhi',
    price: 175000,
    priceUnit: PriceUnit.PER_EVENT,
    description:
      'A full-service planning team for weddings and corporate events, with transparent budgets and a dedicated event manager.',
  },
]

const CATEGORY_GRADIENTS: Record<ServiceCategory, [string, string]> = {
  [ServiceCategory.VENUE]: ['#4c1d95', '#7c3aed'],
  [ServiceCategory.HOTEL]: ['#0f766e', '#14b8a6'],
  [ServiceCategory.CATERING]: ['#9a3412', '#f59e0b'],
  [ServiceCategory.PHOTOGRAPHY]: ['#1e3a8a', '#3b82f6'],
  [ServiceCategory.DJ]: ['#831843', '#ec4899'],
  [ServiceCategory.DECORATION]: ['#9d174d', '#f472b6'],
  [ServiceCategory.EVENT_PLANNER]: ['#065f46', '#10b981'],
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function placeholderSvg(
  service: SeedService,
  variant: 1 | 2,
  slug: string,
): string {
  const [start, end] = CATEGORY_GRADIENTS[service.category]
  const [from, to] = variant === 1 ? [start, end] : [end, start]
  const label = SERVICE_CATEGORY_LABELS[service.category]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${escapeXml(service.name)}">
  <defs>
    <linearGradient id="g-${slug}-${variant}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g-${slug}-${variant})"/>
  <circle cx="${variant === 1 ? 980 : 220}" cy="${variant === 1 ? 130 : 660}" r="${variant === 1 ? 230 : 190}" fill="rgba(255,255,255,0.12)"/>
  <circle cx="${variant === 1 ? 150 : 1010}" cy="${variant === 1 ? 700 : 120}" r="120" fill="rgba(255,255,255,0.08)"/>
  <text x="72" y="600" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="700">${escapeXml(service.name)}</text>
  <text x="74" y="668" fill="rgba(255,255,255,0.88)" font-family="system-ui, -apple-system, sans-serif" font-size="28" letter-spacing="2">${escapeXml(label.toUpperCase())} · ${escapeXml(service.location.toUpperCase())}</text>
  <text x="74" y="720" fill="rgba(255,255,255,0.62)" font-family="system-ui, -apple-system, sans-serif" font-size="20">BookMyEvent${variant === 2 ? ' · gallery' : ''}</text>
</svg>
`
}

async function seedUsers(password: string): Promise<{
  ids: [string, string]
  created: number
}> {
  const documents: mongoose.HydratedDocument<UserDocument>[] = []
  let created = 0

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(password, 12)
    const existed = await UserModel.exists({ email: user.email })

    const result = await UserModel.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          name: user.name,
          role: user.role,
          phone: user.phone,
          businessName: user.businessName,
          bio: user.bio,
        },
        $setOnInsert: { passwordHash },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).exec()

    if (!result) throw new Error(`Failed to seed user ${user.email}`)

    if (!existed) created += 1
    documents.push(result)
  }

  const [, providerOne, providerTwo] = documents

  return {
    ids: [String(providerOne.id), String(providerTwo.id)],
    created,
  }
}

async function seedServices(
  providerIds: [string, string],
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  const imageDir = join(env.uploads.dir, 'seed')
  await mkdir(imageDir, { recursive: true })

  for (const service of SEED_SERVICES) {
    const providerId = new mongoose.Types.ObjectId(
      providerIds[service.providerIndex],
    )
    const slug = slugify(service.name)
    const images = [1, 2].map((variant) => {
      const filename = `${slug}-${variant}.svg`
      return {
        filename,
        url: `/uploads/seed/${filename}`,
        content: placeholderSvg(service, variant as 1 | 2, slug),
      }
    })

    await Promise.all(
      images.map((image) =>
        writeFile(join(imageDir, image.filename), image.content, 'utf8'),
      ),
    )

    const existing = await ServiceModel.findOne({
      providerId,
      name: service.name,
    }).exec()

    const payload = {
      providerId,
      name: service.name,
      slug,
      category: service.category,
      description: service.description,
      images: images.map((image) => image.url),
      location: service.location,
      price: service.price,
      priceUnit: service.priceUnit,
      contact: {
        phone:
          SEED_USERS[service.providerIndex + 1].phone ?? '+91 90000 00000',
        email: SEED_USERS[service.providerIndex + 1].email,
      },
      allowsMultipleBookings: service.allowsMultipleBookings ?? false,
      blockedDates: [],
      isActive: true,
    }

    if (existing) {
      await ServiceModel.updateOne(
        { _id: existing._id },
        { $set: payload },
        { runValidators: true },
      ).exec()
      updated += 1
    } else {
      await ServiceModel.create(payload)
      created += 1
    }
  }

  return { created, updated }
}

function seedPassword(): { value: string; generated: boolean } {
  const fromEnv = process.env.SEED_PASSWORD?.trim()
  if (fromEnv) return { value: fromEnv, generated: false }

  return {
    value: `${randomBytes(9).toString('base64url')}Aa1!`,
    generated: true,
  }
}

async function main(): Promise<void> {
  await mongoose.connect(env.mongoUri)
  console.log('✅ MongoDB connected')

  const password = seedPassword()
  const users = await seedUsers(password.value)
  const services = await seedServices(users.ids)

  console.log('')
  console.log('🌱 Seed complete')
  console.log(
    `   Users:    ${SEED_USERS.length} processed (${users.created} created)`,
  )
  console.log(
    `   Services: ${SEED_SERVICES.length} processed (${services.created} created, ${services.updated} updated)`,
  )
  console.log('')
  console.log('   Demo accounts')
  console.log(`   Admin:    admin@bookmyevent.local`)
  console.log(`   Provider: provider@bookmyevent.local`)
  console.log(`   Provider: studio@bookmyevent.local`)
  console.log(`   User:     user@bookmyevent.local`)
  if (password.generated) {
    console.log('')
    console.log(`   Generated password (set SEED_PASSWORD to choose your own):`)
    console.log(`   ${password.value}`)
  } else {
    console.log('')
    console.log('   Password: taken from SEED_PASSWORD')
  }
  console.log('')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
