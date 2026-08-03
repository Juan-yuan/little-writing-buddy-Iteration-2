import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { DEMO_ACCOUNT } from '../auth/demoAccount'
import { useAuth } from '../auth/useAuth'
import type { AuthMode } from '../auth/types'
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../auth/validation'
import { auth } from '../content/siteCopy'

type AuthModalProps = {
  mode: AuthMode
  onClose: () => void
  onSwitchMode: (mode: AuthMode) => void
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { signIn, signUp, user } = useAuth()
  const titleId = useId()
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createdName, setCreatedName] = useState<string | null>(null)

  const isSignUp = mode === 'sign-up'
  const showSuccess = Boolean(createdName)

  useEffect(() => {
    setCreatedName(null)
    setError(null)
    firstFieldRef.current?.focus()
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

    if (isSignUp) {
      const nextError = signUp(name, email, password)
      if (nextError) {
        setError(nextError)
        return
      }
      setCreatedName(name.trim())
      return
    }

    const nextError = signIn(email, password)
    if (nextError) {
      setError(nextError)
      return
    }
    onClose()
  }

  function fillDemoDetails() {
    setEmail(DEMO_ACCOUNT.email)
    setPassword(DEMO_ACCOUNT.password)
    setError(null)
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
            <h2 id={titleId}>
              {showSuccess
                ? auth.signUpSuccessTitle
                : isSignUp
                  ? auth.signUpTitle
                  : auth.signInTitle}
            </h2>
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

        {showSuccess && createdName ? (
          <div className="auth-success">
            <p className="auth-modal-intro">{auth.signUpSuccessBody(createdName)}</p>
            {user ? (
              <p className="auth-signed-in-note">{auth.hello(user.name)}</p>
            ) : null}
            <button
              type="button"
              className="auth-button auth-button-primary auth-submit"
              onClick={onClose}
            >
              {auth.signUpSuccessContinue}
            </button>
          </div>
        ) : (
          <>
            {!isSignUp ? (
              <div className="auth-demo">
                <p className="auth-demo-title">{auth.demoTitle}</p>
                <p className="auth-demo-body">{auth.demoBody}</p>
                <dl className="auth-demo-credentials">
                  <div>
                    <dt>{auth.demoEmailLabel}</dt>
                    <dd>
                      <code>{DEMO_ACCOUNT.email}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{auth.demoPasswordLabel}</dt>
                    <dd>
                      <code>{DEMO_ACCOUNT.password}</code>
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="auth-button auth-button-secondary auth-demo-fill"
                  onClick={fillDemoDetails}
                >
                  {auth.useDemo}
                </button>
              </div>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp ? (
                <label className="auth-field">
                  <span>{auth.nameLabel}</span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    name="name"
                    autoComplete="nickname"
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
              ) : null}

              <label className="auth-field">
                <span>{auth.emailLabel}</span>
                <input
                  ref={isSignUp ? undefined : firstFieldRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError(null)
                  }}
                  placeholder={auth.emailPlaceholder}
                  maxLength={EMAIL_MAX_LENGTH}
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
                  setCreatedName(null)
                  onSwitchMode(isSignUp ? 'sign-in' : 'sign-up')
                }}
              >
                {isSignUp ? auth.signIn : auth.signUp}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
