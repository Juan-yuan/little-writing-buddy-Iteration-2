import { describe, expect, it } from 'vitest'
import { alphabet, getDisplayLetter, normalizeLetter } from './letters'

describe('feature: letter selection', () => {
  it('correct: normalizes and formats a letter for display', () => {
    expect(normalizeLetter('b')).toBe('B')
    expect(getDisplayLetter('B', 'lowercase')).toBe('b')
    expect(alphabet).toHaveLength(26)
    expect(alphabet[0]).toBe('A')
    expect(alphabet[25]).toBe('Z')
  })

  it('wrong: multi-character input is truncated to a single letter', () => {
    expect(normalizeLetter('abc')).toBe('A')
    expect(normalizeLetter('')).toBe('')
    expect(getDisplayLetter('xyz', 'uppercase')).toBe('X')
  })
})
