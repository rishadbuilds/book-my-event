import { Router } from 'express'
import { container } from 'tsyringe'
import '../../infrastructure/di/container.js'
import { UploadController } from '../controllers/UploadController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { uploadImages } from '../middleware/upload.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { UserRole } from '../../shared/constants/Roles.js'

const uploadRouter = Router()
const uploadController = container.resolve(UploadController)

uploadRouter.post(
  '/images',
  authenticate,
  authorize(UserRole.PROVIDER, UserRole.ADMIN),
  uploadImages,
  asyncHandler(uploadController.uploadImages),
)

export { uploadRouter }
