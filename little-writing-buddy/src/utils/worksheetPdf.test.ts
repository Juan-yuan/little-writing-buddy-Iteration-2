import { describe, expect, it, vi } from 'vitest'
import { alphabet } from '../data/letters'
import * as worksheetPdf from './worksheetPdf'

describe('feature: worksheet PDF', () => {
  it('correct: selected letters produce an A4 PDF document', () => {
    const doc = worksheetPdf.generateWorksheetPdf(['A', 'B'], 'uppercase')

    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1)
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210)
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297)
  })

  it('wrong: download is skipped when no letters are selected', () => {
    const generateSpy = vi.spyOn(worksheetPdf, 'generateWorksheetPdf')

    worksheetPdf.downloadWorksheetPdf([], 'both')

    expect(generateSpy).not.toHaveBeenCalled()
    generateSpy.mockRestore()
  })

  it('correct: multi-page and case variants generate PDFs', () => {
    const many = worksheetPdf.generateWorksheetPdf([...alphabet], 'both')
    expect(many.getNumberOfPages()).toBeGreaterThan(1)

    expect(worksheetPdf.generateWorksheetPdf(['Z'], 'lowercase').getNumberOfPages()).toBe(1)
    expect(worksheetPdf.generateWorksheetPdf(['A', 'B'], 'uppercase').getNumberOfPages()).toBe(1)
  })
})
