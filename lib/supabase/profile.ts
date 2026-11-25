import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TableRow, UserProfile } from '@/types';

// No server import here: AuthContext (client) also uses the mapper.

export function mapUserProfileRow(row: TableRow<'user_profiles'>): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    experienceLevel: row.experience_level,
    injuries: row.injuries ?? [],
    preferences: row.preferences ?? undefined,
    onboarding: row.onboarding ?? undefined,
    units: row.units,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }

  return data ? mapUserProfileRow(data) : null;
}
