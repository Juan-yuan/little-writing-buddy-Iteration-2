import type { AuthUser } from './types'

const USER_KEY = 'little-writing-buddy-user'
const ACCOUNTS_KEY = 'little-writing-buddy-accounts'

type StoredAccount = AuthUser & { password: string }

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as AuthUser
    if (!user?.id || !user?.name) return null
    return { id: user.id, name: user.name }
  } catch {
    return null
  }
}

export function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function signUpAccount(input: {
  name: string
  password: string
}): { user: AuthUser } | { error: string } {
  const name = input.name.trim()
  const password = input.password

  if (!name) return { error: 'Please enter a name.' }
  if (!password) return { error: 'Please enter a password.' }

  const accounts = readAccounts()
  if (accounts.some((account) => account.name.toLowerCase() === name.toLowerCase())) {
    return { error: 'That name is already taken. Try signing in.' }
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name,
  }
  writeAccounts([...accounts, { ...user, password }])
  writeStoredUser(user)
  return { user }
}

export function signInAccount(input: {
  name: string
  password: string
}): { user: AuthUser } | { error: string } {
  const name = input.name.trim()
  const password = input.password

  if (!name) return { error: 'Please enter a name.' }
  if (!password) return { error: 'Please enter a password.' }

  const account = readAccounts().find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  )
  if (!account || account.password !== password) {
    return { error: 'Name or password does not match.' }
  }

  const user: AuthUser = { id: account.id, name: account.name }
  writeStoredUser(user)
  return { user }
}

export function signOutAccount() {
  writeStoredUser(null)
}
