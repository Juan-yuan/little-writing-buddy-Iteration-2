import { useState } from 'react'
import {
  ensureDemoAccount,
  readStoredUser,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from './storage'
import { AuthContext, type AuthProviderProps } from './authContextValue'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(() => {
    ensureDemoAccount()
    return readStoredUser()
  })

  function signIn(email: string, password: string) {
    const result = signInAccount({ email, password })
    if ('error' in result) return result.error
    setUser(result.user)
    return null
  }

  function signUp(name: string, email: string, password: string) {
    const result = signUpAccount({ name, email, password })
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
