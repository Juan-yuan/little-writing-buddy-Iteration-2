import { forwardRef, useImperativeHandle } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRouter'
import { AuthProvider } from './auth/AuthContext'
import type { TracingCanvasHandle } from './components/TracingCanvas'
import { httpErrors, securityPage, site } from './content/siteCopy'

vi.mock('./components/TracingCanvas', () => ({
  TracingCanvas: forwardRef<TracingCanvasHandle>(function MockTracingCanvas(_props, ref) {
    useImperativeHandle(ref, () => ({
      review: () => ({
        score: 0,
        incomplete: true,
        tooFarOutside: false,
        message: 'incomplete',
        onGuidePercent: 0,
        pointCount: 0,
      }),
    }))
    return <div data-testid="tracing-canvas" />
  }),
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('feature: HTTP error routes', () => {
  it('correct: /404, /500, and /502 routes render their status pages', () => {
    const { unmount: unmount404 } = renderAt('/404')
    expect(screen.getByRole('heading', { name: httpErrors.pages[404].title })).toBeInTheDocument()
    unmount404()

    const { unmount: unmount500 } = renderAt('/500')
    expect(screen.getByRole('heading', { name: httpErrors.pages[500].title })).toBeInTheDocument()
    unmount500()

    renderAt('/502')
    expect(screen.getByRole('heading', { name: httpErrors.pages[502].title })).toBeInTheDocument()
  })

  it('wrong: unknown paths fall back to the 404 page, not 500/502', () => {
    renderAt('/this-page-does-not-exist')

    expect(screen.getByRole('heading', { name: httpErrors.pages[404].title })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.queryByText(httpErrors.pages[500].title)).not.toBeInTheDocument()
    expect(screen.queryByText(httpErrors.pages[502].title)).not.toBeInTheDocument()
  })

  it('correct: /not-found redirects to the 404 page', () => {
    renderAt('/not-found')

    expect(screen.getByRole('heading', { name: httpErrors.pages[404].title })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('correct: landing, practice, and security routes render their pages', () => {
    const { unmount: unmountLanding } = renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: site.name })).toBeInTheDocument()
    expect(screen.queryByTestId('tracing-canvas')).not.toBeInTheDocument()
    unmountLanding()

    const { unmount: unmountPractice } = renderAt('/practice')
    expect(screen.getByRole('heading', { level: 1, name: site.name })).toBeInTheDocument()
    expect(screen.getByTestId('tracing-canvas')).toBeInTheDocument()
    unmountPractice()

    renderAt('/security')
    expect(screen.getByRole('heading', { name: securityPage.title })).toBeInTheDocument()
  })
})
