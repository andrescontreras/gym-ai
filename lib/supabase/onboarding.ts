import type { UserProfile } from '@/types';

// S6 seam; completion semantics land in RB-04 after the RB-01 contract.
export function isOnboardingComplete(_profile: UserProfile): boolean {
  throw new Error('Not implemented');
}
