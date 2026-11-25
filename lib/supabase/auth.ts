import type { AuthUser } from '@/types'

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  throw new Error('Not implemented: session A4')
}

export async function requireUser(): Promise<AuthUser> {
  throw new Error('Not implemented: session A4')
}
