import { Link } from 'react-router-dom'
import { Home, PencilLine } from 'lucide-react'
import { header, site } from '../content/siteCopy'
import { AuthControls } from './AuthControls'

export function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="brand-cluster brand-cluster-link">
        <div className="brand-mark" aria-hidden="true">
          <PencilLine size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="brand-kicker">{header.practiceLabel}</p>
          <h1 className="brand-title">{site.name}</h1>
          <p className="brand-tagline">{site.tagline}</p>
        </div>
      </Link>
      <div className="header-actions">
        <Link to="/" className="header-home-link">
          <Home size={16} aria-hidden="true" />
          {header.backHome}
        </Link>
        <AuthControls />
      </div>
    </header>
  )
}
