import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Debug logging
    console.log('Signup attempt:', { email, hasPassword: !!password, hasName: !!name });
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)
    });

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          experience_level: 'beginner',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
