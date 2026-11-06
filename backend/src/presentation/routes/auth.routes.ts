import { Router } from 'express'
import { container } from 'tsyringe'
// Ensure the composition root has registered every adapter before resolving.
import '../../infrastructure/di/container.js'
import { AuthController } from '../controllers/AuthController.js'
import { authenticate } from '../middleware/authenticate.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validate } from '../middleware/validate.js'
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  updateProfileSchema,
  verifyOtpSchema,
} from '../../application/dtos/auth.dto.js'

const authRouter = Router()
const authController = container.resolve(AuthController)

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(authController.register),
)

authRouter.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  asyncHandler(authController.verifyOtp),
)

authRouter.post(
  '/resend-otp',
  validate(resendOtpSchema),
  asyncHandler(authController.resendOtp),
)

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(authController.login),
)

authRouter.get('/me', authenticate, asyncHandler(authController.me))

authRouter.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile),
)

authRouter.patch(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
)

export { authRouter }
