import { describe, expect, it } from 'vitest'
import { badgeForScore } from './badges'

describe('feature: badges', () => {
  it('correct: high scores unlock the matching badge', () => {
    expect(badgeForScore(95)?.id).toBe('letter-star')
    expect(badgeForScore(85)?.name).toBe('Careful Tracer')
    expect(badgeForScore(70)?.id).toBe('keep-going')
  })

  it('wrong: scores below the lowest threshold earn no badge', () => {
    expect(badgeForScore(69)).toBeUndefined()
    expect(badgeForScore(0)).toBeUndefined()
    expect(badgeForScore(Number.NaN)).toBeUndefined()
  })
})
