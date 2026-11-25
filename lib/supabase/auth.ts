import type { User } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getSafeNext } from '@/lib/auth/safe-redirect'
import { createClient } from '@/lib/supabase/server'
import type { AuthUser } from '@/types'

export function toAuthUser(user: User): AuthUser {
  const name: unknown = user.user_metadata?.name

  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof name === 'string' ? name : null,
    createdAt: user.created_at,
    emailVerified: Boolean(user.email_confirmed_at),
  }
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null
  return toAuthUser(data.user)
})

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (user) return user

  const next = getSafeNext((await headers()).get('x-pathname'))
  redirect(next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`)
}
