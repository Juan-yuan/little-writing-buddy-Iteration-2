import { useState } from 'react'
import {
  readStoredUser,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from './storage'
import { AuthContext, type AuthProviderProps } from './authContextValue'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(() => readStoredUser())

  function signIn(name: string, password: string) {
    const result = signInAccount({ name, password })
    if ('error' in result) return result.error
    setUser(result.user)
    return null
  }

  function signUp(name: string, password: string) {
    const result = signUpAccount({ name, password })
    if ('error' in result) return result.error
    setUser(result.user)
    return null
  }

  function signOut() {
    signOutAccount()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
