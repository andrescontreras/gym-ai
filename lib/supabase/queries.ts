import { createClient } from './server';
import type { WorkoutSession, UserProfile } from '@/types';

/**
 * Read-only database queries.
 * Thin stubs — implement during feature development.
 */

export async function getActiveSession(
  _userId: string
): Promise<WorkoutSession | null> {
  throw new Error('Not implemented');
}

/**
 * Fetch user profile by ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}
