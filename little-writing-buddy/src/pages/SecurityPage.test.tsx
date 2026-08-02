import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from '../components/AppErrorBoundary'
import { httpErrors, securityPage, site } from '../content/siteCopy'
import { SecurityPage } from './SecurityPage'

describe('feature: security page', () => {
  it('correct: lists principles and demo links for each status page', () => {
    render(
      <MemoryRouter>
        <SecurityPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: securityPage.title })).toBeInTheDocument()
    expect(screen.getByText(site.name)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /404/ })).toHaveAttribute('href', '/404')
    expect(screen.getByRole('link', { name: /500/ })).toHaveAttribute('href', '/500')
    expect(screen.getByRole('link', { name: /502/ })).toHaveAttribute('href', '/502')
    expect(screen.getByRole('link', { name: httpErrors.home })).toHaveAttribute('href', '/')
  })

  it('wrong: simulated crash is caught as a safe 500 page without leaking the error', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <MemoryRouter>
        <AppErrorBoundary>
          <SecurityPage />
        </AppErrorBoundary>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: securityPage.trigger500 }))

    expect(screen.getByRole('heading', { name: httpErrors.pages[500].title })).toBeInTheDocument()
    expect(screen.queryByText(/Simulated unexpected failure/)).not.toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
