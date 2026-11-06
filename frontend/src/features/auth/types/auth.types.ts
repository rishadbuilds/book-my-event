export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  avatarUrl?: string
  bio?: string
  businessName?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface RegistrationPending {
  email: string
  message: string
  expiresAt: string
  resendAvailableAt: string
  /** Development-only convenience; absent in production. */
  devOtp?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest'
