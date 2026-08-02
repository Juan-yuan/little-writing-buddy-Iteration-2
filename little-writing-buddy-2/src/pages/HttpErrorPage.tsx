import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, ShieldAlert } from 'lucide-react'
import { httpErrors, site } from '../content/siteCopy'
import type { HttpErrorCode } from '../types/httpError'

type HttpErrorPageProps = {
  code: HttpErrorCode
}

export function HttpErrorPage({ code }: HttpErrorPageProps) {
  const content = httpErrors.pages[code]

  useEffect(() => {
    const previous = document.title
    document.title = `${content.code} · ${content.title} · ${site.name}`
    return () => {
      document.title = previous
    }
  }, [content.code, content.title])

  return (
    <main className="app-shell error-shell">
      <section className="error-card" aria-labelledby="error-title">
        <p className="error-code" aria-hidden="true">
          {content.code}
        </p>
        <div className="error-icon" aria-hidden="true">
          <ShieldAlert size={28} strokeWidth={2.25} />
        </div>
        <h1 id="error-title" className="error-title">
          {content.title}
        </h1>
        <p className="error-summary">{content.summary}</p>
        <p className="error-detail">{content.detail}</p>
        <p className="error-security-note">{content.securityNote}</p>
        <Link to="/" className="auth-button auth-button-primary error-home-link">
          <Home size={16} aria-hidden="true" />
          {httpErrors.home}
        </Link>
      </section>
    </main>
  )
}
