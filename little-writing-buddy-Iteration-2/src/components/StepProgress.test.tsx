import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { flow as copy } from '../content/siteCopy'
import { StepProgress } from './StepProgress'

describe('feature: step progress', () => {
  it('correct: marks the current step and completed steps', () => {
    render(<StepProgress currentStep={2} />)

    expect(screen.getByRole('navigation', { name: copy.ariaLabel })).toBeInTheDocument()

    const current = screen.getByText(copy.step2).closest('li')
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toHaveClass('current')

    const complete = screen.getByText(copy.step1).closest('li')
    expect(complete).toHaveClass('complete')
    expect(complete?.querySelector('.step-progress-marker')).toHaveTextContent('✓')
  })

  it('wrong: future steps are not current or complete', () => {
    render(<StepProgress currentStep={1} />)

    const future = screen.getByText(copy.step3).closest('li')
    expect(future).not.toHaveAttribute('aria-current')
    expect(future).not.toHaveClass('complete')
    expect(future).not.toHaveClass('current')
    expect(future?.querySelector('.step-progress-marker')).toHaveTextContent('3')
  })
})
