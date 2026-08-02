import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PencilLine } from 'lucide-react'
import { landing, site, sponsor } from '../content/siteCopy'

export function LandingPage() {
  useEffect(() => {
    const previous = document.title
    document.title = `${site.name} · Handwriting practice`
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Primary">
        <Link to="/" className="landing-nav-brand">
          <span className="landing-nav-mark" aria-hidden="true">
            <PencilLine size={18} strokeWidth={2.5} />
          </span>
          <span className="landing-nav-name">{site.name}</span>
        </Link>
        <Link to="/practice" className="landing-nav-link">
          {landing.navPractice}
        </Link>
      </nav>

      <section className="landing-hero" aria-labelledby="landing-brand">
        <div className="landing-hero-copy">
          <p className="landing-sponsor-eyebrow">
            {sponsor.label} {sponsor.name}
          </p>
          <h1 id="landing-brand" className="landing-brand">
            {site.name}
          </h1>
          <p className="landing-description">{landing.description}</p>
          <Link to="/practice" className="landing-cta landing-cta-primary">
            <span className="landing-cta-shine" aria-hidden="true" />
            <span className="landing-cta-label">{landing.ctaPrimary}</span>
            <ArrowRight className="landing-cta-arrow" size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-board">
            <div className="landing-board-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="landing-guide-letter">A</span>
            <span className="landing-trace-stroke" />
          </div>
        </div>
      </section>

      <section className="landing-secondary" aria-labelledby="how-title">
        <h2 id="how-title" className="landing-secondary-title">
          {landing.howTitle}
        </h2>
        <ol className="landing-steps">
          {landing.howSteps.map((step, index) => (
            <li key={step.title} className="landing-step">
              <span className="landing-step-num" aria-hidden="true">
                {index + 1}
              </span>
              <div className="landing-step-text">
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer-brand">
          {site.name} · {sponsor.label} {sponsor.name}
        </p>
      </footer>
    </main>
  )
}
