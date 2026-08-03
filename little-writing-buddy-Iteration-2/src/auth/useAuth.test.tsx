import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { DEMO_ACCOUNT } from './demoAccount'
import { signUpAccount } from './storage'
import { useAuth } from './useAuth'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('feature: auth context hook', () => {
  it('correct: useAuth works inside AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  it('wrong: useAuth throws outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    )
  })

  it('correct: sign-up, sign-in, and sign-out update the provider user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      expect(
        result.current.signUp('Casey', 'casey@school.edu', 'secret'),
      ).toBeNull()
    })
    expect(result.current.user?.name).toBe('Casey')
    expect(result.current.user?.email).toBe('casey@school.edu')

    act(() => {
      result.current.signOut()
    })
    expect(result.current.user).toBeNull()

    act(() => {
      expect(result.current.signIn('casey@school.edu', 'secret')).toBeNull()
    })
    expect(result.current.user?.name).toBe('Casey')
  })

  it('correct: demo account signs in from the provider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      expect(
        result.current.signIn(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password),
      ).toBeNull()
    })
    expect(result.current.user).toEqual({
      id: DEMO_ACCOUNT.id,
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
    })
  })

  it('wrong: failed auth keeps the user signed out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      expect(result.current.signIn('missing@school.edu', 'nope')).toBe(
        'Email or password does not match.',
      )
    })
    expect(result.current.user).toBeNull()

    act(() => {
      expect(result.current.signUp('  ', 'a@b.co', 'x')).toBe(
        'Please enter a name.',
      )
    })
    expect(result.current.user).toBeNull()
  })

  it('correct: provider hydrates an already signed-in user', () => {
    signUpAccount({
      name: 'Morgan',
      email: 'morgan@school.edu',
      password: 'secret',
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user?.name).toBe('Morgan')
  })
})
