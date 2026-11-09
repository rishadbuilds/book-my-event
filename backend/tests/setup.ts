import { existsSync } from 'node:fs'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll } from 'vitest'

// The env schema is parsed when the app is first imported, so every test
// dependency must be configured before the test file is evaluated.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-at-least-16-characters'
process.env.JWT_EXPIRES_IN = '1h'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.OTP_TTL_MINUTES = '10'
process.env.OTP_MAX_ATTEMPTS = '5'
process.env.OTP_RESEND_COOLDOWN_SECONDS = '0'
process.env.UPLOAD_DIR = 'uploads-test'
delete process.env.SMTP_HOST

// Reuse a locally installed mongod when available; otherwise the memory
// server downloads its own binary.
const systemBinary = [
  '/opt/homebrew/bin/mongod',
  '/usr/local/bin/mongod',
  '/usr/bin/mongod',
].find((candidate) => existsSync(candidate))

if (systemBinary) {
  process.env.MONGOMS_SYSTEM_BINARY_VERSION_CHECK = 'false'
}

const mongo = await MongoMemoryServer.create({
  binary: systemBinary ? { systemBinary } : undefined,
})

process.env.MONGODB_URI = mongo.getUri('bookmyevent_test')

await mongoose.connect(process.env.MONGODB_URI)

const { BookingModel } = await import(
  '../src/infrastructure/database/models/BookingModel.js'
)
// The double-booking guarantee lives in this partial unique index.
await BookingModel.init()

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})
