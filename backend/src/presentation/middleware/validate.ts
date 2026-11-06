import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ValidationError } from '../../domain/errors/AppError.js'

function validationError(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): ValidationError {
  return new ValidationError(
    'Validation failed',
    error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    })),
  )
}

/** Parses and replaces the request body with the validated DTO. */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(validationError(result.error))
    }

    req.body = result.data as typeof req.body
    next()
  }

/** Parses the query string and stores the typed result on `res.locals`. */
export const validateQuery =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return next(validationError(result.error))
    }

    res.locals.validatedQuery = result.data
    next()
  }

/** Parses route params (for example ObjectId checks) into `res.locals`. */
export const validateParams =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      return next(validationError(result.error))
    }

    res.locals.validatedParams = result.data
    next()
  }
