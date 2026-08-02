import { describe, expect, it } from 'vitest'
import { buildWorksheetRows, TRACE_REPEAT_COUNT } from './worksheetRows'

describe('feature: worksheet rows', () => {
  it('correct: expands letters for both uppercase and lowercase', () => {
    const rows = buildWorksheetRows(['A', 'B'], 'both')

    expect(TRACE_REPEAT_COUNT).toBe(7)
    expect(rows).toHaveLength(4)
    expect(rows.map((row) => row.key)).toEqual([
      'A-upper',
      'A-lower',
      'B-upper',
      'B-lower',
    ])
  })

  it('wrong: empty letter selection produces no worksheet rows', () => {
    expect(buildWorksheetRows([], 'uppercase')).toEqual([])
    expect(buildWorksheetRows([], 'both')).toEqual([])
  })
})
