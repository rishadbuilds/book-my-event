import { createContext } from 'react'
import type {
  AuthStatus,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
