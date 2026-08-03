import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { DEMO_ACCOUNT } from '../auth/demoAccount'
import { signUpAccount } from '../auth/storage'
import { auth } from '../content/siteCopy'
import { AuthModal } from './AuthModal'

function wrap(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('feature: auth modal', () => {
  it('correct: successful sign-up shows a local-account confirmation', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    wrap(<AuthModal mode="sign-up" onClose={onClose} onSwitchMode={vi.fn()} />)

    await user.type(screen.getByLabelText(auth.nameLabel), 'Taylor')
    await user.type(screen.getByLabelText(auth.emailLabel), 'taylor@school.edu')
    await user.type(screen.getByLabelText(auth.passwordLabel), 'pass123')
    await user.click(screen.getByRole('button', { name: auth.signUp }))

    expect(screen.getByRole('heading', { name: auth.signUpSuccessTitle })).toBeInTheDocument()
    expect(screen.getByText(auth.signUpSuccessBody('Taylor'))).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: auth.signUpSuccessContinue }))
    expect(onClose).toHaveBeenCalled()
  })

  it('wrong: failed sign-in shows an error and keeps the modal open', async () => {
    const user = userEvent.setup()
    signUpAccount({
      name: 'Riley',
      email: 'riley@school.edu',
      password: 'correct',
    })
    const onClose = vi.fn()

    wrap(<AuthModal mode="sign-in" onClose={onClose} onSwitchMode={vi.fn()} />)

    await user.type(screen.getByLabelText(auth.emailLabel), 'riley@school.edu')
    await user.type(screen.getByLabelText(auth.passwordLabel), 'wrong')
    await user.click(screen.getByRole('button', { name: auth.signIn }))

    expect(screen.getByText('Email or password does not match.')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('correct: demo details can be filled from the sign-in modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    wrap(<AuthModal mode="sign-in" onClose={onClose} onSwitchMode={vi.fn()} />)

    expect(screen.getByText(DEMO_ACCOUNT.email)).toBeInTheDocument()
    expect(screen.getByText(DEMO_ACCOUNT.password)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: auth.useDemo }))
    expect(screen.getByLabelText(auth.emailLabel)).toHaveValue(DEMO_ACCOUNT.email)
    expect(screen.getByLabelText(auth.passwordLabel)).toHaveValue(DEMO_ACCOUNT.password)

    await user.click(screen.getByRole('button', { name: auth.signIn }))
    expect(onClose).toHaveBeenCalled()
  })

  it('correct: escape, backdrop, and mode switch work', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSwitchMode = vi.fn()

    const { rerender } = wrap(
      <AuthModal mode="sign-in" onClose={onClose} onSwitchMode={onSwitchMode} />,
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: auth.signUp }))
    expect(onSwitchMode).toHaveBeenCalledWith('sign-up')

    rerender(
      <AuthProvider>
        <AuthModal mode="sign-up" onClose={onClose} onSwitchMode={onSwitchMode} />
      </AuthProvider>,
    )

    await user.click(document.querySelector('.auth-modal-backdrop')!)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
