import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react'
import { httpErrors, securityPage, site } from '../content/siteCopy'

function Boom(): ReactNode {
  throw new Error('Simulated unexpected failure for the assessment 500 demo')
}

export function SecurityPage() {
  const [boom, setBoom] = useState(false)

  if (boom) {
    return <Boom />
  }

  return (
    <main className="app-shell security-shell">
      <section className="security-card">
        <div className="security-card-header">
          <div className="security-mark" aria-hidden="true">
            <Shield size={26} strokeWidth={2.25} />
          </div>
          <div>
            <p className="eyebrow">{site.name}</p>
            <h1>{securityPage.title}</h1>
          </div>
        </div>

        <p className="security-intro">{securityPage.intro}</p>

        <h2>{securityPage.principlesTitle}</h2>
        <ul className="security-list">
          {securityPage.principles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>{securityPage.demosTitle}</h2>
        <p className="security-intro">{securityPage.demosHint}</p>

        <div className="security-demo-links">
          <Link to="/404" className="security-demo-link">
            <span>404</span>
            {httpErrors.pages[404].title}
          </Link>
          <Link to="/500" className="security-demo-link">
            <span>500</span>
            {httpErrors.pages[500].title}
          </Link>
          <Link to="/502" className="security-demo-link">
            <span>502</span>
            {httpErrors.pages[502].title}
          </Link>
        </div>

        <div className="security-trigger">
          <p>{securityPage.trigger500Hint}</p>
          <button
            type="button"
            className="auth-button auth-button-secondary"
            onClick={() => setBoom(true)}
          >
            <AlertTriangle size={16} aria-hidden="true" />
            {securityPage.trigger500}
          </button>
        </div>

        <Link to="/" className="auth-button auth-button-primary error-home-link">
          <ArrowLeft size={16} aria-hidden="true" />
          {httpErrors.home}
        </Link>
      </section>
    </main>
  )
}
