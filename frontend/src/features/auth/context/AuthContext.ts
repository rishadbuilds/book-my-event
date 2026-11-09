import { createContext } from 'react'
import type {
  AuthStatus,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegistrationPending,
  UpdateProfilePayload,
  VerifyOtpPayload,
} from '../types/auth.types'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<RegistrationPending>
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthUser>
  resendOtp: (email: string) => Promise<RegistrationPending>
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
