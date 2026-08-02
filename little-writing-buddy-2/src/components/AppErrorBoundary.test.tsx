import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { httpErrors } from '../content/siteCopy'
import { AppErrorBoundary } from './AppErrorBoundary'

function BrokenChild(): never {
  throw new Error('Simulated crash with secret path /etc/passwd')
}

describe('feature: error boundary security', () => {
  it('correct: unexpected errors are caught and shown as a 500 page', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <MemoryRouter>
        <AppErrorBoundary>
          <BrokenChild />
        </AppErrorBoundary>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: httpErrors.pages[500].title })).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('wrong: crash details and secret paths stay out of the UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <MemoryRouter>
        <AppErrorBoundary>
          <BrokenChild />
        </AppErrorBoundary>
      </MemoryRouter>,
    )

    expect(screen.queryByText(/\/etc\/passwd/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Simulated crash/)).not.toBeInTheDocument()
    expect(screen.getByText(httpErrors.pages[500].securityNote)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
