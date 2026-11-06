import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { InitiateRegistration } from '../../application/usecases/auth/InitiateRegistration.js'
import { VerifyRegistrationOtp } from '../../application/usecases/auth/VerifyRegistrationOtp.js'
import { ResendRegistrationOtp } from '../../application/usecases/auth/ResendRegistrationOtp.js'
import { LoginUser } from '../../application/usecases/auth/LoginUser.js'
import { GetCurrentUser } from '../../application/usecases/auth/GetCurrentUser.js'
import type {
  LoginUserDto,
  RegisterUserDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../../application/dtos/auth.dto.js'

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
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.initiateRegistration.execute(
      req.body as RegisterUserDto,
    )
    res.status(202).json(result)
  }

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.verifyRegistrationOtp.execute(
      req.body as VerifyOtpDto,
    )
    res.status(201).json(result)
  }

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.resendRegistrationOtp.execute(
      req.body as ResendOtpDto,
    )
    res.status(200).json(result)
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUser.execute(req.body as LoginUserDto)
    res.status(200).json(result)
  }

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.getCurrentUser.execute(req.auth!.sub)
    res.status(200).json({ user })
  }
}
