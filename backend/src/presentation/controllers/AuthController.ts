import { inject, injectable } from 'tsyringe'
import type { Request, Response } from 'express'
import { RegisterUser } from '../../application/usecases/auth/RegisterUser.js'
import { LoginUser } from '../../application/usecases/auth/LoginUser.js'
import { GetCurrentUser } from '../../application/usecases/auth/GetCurrentUser.js'
import type { LoginUserDto, RegisterUserDto } from '../../application/dtos/auth.dto.js'

@injectable()
export class AuthController {
  constructor(
    @inject(RegisterUser) private readonly registerUser: RegisterUser,
    @inject(LoginUser) private readonly loginUser: LoginUser,
    @inject(GetCurrentUser) private readonly getCurrentUser: GetCurrentUser,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUser.execute(req.body as RegisterUserDto)
    res.status(201).json(result)
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
