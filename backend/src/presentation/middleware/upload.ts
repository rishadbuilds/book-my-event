import type { RequestHandler } from 'express'
import multer from 'multer'
import { env } from '../../infrastructure/config/env.config.js'
import { ValidationError } from '../../domain/errors/AppError.js'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const parser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploads.maxFileSizeBytes,
    files: env.uploads.maxFiles,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new ValidationError(
          'Only JPEG, PNG, WebP, GIF, or AVIF images are allowed',
        ),
      )
      return
    }

    callback(null, true)
  },
}).array('images', env.uploads.maxFiles)

/**
 * Parses multipart form data and translates Multer's errors into the API's
 * validation error shape.
 */
export const uploadImages: RequestHandler = (req, res, next) => {
  parser(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const maxMb = Math.round(env.uploads.maxFileSizeBytes / (1024 * 1024))
        return next(
          new ValidationError(`Each image must be ${maxMb}MB or smaller`),
        )
      }

      return next(
        new ValidationError(
          `You can upload up to ${env.uploads.maxFiles} images`,
        ),
      )
    }

    if (error) return next(error)

    next()
  })
}
