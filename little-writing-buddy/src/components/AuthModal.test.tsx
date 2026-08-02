import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { signUpAccount } from '../auth/storage'
import { auth } from '../content/siteCopy'
import { AuthModal } from './AuthModal'

function wrap(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('feature: auth modal', () => {
  it('correct: successful sign-up closes the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    wrap(<AuthModal mode="sign-up" onClose={onClose} onSwitchMode={vi.fn()} />)

    await user.type(screen.getByLabelText(auth.nameLabel), 'Taylor')
    await user.type(screen.getByLabelText(auth.passwordLabel), 'pass123')
    await user.click(screen.getByRole('button', { name: auth.signUp }))

    expect(onClose).toHaveBeenCalled()
  })

  it('wrong: failed sign-in shows an error and keeps the modal open', async () => {
    const user = userEvent.setup()
    signUpAccount({ name: 'Riley', password: 'correct' })
    const onClose = vi.fn()

    wrap(<AuthModal mode="sign-in" onClose={onClose} onSwitchMode={vi.fn()} />)

    await user.type(screen.getByLabelText(auth.nameLabel), 'Riley')
    await user.type(screen.getByLabelText(auth.passwordLabel), 'wrong')
    await user.click(screen.getByRole('button', { name: auth.signIn }))

    expect(screen.getByText('Name or password does not match.')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
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
