import { describe, expect, it } from 'vitest'

/** Mirrors the stroke scaling used when the tracing board resizes. */
function scaleStrokes(
  strokes: { x: number; y: number }[][],
  scaleX: number,
  scaleY: number,
) {
  if (scaleX === 1 && scaleY === 1) return strokes
  return strokes.map((stroke) =>
    stroke.map((point) => ({
      x: point.x * scaleX,
      y: point.y * scaleY,
    })),
  )
}

describe('feature: tracing canvas responsive scaling', () => {
  it('correct: scales stroke points when the board shrinks to a phone size', () => {
    const strokes = [
      [
        { x: 100, y: 50 },
        { x: 200, y: 150 },
      ],
    ]

    const scaled = scaleStrokes(strokes, 0.5, 0.5)

    expect(scaled).toEqual([
      [
        { x: 50, y: 25 },
        { x: 100, y: 75 },
      ],
    ])
  })

  it('wrong: does not leave desktop coordinates unchanged after a phone resize', () => {
    const strokes = [[{ x: 400, y: 300 }]]
    const scaled = scaleStrokes(strokes, 375 / 800, 280 / 460)

    expect(scaled[0][0].x).not.toBe(400)
    expect(scaled[0][0].y).not.toBe(300)
    expect(scaled[0][0].x).toBeCloseTo(187.5, 5)
  })
})
