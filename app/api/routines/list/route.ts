import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPlans } from '@/lib/supabase/plans';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (authError) {
        console.error('Error authenticating routine list request:', authError.message);
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await getPlans(supabase, user.id);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error listing workout plans:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plans' }, { status: 500 });
  }
}
