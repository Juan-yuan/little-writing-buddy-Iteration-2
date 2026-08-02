import { forwardRef, useImperativeHandle } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { accuracy, practice as copy } from '../content/siteCopy'
import type { TracingResult } from '../utils/tracingAccuracy'
import { PracticePreview } from './PracticePreview'
import type { TracingCanvasHandle } from './TracingCanvas'

const reviewMock = vi.fn<() => TracingResult>()

vi.mock('./TracingCanvas', () => ({
  TracingCanvas: forwardRef<TracingCanvasHandle, { onTracingStart?: () => void }>(
    function MockTracingCanvas({ onTracingStart }, ref) {
      useImperativeHandle(ref, () => ({
        review: () => reviewMock(),
      }))

      return (
        <button type="button" data-testid="tracing-canvas" onClick={() => onTracingStart?.()}>
          canvas
        </button>
      )
    },
  ),
}))

describe('feature: practice preview', () => {
  it('correct: check tracing forwards the canvas review result', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()
    const onTracingStart = vi.fn()
    const onReset = vi.fn()

    reviewMock.mockReturnValue({
      score: 92,
      incomplete: false,
      tooFarOutside: false,
      message: accuracy.great,
      onGuidePercent: 90,
      pointCount: 48,
    })

    render(
      <PracticePreview
        letterCase="uppercase"
        selectedLetter="A"
        status="tracing"
        resetToken={0}
        onReset={onReset}
        onReview={onReview}
        onTracingStart={onTracingStart}
      />,
    )

    expect(screen.getByText(copy.status.tracing, { exact: false })).toBeInTheDocument()
    await user.click(screen.getByTestId('tracing-canvas'))
    expect(onTracingStart).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: copy.checkTracing }))
    expect(onReview).toHaveBeenCalledWith(
      expect.objectContaining({ score: 92, message: accuracy.great }),
    )

    await user.click(screen.getByRole('button', { name: copy.clearRetry }))
    expect(onReset).toHaveBeenCalled()
  })

  it('wrong: ready status keeps check disabled and falls back when canvas is missing', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()

    reviewMock.mockImplementation(() => {
      throw new Error('should not run when disabled')
    })

    render(
      <PracticePreview
        letterCase="lowercase"
        selectedLetter="B"
        status="ready"
        resetToken={1}
        onReset={vi.fn()}
        onReview={onReview}
        onTracingStart={vi.fn()}
      />,
    )

    const checkButton = screen.getByRole('button', { name: copy.checkTracing })
    expect(checkButton).toBeDisabled()
    expect(checkButton).toHaveAttribute('title', copy.checkHint)
    expect(screen.getByText('b')).toBeInTheDocument()

    await user.click(checkButton)
    expect(onReview).not.toHaveBeenCalled()
  })
})
