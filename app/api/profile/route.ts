import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/queries';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
