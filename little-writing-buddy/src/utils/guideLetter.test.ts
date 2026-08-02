import { describe, expect, it, vi } from 'vitest'
import { createFake2dContext } from '../test/canvasMock'
import {
  drawDottedGuideLetter,
  drawGuideLetterSolid,
  drawHandwritingGuidelines,
  drawPracticeGuide,
  getGuideLayout,
  getGuideLetterMetrics,
  hasDescender,
} from './guideLetter'

describe('feature: handwriting guides', () => {
  it('correct: layout and descender metrics are computed for known sizes', () => {
    const layout = getGuideLayout(200, 100)

    expect(hasDescender('g')).toBe(true)
    expect(layout.left).toBeCloseTo(16)
    expect(layout.baseline).toBeCloseTo(72)

    const metrics = getGuideLetterMetrics(200, 100, 'A', 'uppercase')
    expect(metrics.fontSize).toBeGreaterThan(0)
    expect(metrics.baselineY).toBe(layout.baseline)
  })

  it('wrong: non-descender letters do not use descender spacing rules', () => {
    expect(hasDescender('a')).toBe(false)
    expect(hasDescender('')).toBe(false)

    const short = getGuideLetterMetrics(200, 100, 'a', 'lowercase')
    const tall = getGuideLetterMetrics(200, 100, 'g', 'lowercase')
    expect(tall.fontSize).toBeGreaterThan(short.fontSize)
  })

  it('correct: drawing helpers paint guidelines and guide letters', () => {
    const ctx = createFake2dContext()

    drawHandwritingGuidelines(ctx, 200, 200, 'uppercase', 'A')
    drawHandwritingGuidelines(ctx, 200, 200, 'lowercase', 'g')
    drawGuideLetterSolid(ctx, 200, 200, 'A', 'uppercase', '#000')
    drawDottedGuideLetter(ctx, 200, 200, 'a', 'lowercase')
    drawPracticeGuide(ctx, 200, 200, 'B', 'uppercase')

    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalled()
    expect(ctx.strokeText).toHaveBeenCalled()
    expect(ctx.setLineDash).toHaveBeenCalled()
  })

  it('wrong: uppercase guidelines skip descender labels', () => {
    const ctx = createFake2dContext()
    drawHandwritingGuidelines(ctx, 180, 180, 'uppercase', 'Y')

    const labels = vi.mocked(ctx.fillText).mock.calls.map((call) => call[0])
    expect(labels).toContain('top')
    expect(labels).toContain('base')
    expect(labels).not.toContain('mid')
    expect(labels).not.toContain('tail')
  })
})
