export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
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

export type AuthStatus = 'loading' | 'authenticated' | 'guest'
