import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { httpErrors, site } from '../content/siteCopy'
import type { HttpErrorCode } from '../types/httpError'
import { HttpErrorPage } from './HttpErrorPage'

const codes: HttpErrorCode[] = [404, 500, 502]

function renderErrorPage(code: HttpErrorCode) {
  return render(
    <MemoryRouter>
      <HttpErrorPage code={code} />
    </MemoryRouter>,
  )
}

describe('feature: HTTP 404 / 500 / 502 error pages', () => {
  describe.each(codes)('HTTP %s page', (code) => {
    const content = httpErrors.pages[code]

    it(`correct: shows status ${code}, title, summary, and home link`, () => {
      renderErrorPage(code)

      expect(screen.getByText(String(code))).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: content.title })).toBeInTheDocument()
      expect(screen.getByText(content.summary)).toBeInTheDocument()
      expect(screen.getByText(content.detail)).toBeInTheDocument()
      expect(screen.getByText(content.securityNote)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: httpErrors.home })).toHaveAttribute(
        'href',
        '/',
      )
    })

    it(`wrong: status ${code} page does not leak internals`, () => {
      renderErrorPage(code)

      const body = document.body.textContent ?? ''
      expect(body).not.toMatch(/at Object\.|node_modules|\/etc\/passwd|ECONNREFUSED/i)
      expect(body).not.toMatch(/127\.0\.0\.1|localhost:\d{2,5}/i)
      expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: site.name })).not.toBeInTheDocument()
    })
  })

  it('correct: 404 sets a dedicated document title', () => {
    renderErrorPage(404)
    expect(document.title).toBe(`404 · ${httpErrors.pages[404].title} · ${site.name}`)
  })

  it('wrong: unknown status content is not mixed into the 404 page', () => {
    renderErrorPage(404)

    expect(screen.queryByText(httpErrors.pages[500].title)).not.toBeInTheDocument()
    expect(screen.queryByText(httpErrors.pages[502].title)).not.toBeInTheDocument()
    expect(screen.queryByText('500')).not.toBeInTheDocument()
    expect(screen.queryByText('502')).not.toBeInTheDocument()
  })
})
