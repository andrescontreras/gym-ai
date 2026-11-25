import { NextResponse } from 'next/server'
import { mapSupabaseAuthError } from '@/lib/auth/errors'
import { authErrorResponse } from '@/lib/auth/responses'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    const code = mapSupabaseAuthError(error)
    console.error('[auth] logout failed:', code)
    return authErrorResponse(code)
  }

  return NextResponse.json({ success: true })
}
