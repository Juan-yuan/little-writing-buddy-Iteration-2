import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { worksheet as copy } from '../content/siteCopy'
import { WorksheetPanel } from './WorksheetPanel'

vi.mock('../utils/worksheetPdf', () => ({
  downloadWorksheetPdf: vi.fn(),
}))

describe('feature: worksheet panel', () => {
  it('correct: letter and case controls update the worksheet status', async () => {
    const user = userEvent.setup()
    const onToggleLetter = vi.fn()
    const onSelectAllLetters = vi.fn()
    const onClearLetters = vi.fn()
    const onCaseChange = vi.fn()

    render(
      <WorksheetPanel
        selectedLetters={['A']}
        worksheetCase="uppercase"
        onToggleLetter={onToggleLetter}
        onSelectAllLetters={onSelectAllLetters}
        onClearLetters={onClearLetters}
        onCaseChange={onCaseChange}
      />,
    )

    expect(screen.getByText(copy.lettersRows(1, 1))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: copy.selectAll }))
    expect(onSelectAllLetters).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: copy.clearAll }))
    expect(onClearLetters).toHaveBeenCalled()

    await user.click(screen.getByLabelText('Letter B'))
    expect(onToggleLetter).toHaveBeenCalledWith('B')

    await user.click(screen.getByRole('button', { name: copy.both }))
    expect(onCaseChange).toHaveBeenCalledWith('both')
  })

  it('wrong: empty selection disables print/download and shows the prompt', () => {
    render(
      <WorksheetPanel
        selectedLetters={[]}
        worksheetCase="lowercase"
        onToggleLetter={vi.fn()}
        onSelectAllLetters={vi.fn()}
        onClearLetters={vi.fn()}
        onCaseChange={vi.fn()}
      />,
    )

    expect(screen.getByText(copy.selectLetters)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.print })).toBeDisabled()
    expect(screen.getByRole('button', { name: copy.downloadPdf })).toBeDisabled()
    expect(screen.getByRole('button', { name: copy.clearAll })).toBeDisabled()
  })

  it('correct: print and download actions run when letters are selected', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    const { downloadWorksheetPdf } = await import('../utils/worksheetPdf')

    render(
      <WorksheetPanel
        selectedLetters={['A', 'C']}
        worksheetCase="both"
        onToggleLetter={vi.fn()}
        onSelectAllLetters={vi.fn()}
        onClearLetters={vi.fn()}
        onCaseChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: copy.print }))
    expect(printSpy).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: copy.downloadPdf }))
    await waitFor(() => {
      expect(downloadWorksheetPdf).toHaveBeenCalledWith(['A', 'C'], 'both')
    })

    printSpy.mockRestore()
  })
})
