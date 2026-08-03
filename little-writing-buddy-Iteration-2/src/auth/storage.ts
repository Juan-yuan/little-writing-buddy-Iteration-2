import { DEMO_ACCOUNT } from './demoAccount'
import { ensureDemoProgress } from './progressStorage'
import type { AuthUser } from './types'
import { normalizeEmail, validateSignUpCredentials } from './validation'

const USER_KEY = 'little-writing-buddy-user'
const ACCOUNTS_KEY = 'little-writing-buddy-accounts'

type StoredAccount = AuthUser & { password: string }

function toAuthUser(account: StoredAccount): AuthUser | null {
  if (!account?.id || !account?.name || !account?.email) return null
  return {
    id: account.id,
    name: account.name,
    email: normalizeEmail(account.email),
  }
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is StoredAccount => {
      if (!item || typeof item !== 'object') return false
      const account = item as Partial<StoredAccount>
      return Boolean(account.id && account.name && account.email && account.password)
    })
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

/** Ensures the shared demo account and its sample progress exist in this browser. */
export function ensureDemoAccount() {
  ensureDemoProgress()
  const accounts = readAccounts()
  const demoEmail = normalizeEmail(DEMO_ACCOUNT.email)
  const existingIndex = accounts.findIndex(
    (account) => normalizeEmail(account.email) === demoEmail,
  )

  const demoRecord: StoredAccount = {
    id: DEMO_ACCOUNT.id,
    name: DEMO_ACCOUNT.name,
    email: demoEmail,
    password: DEMO_ACCOUNT.password,
  }

  if (existingIndex === -1) {
    writeAccounts([...accounts, demoRecord])
    return
  }

  const next = [...accounts]
  next[existingIndex] = demoRecord
  writeAccounts(next)
}

export function readStoredUser(): AuthUser | null {
  ensureDemoAccount()
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as AuthUser
    if (!user?.id || !user?.name || !user?.email) return null
    return {
      id: user.id,
      name: user.name,
      email: normalizeEmail(user.email),
    }
  } catch {
    return null
  }
}

export function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: normalizeEmail(user.email),
    }),
  )
}

export function signUpAccount(input: {
  name: string
  email: string
  password: string
}): { user: AuthUser } | { error: string } {
  ensureDemoAccount()
  const name = input.name.trim()
  const email = normalizeEmail(input.email)
  const password = input.password

  const validationError = validateSignUpCredentials(name, email, password)
  if (validationError) return { error: validationError }

  const accounts = readAccounts()
  if (accounts.some((account) => normalizeEmail(account.email) === email)) {
    return { error: 'That email is already registered. Try signing in.' }
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name,
    email,
  }
  writeAccounts([...accounts, { ...user, password }])
  writeStoredUser(user)
  return { user }
}

export function signInAccount(input: {
  email: string
  password: string
}): { user: AuthUser } | { error: string } {
  ensureDemoAccount()
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email) return { error: 'Please enter an email.' }
  if (!password) return { error: 'Please enter a password.' }

  const account = readAccounts().find(
    (item) => normalizeEmail(item.email) === email,
  )
  if (!account || account.password !== password) {
    return { error: 'Email or password does not match.' }
  }

  const user = toAuthUser(account)
  if (!user) return { error: 'Email or password does not match.' }

  writeStoredUser(user)
  return { user }
}

export function signOutAccount() {
  writeStoredUser(null)
}
