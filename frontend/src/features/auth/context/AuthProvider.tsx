import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { tokenStorage } from '@/shared/lib/token-storage'
import { authService } from '../services/auth.service'
import type {
  AuthStatus,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Rehydrate the session from the stored token on a hard refresh.
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!tokenStorage.get()) {
        setStatus('guest')
        return
      }

      try {
        const { user: currentUser } = await authService.me()
        if (cancelled) return
        setUser(currentUser)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        tokenStorage.clear()
        setUser(null)
        setStatus('guest')
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    tokenStorage.set(response.accessToken)
    setUser(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    tokenStorage.set(response.accessToken)
    setUser(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
