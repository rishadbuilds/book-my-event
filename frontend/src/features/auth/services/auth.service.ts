import { apiClient } from '@/shared/lib/api-client'
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegistrationPending,
  VerifyOtpPayload,
} from '../types/auth.types'

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  /** Starts registration and emails a one-time code. Does not create the user yet. */
  register: (payload: RegisterPayload) =>
    apiClient.post<RegistrationPending>('/auth/register', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<AuthResponse>('/auth/verify-otp', payload),

  resendOtp: (email: string) =>
    apiClient.post<RegistrationPending>('/auth/resend-otp', { email }),

  me: () => apiClient.get<{ user: AuthUser }>('/auth/me'),
}
