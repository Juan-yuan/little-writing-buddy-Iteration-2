import { createContext, type ReactNode } from 'react'
import type { AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  signIn: (email: string, password: string) => string | null
  signUp: (name: string, email: string, password: string) => string | null
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export type AuthProviderProps = {
  children: ReactNode
}
