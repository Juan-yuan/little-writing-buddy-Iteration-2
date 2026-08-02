import { useState } from 'react'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import type { AuthMode } from '../auth/types'
import { auth } from '../content/siteCopy'
import { AuthModal } from './AuthModal'

export function AuthControls() {
  const { user, signOut } = useAuth()
  const [mode, setMode] = useState<AuthMode | null>(null)

  return (
    <>
      <div className="auth-controls" aria-label={auth.ariaLabel}>
        {user ? (
          <>
            <span className="auth-greeting">{auth.hello(user.name)}</span>
            <button
              type="button"
              className="header-action-btn"
              onClick={signOut}
            >
              <LogOut size={16} aria-hidden="true" />
              {auth.signOut}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="header-action-btn"
              onClick={() => setMode('sign-in')}
            >
              <LogIn size={16} aria-hidden="true" />
              {auth.signIn}
            </button>
            <button
              type="button"
              className="header-action-btn"
              onClick={() => setMode('sign-up')}
            >
              <UserPlus size={16} aria-hidden="true" />
              {auth.signUp}
            </button>
          </>
        )}
      </div>

      {mode ? (
        <AuthModal
          mode={mode}
          onClose={() => setMode(null)}
          onSwitchMode={setMode}
        />
      ) : null}
    </>
  )
}
