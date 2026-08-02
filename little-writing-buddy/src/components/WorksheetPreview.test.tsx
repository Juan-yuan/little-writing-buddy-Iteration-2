import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { site, worksheet as copy } from '../content/siteCopy'
import { WorksheetPreview } from './WorksheetPreview'

describe('feature: worksheet preview', () => {
  it('correct: selected letters produce a printable preview', () => {
    render(<WorksheetPreview selectedLetters={['A', 'B']} worksheetCase="both" />)

    expect(screen.getByLabelText('Worksheet preview')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: site.name })).toBeInTheDocument()
    expect(
      screen.getByText(copy.instructions('Uppercase & lowercase', 'A, B')),
    ).toBeInTheDocument()
    expect(screen.getByText(copy.footer)).toBeInTheDocument()
  })

  it('wrong: empty selection shows the empty preview message', () => {
    render(<WorksheetPreview selectedLetters={[]} worksheetCase="uppercase" />)

    expect(screen.getByText(copy.emptyPreview)).toBeInTheDocument()
    expect(screen.queryByLabelText('Worksheet preview')).not.toBeInTheDocument()
  })

  it('correct: lowercase-only worksheets use the lowercase style label', () => {
    render(<WorksheetPreview selectedLetters={['C']} worksheetCase="lowercase" />)

    expect(screen.getByText(copy.instructions('Lowercase', 'C'))).toBeInTheDocument()
  })
})
