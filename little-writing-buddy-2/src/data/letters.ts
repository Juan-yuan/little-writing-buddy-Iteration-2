import type { LetterCase } from '../types/practice'

export const alphabet = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
)

/** Always store the selected letter as uppercase A–Z. */
export function normalizeLetter(letter: string): string {
  return letter.toUpperCase().slice(0, 1)
}

/** Format a letter for display based on the active case mode. */
export function getDisplayLetter(letter: string, letterCase: LetterCase): string {
  const base = normalizeLetter(letter)
  return letterCase === 'uppercase' ? base : base.toLowerCase()
}
