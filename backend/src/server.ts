import 'reflect-metadata'
import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './infrastructure/config/env.config.js'

async function bootstrap(): Promise<void> {
  await mongoose.connect(env.mongoUri)
  console.log('✅ MongoDB connected')

  const app = createApp()
  const server = app.listen(env.port, () => {
    console.log(`🚀 API listening on http://localhost:${env.port}`)
  })

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`)
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
