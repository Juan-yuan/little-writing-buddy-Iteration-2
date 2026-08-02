import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { landing, site, sponsor } from '../content/siteCopy'
import { LandingPage } from './LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('feature: landing page', () => {
  it('correct: shows brand, description, sponsor, and practice CTA', () => {
    renderLanding()

    expect(screen.getByRole('heading', { level: 1, name: site.name })).toBeInTheDocument()
    expect(screen.getByText(landing.description)).toBeInTheDocument()
    expect(screen.getByText(`${sponsor.label} ${sponsor.name}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: landing.ctaPrimary })).toHaveAttribute(
      'href',
      '/practice',
    )
    expect(screen.getByRole('heading', { name: landing.howTitle })).toBeInTheDocument()
  })

  it('wrong: does not dump users into practice as the only content', () => {
    renderLanding()

    expect(screen.queryByLabelText('Letter selection')).not.toBeInTheDocument()
    expect(screen.queryByText(/pick a letter to see your worksheet/i)).not.toBeInTheDocument()
  })
})
