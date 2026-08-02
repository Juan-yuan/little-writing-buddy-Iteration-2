import { createContext, type ReactNode } from 'react'
import type { AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  signIn: (name: string, password: string) => string | null
  signUp: (name: string, password: string) => string | null
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export type AuthProviderProps = {
  children: ReactNode
}
