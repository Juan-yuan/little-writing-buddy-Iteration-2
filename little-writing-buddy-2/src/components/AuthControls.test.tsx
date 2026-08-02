import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { signUpAccount } from '../auth/storage'
import { auth } from '../content/siteCopy'
import { AuthControls } from './AuthControls'

function wrap(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('feature: auth controls', () => {
  it('correct: signed-out controls open sign-in and sign-up modals', async () => {
    const user = userEvent.setup()
    wrap(<AuthControls />)

    await user.click(screen.getByRole('button', { name: auth.signIn }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: auth.signInTitle })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: auth.close }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: auth.signUp }))
    expect(screen.getByRole('heading', { name: auth.signUpTitle })).toBeInTheDocument()
  })

  it('wrong: signed-in controls greet the user and support sign-out', async () => {
    const user = userEvent.setup()
    signUpAccount({ name: 'Jamie', password: 'secret' })
    wrap(<AuthControls />)

    expect(screen.getByText(auth.hello('Jamie'))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: auth.signIn })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: auth.signOut }))
    expect(screen.getByRole('button', { name: auth.signIn })).toBeInTheDocument()
  })
})
