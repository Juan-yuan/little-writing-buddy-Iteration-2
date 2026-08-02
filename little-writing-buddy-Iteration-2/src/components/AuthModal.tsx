import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import type { AuthMode } from '../auth/types'
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../auth/validation'
import { auth } from '../content/siteCopy'

type AuthModalProps = {
  mode: AuthMode
  onClose: () => void
  onSwitchMode: (mode: AuthMode) => void
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    nameRef.current?.focus()
  }, [mode])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextError = isSignUp ? signUp(name, password) : signIn(name, password)

    if (nextError) {
      setError(nextError)
      return
    }
    onClose()
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div>
            <p className="eyebrow">{auth.modalEyebrow}</p>
            <h2 id={titleId}>{isSignUp ? auth.signUpTitle : auth.signInTitle}</h2>
          </div>
          <button
            type="button"
            className="auth-modal-close"
            onClick={onClose}
            aria-label={auth.close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>{auth.nameLabel}</span>
            <input
              ref={nameRef}
              type="text"
              name="name"
              autoComplete="username"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder={auth.namePlaceholder}
              maxLength={NAME_MAX_LENGTH}
              required
            />
          </label>

          <label className="auth-field">
            <span>{auth.passwordLabel}</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError(null)
              }}
              placeholder={auth.passwordPlaceholder}
              maxLength={isSignUp ? PASSWORD_MAX_LENGTH : undefined}
              required
            />
          </label>

          {error ? <p className="auth-form-error">{error}</p> : null}

          <button type="submit" className="auth-button auth-button-primary auth-submit">
            {isSignUp ? auth.signUp : auth.signIn}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? auth.haveAccount : auth.needAccount}{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setError(null)
              onSwitchMode(isSignUp ? 'sign-in' : 'sign-up')
            }}
          >
            {isSignUp ? auth.signIn : auth.signUp}
          </button>
        </p>
      </div>
    </div>
  )
}
