export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 4
export const PASSWORD_MAX_LENGTH = 32
export const EMAIL_MAX_LENGTH = 64

function isRepeatedCharacter(value: string) {
  return value.length > 1 && /^(.)\1+$/u.test(value)
}

function isValidEmail(email: string) {
  // Practical check for a kid/parent practice account — not full RFC coverage.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/** Sign-up only — keeps kid accounts short and blocks junk like "111111…". */
export function validateSignUpCredentials(
  name: string,
  email: string,
  password: string,
): string | null {
  if (!name) return 'Please enter a name.'
  if (name.length < NAME_MIN_LENGTH) {
    return `Name needs at least ${NAME_MIN_LENGTH} characters.`
  }
  if (name.length > NAME_MAX_LENGTH) {
    return `Please use a shorter name (up to ${NAME_MAX_LENGTH} characters).`
  }
  if (!/[a-zA-Z]/u.test(name)) {
    return 'Please choose a name with letters.'
  }
  if (isRepeatedCharacter(name)) {
    return 'Please choose a different name.'
  }

  if (!email) return 'Please enter an email.'
  if (email.length > EMAIL_MAX_LENGTH) {
    return `Please use a shorter email (up to ${EMAIL_MAX_LENGTH} characters).`
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.'
  }

  if (!password) return 'Please enter a password.'
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password needs at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Please use a shorter password (up to ${PASSWORD_MAX_LENGTH} characters).`
  }
  if (isRepeatedCharacter(password)) {
    return 'Please choose a stronger password.'
  }

  return null
}
