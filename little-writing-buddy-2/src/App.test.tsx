import { forwardRef, useImperativeHandle } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { flow, practice, worksheet } from './content/siteCopy'
import type { TracingCanvasHandle } from './components/TracingCanvas'
import type { TracingResult } from './utils/tracingAccuracy'

const reviewMock = vi.fn<() => TracingResult>()

vi.mock('./components/TracingCanvas', () => ({
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

function renderApp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function stubViewportHelpers(matches = true) {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 0
  })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: '(max-width: 959px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  })
}

describe('feature: app workspace', () => {
  beforeEach(() => {
    stubViewportHelpers(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('correct: tracing review updates feedback and worksheet actions work', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()

    reviewMock.mockReturnValue({
      score: 96,
      incomplete: false,
      tooFarOutside: false,
      message: 'Great tracing! You stayed on the lines.',
      onGuidePercent: 92,
      pointCount: 60,
    })

    renderApp()

    const feedbackSection = screen.getByRole('region', { name: /How did you do/i })
    feedbackSection.scrollIntoView = scrollIntoView

    expect(screen.getByText(flow.step2).closest('li')).toHaveClass('current')

    await user.click(screen.getByTestId('tracing-canvas'))
    await user.click(screen.getByRole('button', { name: practice.checkTracing }))

    await waitFor(() => {
      expect(feedbackSection.querySelector('.score-ring-value')).toHaveTextContent('96%')
    })
    expect(screen.getByText(flow.step3).closest('li')).toHaveClass('current')
    expect(scrollIntoView).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: worksheet.selectAll }))
    expect(screen.getByText(/26 letters/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: worksheet.clearAll }))
    expect(screen.getByText(worksheet.selectLetters)).toBeInTheDocument()

    const worksheetRegion = screen.getByRole('region', { name: worksheet.title })
    await user.click(within(worksheetRegion).getByRole('button', { name: 'Letter D' }))
    expect(screen.getByText(worksheet.lettersRows(1, 1))).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/')
  })

  it('wrong: changing letter or case resets the current attempt feedback', async () => {
    const user = userEvent.setup()
    stubViewportHelpers(false)

    reviewMock.mockReturnValue({
      score: 70,
      incomplete: false,
      tooFarOutside: false,
      message: 'Good job! Try to stay even closer to the dotted lines.',
      onGuidePercent: 70,
      pointCount: 40,
    })

    renderApp()
    const feedbackSection = screen.getByRole('region', { name: /How did you do/i })
    const letterRegion = screen.getByRole('region', { name: /Choose your letter/i })

    await user.click(screen.getByTestId('tracing-canvas'))
    await user.click(screen.getByRole('button', { name: practice.checkTracing }))
    await waitFor(() => {
      expect(feedbackSection.querySelector('.score-ring-value')).toHaveTextContent('70%')
    })

    await user.click(within(letterRegion).getByRole('button', { name: 'Letter B' }))
    expect(feedbackSection.querySelector('.score-ring-value')).toHaveTextContent('—')
    expect(screen.getByText(flow.step2).closest('li')).toHaveClass('current')

    await user.click(screen.getByTestId('tracing-canvas'))
    await user.click(screen.getByRole('button', { name: practice.checkTracing }))
    await waitFor(() => {
      expect(feedbackSection.querySelector('.score-ring-value')).toHaveTextContent('70%')
    })

    await user.click(within(letterRegion).getByRole('button', { name: /small letters/i }))
    expect(feedbackSection.querySelector('.score-ring-value')).toHaveTextContent('—')
  })
})
