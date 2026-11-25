export type PasswordStrength = 0 | 1 | 2 | 3 | 4

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  switch (Math.min(score, 4)) {
    case 0: return 0
    case 1: return 1
    case 2: return 2
    case 3: return 3
    default: return 4
  }
}
