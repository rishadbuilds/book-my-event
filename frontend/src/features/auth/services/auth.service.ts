import { apiClient } from '@/shared/lib/api-client'
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegistrationPending,
  UpdateProfilePayload,
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

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<{ user: AuthUser }>('/auth/profile', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.patch<{ message: string }>('/auth/password', payload),
}
