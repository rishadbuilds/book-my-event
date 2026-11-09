import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { UserRole } from '../src/shared/constants/Roles.js'
import { PriceUnit } from '../src/shared/constants/Service.js'
import {
  auth,
  createService,
  createUser,
  login,
  resetDatabase,
} from './helpers.js'

const app = createApp()

const DATE = '2027-03-15'
const DATE_TWO = '2027-03-20'

describe('bookings', () => {
  let providerToken: string
  let otherProviderToken: string
  let adminToken: string
  let customerToken: string
  let providerId: string
  let otherProviderId: string
  let venue: Awaited<ReturnType<typeof createService>>
  let catering: Awaited<ReturnType<typeof createService>>
  let multi: Awaited<ReturnType<typeof createService>>
  let inactive: Awaited<ReturnType<typeof createService>>
  let blocked: Awaited<ReturnType<typeof createService>>

  beforeEach(async () => {
    await resetDatabase()

    const provider = await createUser({ role: UserRole.PROVIDER })
    const otherProvider = await createUser({ role: UserRole.PROVIDER })
    const admin = await createUser({ role: UserRole.ADMIN })
    const customer = await createUser({
      role: UserRole.USER,
      phone: '+91 99887 70000',
    })

    providerId = String(provider.id)
    otherProviderId = String(otherProvider.id)

    providerToken = await login(app, provider.email)
    otherProviderToken = await login(app, otherProvider.email)
    adminToken = await login(app, admin.email)
    customerToken = await login(app, customer.email)

    venue = await createService(providerId, {
      name: 'Exclusive Venue',
      price: 250_000,
    })
    catering = await createService(providerId, {
      name: 'Per Person Catering',
      price: 500,
      priceUnit: PriceUnit.PER_PERSON,
    })
    multi = await createService(providerId, {
      name: 'Multi Booking Hotel',
      allowsMultipleBookings: true,
    })
    inactive = await createService(providerId, {
      name: 'Inactive Venue',
      isActive: false,
    })
    blocked = await createService(providerId, {
      name: 'Blocked Venue',
      blockedDates: [new Date('2027-04-01')],
    })
  })

  function book(
    token: string,
    serviceId: string,
    eventDate = DATE,
    extra: Record<string, unknown> = {},
  ) {
    return request(app)
      .post('/api/bookings')
      .set(auth(token))
      .send({
        serviceId,
        eventDate,
        guestCount: 1,
        phone: '+91 90000 00000',
        ...extra,
      })
  }

  it('creates a booking with a service snapshot and calculated total', async () => {
    const response = await book(customerToken, String(venue.id), DATE, {
      guestCount: 100,
      notes: 'Window seats',
      phone: '+91 90000 12345',
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      status: 'pending',
      statusLabel: 'Pending',
      totalPrice: 250_000,
      eventDate: `${DATE}T00:00:00.000Z`,
      userId: expect.any(String),
      providerId,
      customer: {
        name: expect.any(String),
        email: expect.any(String),
        phone: '+91 90000 12345',
      },
      service: {
        id: String(venue.id),
        name: 'Exclusive Venue',
        location: 'Test City',
        unitPrice: 250_000,
        priceUnit: PriceUnit.PER_EVENT,
      },
    })
  })

  it('multiplies the price by guests for per-person services', async () => {
    const response = await book(customerToken, String(catering.id), DATE, {
      guestCount: 100,
    })

    expect(response.status).toBe(201)
    expect(response.body.data.totalPrice).toBe(50_000)
  })

  it('prevents double booking an exclusive service', async () => {
    let response = await book(customerToken, String(venue.id))
    expect(response.status).toBe(201)

    response = await book(adminToken, String(venue.id))
    expect(response.status).toBe(409)
    expect(response.body.message).toMatch(/already booked/i)

    response = await book(
      customerToken,
      String(venue.id),
      `${DATE}T18:30:00.000Z`,
    )
    expect(response.status).toBe(409)
  })

  it('lets services opt into multiple bookings per day', async () => {
    let response = await book(customerToken, String(multi.id), DATE_TWO)
    expect(response.status).toBe(201)

    response = await book(adminToken, String(multi.id), DATE_TWO)
    expect(response.status).toBe(201)

    const listing = await request(app).get(`/api/services?date=${DATE_TWO}`)
    expect(
      listing.body.data.some(
        (service: { id: string }) => service.id === String(multi.id),
      ),
    ).toBe(true)
  })

  it('rejects blocked dates, past dates, self-booking and inactive services', async () => {
    let response = await book(customerToken, String(blocked.id), '2027-04-01')
    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/unavailable/i)

    response = await book(customerToken, String(venue.id), '2020-01-01')
    expect(response.status).toBe(400)

    response = await book(providerToken, String(venue.id), DATE_TWO)
    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/own service/i)

    response = await book(customerToken, String(inactive.id), DATE_TWO)
    expect(response.status).toBe(404)
  })

  it('hides an exclusively booked service from date-filtered listings', async () => {
    await book(customerToken, String(venue.id), DATE)

    const response = await request(app).get(`/api/services?date=${DATE}`)

    expect(response.status).toBe(200)
    expect(
      response.body.data.some(
        (service: { id: string }) => service.id === String(venue.id),
      ),
    ).toBe(false)
    expect(
      response.body.data.some(
        (service: { id: string }) => service.id === String(multi.id),
      ),
    ).toBe(true)
  })

  it('scopes customer, provider and admin listings', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .get('/api/bookings?limit=50')
      .set(auth(customerToken))
    expect(response.status).toBe(200)
    expect(response.body.data.map((item: { id: string }) => item.id)).toContain(
      booking.id,
    )

    response = await request(app)
      .get('/api/bookings?status=confirmed')
      .set(auth(customerToken))
    expect(response.body.data).toHaveLength(0)

    response = await request(app)
      .get('/api/provider/bookings?limit=100')
      .set(auth(providerToken))
    expect(response.status).toBe(200)
    expect(
      response.body.data.every(
        (item: { providerId: string }) => item.providerId === providerId,
      ),
    ).toBe(true)

    response = await request(app)
      .get('/api/provider/bookings?limit=100')
      .set(auth(otherProviderToken))
    expect(response.body.data).toHaveLength(0)

    response = await request(app)
      .get('/api/provider/bookings?limit=100')
      .set(auth(adminToken))
    expect(response.body.data.map((item: { id: string }) => item.id)).toContain(
      booking.id,
    )

    response = await request(app)
      .get(`/api/provider/bookings?providerId=${otherProviderId}`)
      .set(auth(adminToken))
    expect(response.body.data).toHaveLength(0)

    response = await request(app)
      .get('/api/provider/bookings')
      .set(auth(customerToken))
    expect(response.status).toBe(403)
  })

  it('enforces booking detail access', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .get(`/api/bookings/${booking.id}`)
      .set(auth(customerToken))
    expect(response.status).toBe(200)

    response = await request(app)
      .get(`/api/bookings/${booking.id}`)
      .set(auth(providerToken))
    expect(response.status).toBe(200)

    response = await request(app)
      .get(`/api/bookings/${booking.id}`)
      .set(auth(otherProviderToken))
    expect(response.status).toBe(403)

    response = await request(app)
      .get(`/api/bookings/${booking.id}`)
      .set(auth(adminToken))
    expect(response.status).toBe(200)

    response = await request(app)
      .get('/api/bookings/not-an-id')
      .set(auth(customerToken))
    expect(response.status).toBe(400)

    response = await request(app)
      .get('/api/bookings/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set(auth(customerToken))
    expect(response.status).toBe(404)
  })

  it('applies the booking lifecycle and blocks terminal transitions', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(customerToken))
      .send({ status: 'confirmed' })
    expect(response.status).toBe(403)

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'confirmed' })
    expect(response.status).toBe(200)
    expect(response.body.data.status).toBe('confirmed')

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'completed' })
    expect(response.status).toBe(200)

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'cancelled' })
    expect(response.status).toBe(409)
  })

  it('releases the date slot when a booking is cancelled', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'confirmed' })
    expect(response.status).toBe(200)

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(customerToken))
      .send({ status: 'cancelled' })
    expect(response.status).toBe(200)

    response = await book(adminToken, String(venue.id))
    expect(response.status).toBe(201)
  })

  it('supports rejection and keeps terminal states closed', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'rejected' })
    expect(response.status).toBe(200)

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(providerToken))
      .send({ status: 'confirmed' })
    expect(response.status).toBe(409)
  })

  it('rejects invalid status values and invalid transitions', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    let response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(adminToken))
      .send({ status: 'nonsense' })
    expect(response.status).toBe(400)

    response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(adminToken))
      .send({ status: 'completed' })
    expect(response.status).toBe(409)
  })

  it('uses the partial unique index to survive a concurrent race', async () => {
    const payload = {
      serviceId: String(venue.id),
      eventDate: '2027-06-01',
      guestCount: 10,
      phone: '+91 90000 00000',
    }

    const [first, second] = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set(auth(customerToken))
        .send(payload),
      request(app).post('/api/bookings').set(auth(adminToken)).send(payload),
    ])

    expect([first.status, second.status].sort()).toEqual([201, 409])
  })

  it('lets an admin override the lifecycle', async () => {
    const booking = (await book(customerToken, String(venue.id))).body.data

    const response = await request(app)
      .patch(`/api/bookings/${booking.id}/status`)
      .set(auth(adminToken))
      .send({ status: 'confirmed' })

    expect(response.status).toBe(200)
    expect(response.body.data.status).toBe('confirmed')
  })

  it('rejects malformed booking input', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set(auth(customerToken))
      .send({ serviceId: 'nope', eventDate: DATE, guestCount: 0 })

    expect(response.status).toBe(400)
    expect(response.body.errors.length).toBeGreaterThan(0)
  })
})
