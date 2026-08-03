import { describe, expect, it } from 'vitest'
import { DEMO_ACCOUNT } from './demoAccount'
import {
  ensureDemoAccount,
  readStoredUser,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from './storage'

describe('feature: local auth storage', () => {
  it('correct: sign-up then sign-in returns the same account', () => {
    const created = signUpAccount({
      name: 'Alex',
      email: 'alex@school.edu',
      password: 'pass123',
    })
    expect(created).toMatchObject({
      user: { name: 'Alex', email: 'alex@school.edu' },
    })
    if ('error' in created) throw new Error(created.error)

    signOutAccount()
    expect(readStoredUser()).toBeNull()

    const signedIn = signInAccount({
      email: 'Alex@school.edu',
      password: 'pass123',
    })
    expect(signedIn).toEqual({
      user: {
        id: created.user.id,
        name: 'Alex',
        email: 'alex@school.edu',
      },
    })
    expect(readStoredUser()?.email).toBe('alex@school.edu')
  })

  it('correct: demo account is available with published credentials', () => {
    ensureDemoAccount()
    const signedIn = signInAccount({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    })
    expect(signedIn).toEqual({
      user: {
        id: DEMO_ACCOUNT.id,
        name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
      },
    })
  })

  it('wrong: empty fields or bad password are rejected', () => {
    expect(
      signUpAccount({ name: '  ', email: 'a@b.co', password: 'x' }),
    ).toEqual({
      error: 'Please enter a name.',
    })
    expect(
      signUpAccount({ name: 'Sam', email: 'sam@school.edu', password: '' }),
    ).toEqual({
      error: 'Please enter a password.',
    })

    signUpAccount({
      name: 'Sam',
      email: 'sam@school.edu',
      password: 'secret',
    })
    expect(
      signInAccount({ email: 'sam@school.edu', password: 'wrong' }),
    ).toEqual({
      error: 'Email or password does not match.',
    })
    expect(
      signUpAccount({
        name: 'Sam Two',
        email: 'sam@school.edu',
        password: 'other',
      }),
    ).toEqual({
      error: 'That email is already registered. Try signing in.',
    })
    expect(signInAccount({ email: '', password: 'x' })).toEqual({
      error: 'Please enter an email.',
    })
    expect(signInAccount({ email: 'sam@school.edu', password: '' })).toEqual({
      error: 'Please enter a password.',
    })
  })

  it('wrong: junk sign-up names and weak passwords are rejected', () => {
    expect(
      signUpAccount({
        name: '111111111111111111111111111111111111111111111',
        email: 'junk@school.edu',
        password: 'secret',
      }),
    ).toEqual({
      error: 'Please use a shorter name (up to 20 characters).',
    })
    expect(
      signUpAccount({
        name: '11111',
        email: 'junk@school.edu',
        password: 'secret',
      }),
    ).toEqual({
      error: 'Please choose a name with letters.',
    })
    expect(
      signUpAccount({
        name: 'aaaa',
        email: 'junk@school.edu',
        password: 'secret',
      }),
    ).toEqual({
      error: 'Please choose a different name.',
    })
    expect(
      signUpAccount({
        name: 'A',
        email: 'junk@school.edu',
        password: 'secret',
      }),
    ).toEqual({
      error: 'Name needs at least 2 characters.',
    })
    expect(
      signUpAccount({
        name: 'Sam',
        email: 'sam2@school.edu',
        password: '1111',
      }),
    ).toEqual({
      error: 'Please choose a stronger password.',
    })
    expect(
      signUpAccount({
        name: 'Sam',
        email: 'sam2@school.edu',
        password: 'abc',
      }),
    ).toEqual({
      error: 'Password needs at least 4 characters.',
    })
    expect(
      signUpAccount({
        name: 'Sam',
        email: 'sam2@school.edu',
        password: '1'.repeat(40),
      }),
    ).toEqual({
      error: 'Please use a shorter password (up to 32 characters).',
    })
  })

  it('wrong: corrupt storage values fall back safely', () => {
    localStorage.setItem('little-writing-buddy-accounts', '{not-json')
    localStorage.setItem('little-writing-buddy-user', '{not-json')
    expect(signInAccount({ email: 'anyone@school.edu', password: 'x' })).toEqual(
      {
        error: 'Email or password does not match.',
      },
    )
    expect(readStoredUser()).toBeNull()

    localStorage.setItem('little-writing-buddy-accounts', '{"not":"array"}')
    localStorage.setItem(
      'little-writing-buddy-user',
      JSON.stringify({ id: '1', name: 'Only' }),
    )
    expect(readStoredUser()).toBeNull()
  })
})
