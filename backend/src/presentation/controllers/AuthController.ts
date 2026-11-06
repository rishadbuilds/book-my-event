import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { InitiateRegistration } from '../../application/usecases/auth/InitiateRegistration.js'
import { VerifyRegistrationOtp } from '../../application/usecases/auth/VerifyRegistrationOtp.js'
import { ResendRegistrationOtp } from '../../application/usecases/auth/ResendRegistrationOtp.js'
import { LoginUser } from '../../application/usecases/auth/LoginUser.js'
import { GetCurrentUser } from '../../application/usecases/auth/GetCurrentUser.js'
import { UpdateProfile } from '../../application/usecases/auth/UpdateProfile.js'
import { ChangePassword } from '../../application/usecases/auth/ChangePassword.js'
import type {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResendOtpDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from '../../application/dtos/auth.dto.js'
import { sendData } from '../utils/response.js'

@injectable()
export class AuthController {
  constructor(
    @inject(InitiateRegistration)
    private readonly initiateRegistration: InitiateRegistration,
    @inject(VerifyRegistrationOtp)
    private readonly verifyRegistrationOtp: VerifyRegistrationOtp,
    @inject(ResendRegistrationOtp)
    private readonly resendRegistrationOtp: ResendRegistrationOtp,
    @inject(LoginUser) private readonly loginUser: LoginUser,
    @inject(GetCurrentUser) private readonly getCurrentUser: GetCurrentUser,
    @inject(UpdateProfile)
    private readonly updateProfileUseCase: UpdateProfile,
    @inject(ChangePassword)
    private readonly changePasswordUseCase: ChangePassword,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.initiateRegistration.execute(
      req.body as RegisterUserDto,
    )
    sendData(res, result, 202)
  }

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.verifyRegistrationOtp.execute(
      req.body as VerifyOtpDto,
    )
    sendData(res, result, 201)
  }

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.resendRegistrationOtp.execute(
      req.body as ResendOtpDto,
    )
    sendData(res, result, 200)
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUser.execute(req.body as LoginUserDto)
    sendData(res, result, 200)
  }

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.getCurrentUser.execute(req.auth!.sub)
    sendData(res, { user }, 200)
  }

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const user = await this.updateProfileUseCase.execute(
      req.auth!.sub,
      req.body as UpdateProfileDto,
    )
    sendData(res, { user }, 200)
  }

  changePassword = async (req: Request, res: Response): Promise<void> => {
    await this.changePasswordUseCase.execute(
      req.auth!.sub,
      req.body as ChangePasswordDto,
    )
    sendData(res, { message: 'Password updated successfully' }, 200)
  }
}
