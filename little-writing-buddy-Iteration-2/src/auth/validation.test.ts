import { describe, expect, it } from 'vitest'
import { validateSignUpCredentials } from './validation'

describe('feature: sign-up validation', () => {
  it('correct: accepts a normal kid name and password', () => {
    expect(validateSignUpCredentials('Amy', 'pass123')).toBeNull()
    expect(validateSignUpCredentials('Jo Lee', 'secret')).toBeNull()
  })

  it('wrong: rejects long digit spam and repeated characters', () => {
    expect(
      validateSignUpCredentials(
        '111111111111111111111111111111111111111111111',
        'secret',
      ),
    ).toBe('Please use a shorter name (up to 20 characters).')
    expect(validateSignUpCredentials('11111', 'secret')).toBe(
      'Please choose a name with letters.',
    )
    expect(validateSignUpCredentials('Sam', '11111111')).toBe(
      'Please choose a stronger password.',
    )
  })
})
