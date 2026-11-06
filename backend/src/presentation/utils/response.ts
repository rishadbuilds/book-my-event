import type { Response } from 'express'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

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
