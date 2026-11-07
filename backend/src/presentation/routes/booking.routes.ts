import { Router } from 'express'
import { container } from 'tsyringe'
import '../../infrastructure/di/container.js'
import { BookingController } from '../controllers/BookingController.js'
import { authenticate } from '../middleware/authenticate.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  validate,
  validateParams,
  validateQuery,
} from '../middleware/validate.js'
import {
  bookingIdParamsSchema,
  createBookingSchema,
  listBookingsQuerySchema,
  updateBookingStatusSchema,
} from '../../application/dtos/booking.dto.js'

const bookingRouter = Router()
const bookingController = container.resolve(BookingController)

bookingRouter.post(
  '/',
  authenticate,
  validate(createBookingSchema),
  asyncHandler(bookingController.create),
)

bookingRouter.get(
  '/',
  authenticate,
  validateQuery(listBookingsQuerySchema),
  asyncHandler(bookingController.list),
)

bookingRouter.get(
  '/:id',
  authenticate,
  validateParams(bookingIdParamsSchema),
  asyncHandler(bookingController.get),
)

bookingRouter.patch(
  '/:id/status',
  authenticate,
  validateParams(bookingIdParamsSchema),
  validate(updateBookingStatusSchema),
  asyncHandler(bookingController.updateStatus),
)

export { bookingRouter }
