import { NextResponse } from 'next/server'
import { authErrorResponse } from '@/lib/auth/responses'
import { getCurrentUser } from '@/lib/supabase/auth'
import { getUserProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return authErrorResponse('UNAUTHORIZED')

  const supabase = await createClient()
  const profile = await getUserProfile(supabase, user.id)

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ ...profile, emailVerified: user.emailVerified })
}
