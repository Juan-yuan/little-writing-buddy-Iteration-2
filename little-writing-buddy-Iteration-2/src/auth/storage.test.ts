import { describe, expect, it } from 'vitest'
import {
  readStoredUser,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from './storage'

describe('feature: local auth storage', () => {
  it('correct: sign-up then sign-in returns the same account', () => {
    const created = signUpAccount({ name: 'Alex', password: 'pass123' })
    expect(created).toMatchObject({ user: { name: 'Alex' } })
    if ('error' in created) throw new Error(created.error)

    signOutAccount()
    expect(readStoredUser()).toBeNull()

    const signedIn = signInAccount({ name: 'alex', password: 'pass123' })
    expect(signedIn).toEqual({
      user: { id: created.user.id, name: 'Alex' },
    })
    expect(readStoredUser()?.name).toBe('Alex')
  })

  it('wrong: empty fields or bad password are rejected', () => {
    expect(signUpAccount({ name: '  ', password: 'x' })).toEqual({
      error: 'Please enter a name.',
    })
    expect(signUpAccount({ name: 'Sam', password: '' })).toEqual({
      error: 'Please enter a password.',
    })

    signUpAccount({ name: 'Sam', password: 'secret' })
    expect(signInAccount({ name: 'Sam', password: 'wrong' })).toEqual({
      error: 'Name or password does not match.',
    })
    expect(signUpAccount({ name: 'sam', password: 'other' })).toEqual({
      error: 'That name is already taken. Try signing in.',
    })
    expect(signInAccount({ name: '', password: 'x' })).toEqual({
      error: 'Please enter a name.',
    })
    expect(signInAccount({ name: 'Sam', password: '' })).toEqual({
      error: 'Please enter a password.',
    })
  })

  it('wrong: junk sign-up names and weak passwords are rejected', () => {
    expect(
      signUpAccount({
        name: '111111111111111111111111111111111111111111111',
        password: 'secret',
      }),
    ).toEqual({
      error: 'Please use a shorter name (up to 20 characters).',
    })
    expect(signUpAccount({ name: '11111', password: 'secret' })).toEqual({
      error: 'Please choose a name with letters.',
    })
    expect(signUpAccount({ name: 'aaaa', password: 'secret' })).toEqual({
      error: 'Please choose a different name.',
    })
    expect(signUpAccount({ name: 'A', password: 'secret' })).toEqual({
      error: 'Name needs at least 2 characters.',
    })
    expect(signUpAccount({ name: 'Sam', password: '1111' })).toEqual({
      error: 'Please choose a stronger password.',
    })
    expect(signUpAccount({ name: 'Sam', password: 'abc' })).toEqual({
      error: 'Password needs at least 4 characters.',
    })
    expect(
      signUpAccount({
        name: 'Sam',
        password: '1'.repeat(40),
      }),
    ).toEqual({
      error: 'Please use a shorter password (up to 32 characters).',
    })
  })

  it('wrong: corrupt storage values fall back safely', () => {
    localStorage.setItem('little-writing-buddy-accounts', '{not-json')
    localStorage.setItem('little-writing-buddy-user', '{not-json')
    expect(signInAccount({ name: 'Anyone', password: 'x' })).toEqual({
      error: 'Name or password does not match.',
    })
    expect(readStoredUser()).toBeNull()

    localStorage.setItem('little-writing-buddy-accounts', '{"not":"array"}')
    localStorage.setItem('little-writing-buddy-user', JSON.stringify({ id: '1' }))
    expect(readStoredUser()).toBeNull()
  })
})
