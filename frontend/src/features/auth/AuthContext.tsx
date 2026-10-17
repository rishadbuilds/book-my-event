import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'user' | 'admin'

interface AuthState {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  return (
    <AuthContext.Provider
      value={{ role, login: setRole, logout: () => setRole(null) }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}