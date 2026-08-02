import { describe, expect, it } from 'vitest'
import { accuracy } from '../content/siteCopy'
import { evaluateTracingAccuracy } from './tracingAccuracy'

describe('feature: tracing accuracy', () => {
  it('correct: enough stroke points with valid canvas size can be evaluated', () => {
    const strokes = [
      Array.from({ length: 40 }, (_, index) => ({
        x: 40 + index * 2,
        y: 50 + Math.sin(index / 3) * 10,
      })),
    ]

    const result = evaluateTracingAccuracy({
      strokes,
      width: 200,
      height: 200,
      letter: 'A',
      letterCase: 'uppercase',
    })

    expect(result.pointCount).toBe(40)
    expect(typeof result.score).toBe('number')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(typeof result.incomplete).toBe('boolean')
    expect(result.message.length).toBeGreaterThan(0)
  })

  it('wrong: empty strokes or zero-size canvas are marked incomplete', () => {
    const empty = evaluateTracingAccuracy({
      strokes: [],
      width: 200,
      height: 200,
      letter: 'A',
      letterCase: 'uppercase',
    })

    expect(empty).toMatchObject({
      score: 0,
      incomplete: true,
      message: accuracy.incomplete,
      pointCount: 0,
    })

    const zeroSize = evaluateTracingAccuracy({
      strokes: [[{ x: 1, y: 1 }]],
      width: 0,
      height: 0,
      letter: 'B',
      letterCase: 'lowercase',
    })

    expect(zeroSize.incomplete).toBe(true)
    expect(zeroSize.score).toBe(0)
  })
})
