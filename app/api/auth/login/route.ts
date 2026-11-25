import { NextResponse } from 'next/server'
import { mapSupabaseAuthError } from '@/lib/auth/errors'
import { authErrorResponse } from '@/lib/auth/responses'
import { toAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getIssueCode, loginRequestSchema } from '@/lib/validation/auth'
import type { AuthSuccessResponse } from '@/types'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return authErrorResponse('UNKNOWN_ERROR')
  }

  const parsed = loginRequestSchema.safeParse(body)
  if (!parsed.success) return authErrorResponse(getIssueCode(parsed.error))

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    const code = mapSupabaseAuthError(error)
    if (code !== 'INVALID_CREDENTIALS') console.error('[auth] login failed:', code)
    return authErrorResponse(code)
  }

  return NextResponse.json<AuthSuccessResponse>({ success: true, user: toAuthUser(data.user) })
}
