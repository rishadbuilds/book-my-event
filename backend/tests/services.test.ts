import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { UserRole } from '../src/shared/constants/Roles.js'
import {
  PriceUnit,
  ServiceCategory,
} from '../src/shared/constants/Service.js'
import {
  auth,
  createService,
  createUser,
  login,
  resetDatabase,
} from './helpers.js'

const app = createApp()

describe('services', () => {
  let providerToken: string
  let otherProviderToken: string
  let adminToken: string
  let customerToken: string
  let providerId: string
  let otherProviderId: string
  let venue: Awaited<ReturnType<typeof createService>>
  let hidden: Awaited<ReturnType<typeof createService>>

  beforeEach(async () => {
    await resetDatabase()

    const provider = await createUser({
      role: UserRole.PROVIDER,
      businessName: 'Test Events Co',
    })
    const otherProvider = await createUser({ role: UserRole.PROVIDER })
    const admin = await createUser({ role: UserRole.ADMIN })
    const customer = await createUser({ role: UserRole.USER })

    providerId = String(provider.id)
    otherProviderId = String(otherProvider.id)

    providerToken = await login(app, provider.email)
    otherProviderToken = await login(app, otherProvider.email)
    adminToken = await login(app, admin.email)
    customerToken = await login(app, customer.email)

    venue = await createService(providerId, {
      name: 'Grand Venue',
      location: 'Mumbai',
      price: 50_000,
    })
    await createService(providerId, {
      name: 'Photo Studio',
      category: ServiceCategory.PHOTOGRAPHY,
      location: 'Pune',
      price: 5_000,
    })
    hidden = await createService(providerId, {
      name: 'Hidden Hall',
      location: 'Mumbai',
      price: 20_000,
      isActive: false,
    })
  })

  it('lists only active services with pagination metadata', async () => {
    const response = await request(app).get('/api/services')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)
    expect(response.body.data.map((item: { id: string }) => item.id)).not.toContain(
      String(hidden.id),
    )
    expect(response.body.meta).toEqual({
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1,
    })
  })

  it('filters and sorts services', async () => {
    let response = await request(app).get('/api/services?q=grand')
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe('Grand Venue')

    response = await request(app).get(
      `/api/services?category=${ServiceCategory.PHOTOGRAPHY}`,
    )
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe('Photo Studio')

    response = await request(app).get('/api/services?location=Pune')
    expect(response.body.data).toHaveLength(1)

    response = await request(app).get('/api/services?sort=price-asc')
    expect(response.body.data[0].name).toBe('Photo Studio')

    response = await request(app).get('/api/services?minPrice=10000')
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe('Grand Venue')

    response = await request(app).get(
      '/api/services?minPrice=50000&maxPrice=1000',
    )
    expect(response.status).toBe(400)
  })

  it('exposes filter metadata and public detail by slug', async () => {
    let response = await request(app).get('/api/services/meta')
    expect(response.status).toBe(200)
    expect(response.body.data.categories).toHaveLength(7)
    expect(response.body.data.priceRange).toEqual({
      min: 5_000,
      max: 50_000,
    })

    response = await request(app).get(`/api/services/${venue.slug}`)
    expect(response.status).toBe(200)
    expect(response.body.data.name).toBe('Grand Venue')
    expect(response.body.data.provider.businessName).toBe('Test Events Co')

    response = await request(app).get(`/api/services/${hidden.slug}`)
    expect(response.status).toBe(404)
  })

  it('scopes provider listings to the owner and lets admins see all', async () => {
    let response = await request(app).get('/api/provider/services')
    expect(response.status).toBe(401)

    response = await request(app)
      .get('/api/provider/services')
      .set(auth(customerToken))
    expect(response.status).toBe(403)

    response = await request(app)
      .get('/api/provider/services')
      .set(auth(providerToken))
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(3)

    response = await request(app)
      .get('/api/provider/services')
      .set(auth(adminToken))
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(3)
  })

  it('creates, updates and soft-deletes a provider service', async () => {
    let response = await request(app)
      .post('/api/services')
      .set(auth(providerToken))
      .send({
        name: 'New Caterer',
        category: ServiceCategory.CATERING,
        description:
          'A brand new catering service for the automated test suite.',
        images: [],
        location: 'Kochi',
        price: 750,
        priceUnit: PriceUnit.PER_PERSON,
        contact: { phone: '+91 90000 00000' },
        allowsMultipleBookings: false,
        blockedDates: [],
        isActive: true,
      })

    expect(response.status).toBe(201)
    const created = response.body.data
    expect(created.slug).toBe('new-caterer')
    expect(created.priceUnitLabel).toBe('per person')

    response = await request(app)
      .patch(`/api/services/${created.id}`)
      .set(auth(providerToken))
      .send({ price: 900 })
    expect(response.status).toBe(200)
    expect(response.body.data.price).toBe(900)

    response = await request(app)
      .delete(`/api/services/${created.id}`)
      .set(auth(providerToken))
    expect(response.status).toBe(200)

    response = await request(app).get(`/api/services/${created.slug}`)
    expect(response.status).toBe(404)
  })

  it('prevents other providers from editing and allows admins', async () => {
    let response = await request(app)
      .patch(`/api/services/${venue.id}`)
      .set(auth(otherProviderToken))
      .send({ price: 1 })
    expect(response.status).toBe(403)

    response = await request(app)
      .patch(`/api/services/${venue.id}`)
      .set(auth(adminToken))
      .send({ price: 1 })
    expect(response.status).toBe(200)
    expect(response.body.data.price).toBe(1)
  })

  it('rejects invalid service input', async () => {
    const response = await request(app)
      .post('/api/services')
      .set(auth(providerToken))
      .send({
        name: 'X',
        category: ServiceCategory.VENUE,
        description: 'Too short',
        images: [],
        location: 'A',
        price: -1,
        priceUnit: PriceUnit.PER_EVENT,
        contact: { phone: 'bad' },
        allowsMultipleBookings: false,
        blockedDates: [],
        isActive: true,
      })

    expect(response.status).toBe(400)
    expect(response.body.errors.length).toBeGreaterThan(0)
  })

  it('requires a providerId when an admin creates a service', async () => {
    const payload = {
      name: 'Admin Service',
      category: ServiceCategory.DECORATION,
      description: 'A decoration service created by an administrator.',
      images: [],
      location: 'Delhi',
      price: 1_000,
      priceUnit: PriceUnit.PER_EVENT,
      contact: { phone: '+91 90000 00000' },
      allowsMultipleBookings: false,
      blockedDates: [],
      isActive: true,
    }

    let response = await request(app)
      .post('/api/services')
      .set(auth(adminToken))
      .send(payload)
    expect(response.status).toBe(400)

    response = await request(app)
      .post('/api/services')
      .set(auth(adminToken))
      .send({ ...payload, providerId: otherProviderId })
    expect(response.status).toBe(201)
  })
})
