import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { env } from '../../infrastructure/config/env.config.js'
import { AppError, NotFoundError } from '../../domain/errors/AppError.js'

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
}

interface MongoDuplicateKeyError extends Error {
  code?: number
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    })
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    })
    return
  }

  if ((error as MongoDuplicateKeyError)?.code === 11000) {
    res.status(409).json({ message: 'Resource already exists' })
    return
  }

  console.error('[error]', error)

  res.status(500).json({
    message:
      env.isProduction || !(error instanceof Error)
        ? 'Internal server error'
        : error.message,
  })
}
