import type { LetterCase, WorksheetCase } from '../types/practice'

export interface WorksheetRowData {
  baseLetter: string
  letterCase: LetterCase
  key: string
}

/** Expand selected letters and case mode into printable worksheet rows. */
export function buildWorksheetRows(
  letters: string[],
  worksheetCase: WorksheetCase,
): WorksheetRowData[] {
  const rows: WorksheetRowData[] = []

  for (const letter of letters) {
    if (worksheetCase === 'uppercase' || worksheetCase === 'both') {
      rows.push({
        baseLetter: letter,
        letterCase: 'uppercase',
        key: `${letter}-upper`,
      })
    }
    if (worksheetCase === 'lowercase' || worksheetCase === 'both') {
      rows.push({
        baseLetter: letter,
        letterCase: 'lowercase',
        key: `${letter}-lower`,
      })
    }
  }

  return rows
}

export const TRACE_REPEAT_COUNT = 7
