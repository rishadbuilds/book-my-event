import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { auth, createUser, login, PASSWORD, resetDatabase } from './helpers.js'

const app = createApp()

describe('auth and account', () => {
  beforeEach(resetDatabase)

  it('registers with an OTP, then returns a usable token', async () => {
    const email = 'new-user@example.com'

    let response = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email,
      password: PASSWORD,
    })

    expect(response.status).toBe(202)
    expect(response.body.data.devOtp).toMatch(/^\d{6}$/)

    response = await request(app).post('/api/auth/verify-otp').send({
      email,
      otp: response.body.data.devOtp,
    })

    expect(response.status).toBe(201)
    expect(response.body.data.user.email).toBe(email)
    expect(response.body.data.user.role).toBe('user')
    expect(response.body.data.user.passwordHash).toBeUndefined()

    const token = response.body.data.accessToken as string
    response = await request(app).get('/api/auth/me').set(auth(token))

    expect(response.status).toBe(200)
    expect(response.body.data.user.email).toBe(email)
  })

  it('rejects an invalid OTP', async () => {
    const email = 'otp-user@example.com'

    await request(app).post('/api/auth/register').send({
      name: 'OTP User',
      email,
      password: PASSWORD,
    })

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email, otp: '000000' })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/invalid|expired/i)
  })

  it('updates a profile without exposing the password hash', async () => {
    const user = await createUser({ name: 'Old Name' })
    const token = await login(app, user.email)

    const response = await request(app)
      .patch('/api/auth/profile')
      .set(auth(token))
      .send({
        name: 'New Name',
        phone: '+91 90000 11111',
        bio: 'Updated bio',
      })

    expect(response.status).toBe(200)
    expect(response.body.data.user.name).toBe('New Name')
    expect(response.body.data.user.phone).toBe('+91 90000 11111')
    expect(response.body.data.user.bio).toBe('Updated bio')
    expect(response.body.data.user.passwordHash).toBeUndefined()
  })

  it('validates profile input', async () => {
    const user = await createUser()
    const token = await login(app, user.email)

    const response = await request(app)
      .patch('/api/auth/profile')
      .set(auth(token))
      .send({ name: 'A' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
    )
  })

  it('changes the password and rejects a wrong current password', async () => {
    const user = await createUser()
    const token = await login(app, user.email)

    let response = await request(app)
      .patch('/api/auth/password')
      .set(auth(token))
      .send({ currentPassword: PASSWORD, newPassword: 'Password2' })

    expect(response.status).toBe(200)

    response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Password2' })

    expect(response.status).toBe(200)

    response = await request(app)
      .patch('/api/auth/password')
      .set(auth(token))
      .send({ currentPassword: 'WrongPass1', newPassword: 'Password3' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'currentPassword' }),
      ]),
    )
  })

  it('requires authentication for account endpoints', async () => {
    const response = await request(app).get('/api/auth/me')
    expect(response.status).toBe(401)
  })
})
