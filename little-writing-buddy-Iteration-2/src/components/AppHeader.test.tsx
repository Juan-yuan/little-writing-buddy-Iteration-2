import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { header, site } from '../content/siteCopy'
import { AppHeader } from './AppHeader'

function renderHeader() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AppHeader />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('feature: app header', () => {
  it('correct: shows brand, practice label, tagline, and home link', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: site.name })).toBeInTheDocument()
    expect(screen.getByText(header.practiceLabel)).toBeInTheDocument()
    expect(screen.getByText(site.tagline)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: header.backHome })).toHaveAttribute('href', '/')
  })

  it('wrong: does not invent alternate product branding', () => {
    renderHeader()

    expect(screen.queryByText(/writing wizard/i)).not.toBeInTheDocument()
  })
})
