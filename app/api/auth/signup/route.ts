import { NextResponse } from 'next/server'
import { mapSupabaseAuthError } from '@/lib/auth/errors'
import { authErrorResponse } from '@/lib/auth/responses'
import { toAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getIssueCode, signupRequestSchema } from '@/lib/validation/auth'
import type { AuthSuccessResponse } from '@/types'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return authErrorResponse('UNKNOWN_ERROR')
  }

  const parsed = signupRequestSchema.safeParse(body)
  if (!parsed.success) return authErrorResponse(getIssueCode(parsed.error))
  const { email, password, name } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${new URL(request.url).origin}/auth/confirm`,
    },
  })

  if (error) {
    const code = mapSupabaseAuthError(error)
    console.error('[auth] signup failed:', code)
    return authErrorResponse(code)
  }
  if (!data.user) return authErrorResponse('SERVER_ERROR')

  return NextResponse.json<AuthSuccessResponse>(
    { success: true, user: toAuthUser(data.user) },
    { status: 201 }
  )
}
