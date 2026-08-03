import { describe, expect, it } from 'vitest'
import { validateSignUpCredentials } from './validation'

describe('feature: sign-up validation', () => {
  it('correct: accepts a normal kid name, email, and password', () => {
    expect(validateSignUpCredentials('Amy', 'amy@school.edu', 'pass123')).toBeNull()
    expect(validateSignUpCredentials('Jo Lee', 'jo.lee@example.com', 'secret')).toBeNull()
  })

  it('wrong: rejects long digit spam, bad emails, and weak passwords', () => {
    expect(
      validateSignUpCredentials(
        '111111111111111111111111111111111111111111111',
        'amy@school.edu',
        'secret',
      ),
    ).toBe('Please use a shorter name (up to 20 characters).')
    expect(validateSignUpCredentials('11111', 'amy@school.edu', 'secret')).toBe(
      'Please choose a name with letters.',
    )
    expect(validateSignUpCredentials('Sam', 'not-an-email', 'secret')).toBe(
      'Please enter a valid email address.',
    )
    expect(validateSignUpCredentials('Sam', '', 'secret')).toBe(
      'Please enter an email.',
    )
    expect(validateSignUpCredentials('Sam', 'amy@school.edu', '11111111')).toBe(
      'Please choose a stronger password.',
    )
  })
})
