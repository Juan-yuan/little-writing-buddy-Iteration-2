import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { feedback as copy } from '../content/siteCopy'
import type { PracticeSummary } from '../types/practice'
import { FeedbackPanel } from './FeedbackPanel'

function makeSummary(overrides: Partial<PracticeSummary> = {}): PracticeSummary {
  return {
    attemptsCompleted: 2,
    bestScore: 88,
    latestScore: 90,
    latestIncomplete: false,
    lastFeedback: 'Great tracing! You stayed on the lines.',
    onGuidePercent: 85,
    currentLetter: 'A',
    earnedBadges: [],
    reviewKey: 1,
    ...overrides,
  }
}

describe('feature: feedback panel', () => {
  it('correct: review results show score, guide detail, and badges', () => {
    const ref = createRef<HTMLElement>()

    render(
      <FeedbackPanel
        ref={ref}
        practiceStatus="review"
        summary={makeSummary({
          latestBadge: { id: 'letter-star', name: 'Letter Star', emoji: '⭐' },
          earnedBadges: [{ id: 'letter-star', name: 'Letter Star', emoji: '⭐' }],
        })}
      />,
    )

    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(screen.getByRole('status')).toHaveTextContent('Great tracing!')
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText(copy.onGuide(90))).toBeInTheDocument()
    expect(screen.getByText(copy.newBadge('⭐', 'Letter Star'))).toBeInTheDocument()
    expect(screen.getByText('Letter Star')).toBeInTheDocument()
    expect(screen.getByText('88%')).toBeInTheDocument()
  })

  it('wrong: ready state keeps empty copy and hides numeric score', () => {
    render(
      <FeedbackPanel
        practiceStatus="ready"
        summary={makeSummary({
          reviewKey: 0,
          bestScore: 0,
          latestIncomplete: true,
          onGuidePercent: 0,
        })}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(copy.empty)
    expect(screen.getByText(copy.scoreLabel).closest('.score-card')!).toHaveTextContent('—')
    expect(screen.queryByText(/% on the lines/)).not.toBeInTheDocument()
  })

  it('correct: incomplete reviews stay unscored with practice tone', () => {
    render(
      <FeedbackPanel
        practiceStatus="review"
        summary={makeSummary({
          latestScore: 0,
          latestIncomplete: true,
          lastFeedback: 'Trace a little more of the letter, then check again!',
          onGuidePercent: 0,
        })}
      />,
    )

    expect(screen.getByRole('status')).toHaveClass('practice')
    expect(screen.getByText(copy.scoreLabel).closest('.score-card')!).toHaveTextContent('—')
  })

  it('correct: on-the-lines detail matches the score, not a separate guide ratio', () => {
    render(
      <FeedbackPanel
        practiceStatus="review"
        summary={makeSummary({
          latestScore: 50,
          onGuidePercent: 100,
        })}
      />,
    )

    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText(copy.onGuide(50))).toBeInTheDocument()
    expect(screen.queryByText(copy.onGuide(100))).not.toBeInTheDocument()
  })
})
