import express from 'express'
import cors from 'cors'
import { env } from './infrastructure/config/env.config.js'
import './infrastructure/di/container.js'
import { apiRouter } from './presentation/routes/index.js'
import {
  errorHandler,
  notFoundHandler,
} from './presentation/middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  // Uploaded files are stored locally by the storage adapter. Serving them
  // from a CDN later only requires changing the adapter, not the API.
  app.use(
    '/uploads',
    express.static(env.uploads.dir, {
      index: false,
      dotfiles: 'deny',
      maxAge: '1d',
    }),
  )

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
