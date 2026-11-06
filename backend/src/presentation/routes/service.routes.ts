import { Router } from 'express'
import { container } from 'tsyringe'
import '../../infrastructure/di/container.js'
import { ServiceController } from '../controllers/ServiceController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  validate,
  validateParams,
  validateQuery,
} from '../middleware/validate.js'
import {
  createServiceSchema,
  idParamsSchema,
  listServicesQuerySchema,
  slugParamsSchema,
  updateServiceSchema,
} from '../../application/dtos/service.dto.js'
import { UserRole } from '../../shared/constants/Roles.js'

const serviceRouter = Router()
const serviceController = container.resolve(ServiceController)

serviceRouter.get(
  '/meta',
  asyncHandler(serviceController.meta),
)

serviceRouter.get(
  '/',
  validateQuery(listServicesQuerySchema),
  asyncHandler(serviceController.list),
)

serviceRouter.post(
  '/',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validate(createServiceSchema),
  asyncHandler(serviceController.create),
)

serviceRouter.get(
  '/:slug',
  validateParams(slugParamsSchema),
  asyncHandler(serviceController.getBySlug),
)

serviceRouter.patch(
  '/:id',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validateParams(idParamsSchema),
  validate(updateServiceSchema),
  asyncHandler(serviceController.update),
)

serviceRouter.delete(
  '/:id',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  validateParams(idParamsSchema),
  asyncHandler(serviceController.remove),
)

export { serviceRouter }
