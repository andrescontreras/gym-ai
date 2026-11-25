import type { SupabaseClient } from '@supabase/supabase-js';
import { OnboardingSchema } from '@/lib/validation/onboarding';
import { mapUserProfileRow } from '@/lib/supabase/profile';
import type { Database, OnboardingData, UserProfile } from '@/types';

// S6 seam; completion semantics land in RB-04 after the RB-01 contract.
export function isOnboardingComplete(_profile: UserProfile): boolean {
  throw new Error('Not implemented');
}

export async function updateOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
  onboardingData: OnboardingData
): Promise<UserProfile> {
  const onboarding = OnboardingSchema.parse(onboardingData);
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      onboarding,
      experience_level: onboarding.experienceLevel,
      injuries: onboarding.injuries,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating onboarding data:', error.message);
    throw new Error('Failed to update onboarding data', { cause: error });
  }

  return mapUserProfileRow(data);
}
