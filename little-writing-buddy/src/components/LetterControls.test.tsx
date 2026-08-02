import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { letters as copy } from '../content/siteCopy'
import { LetterControls } from './LetterControls'

describe('feature: letter controls', () => {
  it('correct: selecting a letter and case notifies the parent', async () => {
    const user = userEvent.setup()
    const onCaseChange = vi.fn()
    const onLetterChange = vi.fn()

    render(
      <LetterControls
        letterCase="uppercase"
        selectedLetter="A"
        onCaseChange={onCaseChange}
        onLetterChange={onLetterChange}
      />,
    )

    expect(screen.getByRole('button', { name: 'Letter A' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Letter A' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await user.click(screen.getByRole('button', { name: copy.lowercase }))
    expect(onCaseChange).toHaveBeenCalledWith('lowercase')

    await user.click(screen.getByRole('button', { name: 'Letter B' }))
    expect(onLetterChange).toHaveBeenCalledWith('B')
  })

  it('wrong: lowercase mode shows lowercase labels without selecting other letters', () => {
    render(
      <LetterControls
        letterCase="lowercase"
        selectedLetter="C"
        onCaseChange={vi.fn()}
        onLetterChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Letter c' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Letter a' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByText(copy.nowTracing)).toBeInTheDocument()
  })
})
