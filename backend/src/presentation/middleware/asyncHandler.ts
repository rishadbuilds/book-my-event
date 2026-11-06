import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>

/**
 * Express 5 forwards rejected promises automatically, but wrapping keeps the
 * behaviour explicit and safe if handlers are reused on Express 4.
 */
export const asyncHandler =
  (handler: AsyncHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
