import type { RequestHandler } from 'express'
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../domain/errors/AppError.js'
import type { UserRole } from '../../shared/constants/Roles.js'

/**
 * Must run after `authenticate`. Restricts a route to the given roles.
 * Ownership checks still belong in the use cases.
 */
export const authorize =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required'))
    }

    if (!allowedRoles.includes(req.auth.role as UserRole)) {
      return next(
        new ForbiddenError(
          'You do not have permission to perform this action',
        ),
      )
    }

    next()
  }
