import { apiClient } from '@/shared/lib/api-client'
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types'

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),

  me: () => apiClient.get<{ user: AuthUser }>('/auth/me'),
}
