export const PASSWORD_MIN_LENGTH = 8

export function getPasswordError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter"
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one digit"
  }
  return null
}
