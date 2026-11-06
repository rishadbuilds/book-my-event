import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ValidationError } from '../../domain/errors/AppError.js'

/** Parses and replaces the request body with the validated DTO. */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(
        new ValidationError(
          'Validation failed',
          result.error.issues.map((issue) => ({
            field: issue.path.join('.') || 'body',
            message: issue.message,
          })),
        ),
      )
    }

    req.body = result.data
    next()
  }
