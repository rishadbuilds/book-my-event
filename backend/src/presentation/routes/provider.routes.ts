import { Router } from 'express'
import { container } from 'tsyringe'
import '../../infrastructure/di/container.js'
import { BookingController } from '../controllers/BookingController.js'
import { ServiceController } from '../controllers/ServiceController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validateParams, validateQuery } from '../middleware/validate.js'
import {
  idParamsSchema,
  listProviderServicesQuerySchema,
} from '../../application/dtos/service.dto.js'
import { listProviderBookingsQuerySchema } from '../../application/dtos/booking.dto.js'
import { UserRole } from '../../shared/constants/Roles.js'

const providerRouter = Router()
const serviceController = container.resolve(ServiceController)
const bookingController = container.resolve(BookingController)

providerRouter.get(
  '/services',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validateQuery(listProviderServicesQuerySchema),
  asyncHandler(serviceController.providerList),
)

providerRouter.get(
  '/services/:id',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validateParams(idParamsSchema),
  asyncHandler(serviceController.getProviderService),
)

providerRouter.get(
  '/bookings',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validateQuery(listProviderBookingsQuerySchema),
  asyncHandler(bookingController.providerList),
)

export { providerRouter }
