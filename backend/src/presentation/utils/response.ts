import type { Response } from 'express'
import type { PaginationMeta } from '../../shared/types/Pagination.js'

/**
 * Single response envelope used by the API. Errors keep the
 * `{ message, errors }` shape produced by the error handler.
 */
export function sendData<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): void {
  res.status(statusCode).json(meta ? { data, meta } : { data })
}
