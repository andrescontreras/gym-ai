import type { Exercise, WorkoutSession, UserProfile } from '@/types';

/**
 * Read-only database queries.
 * Thin stubs — implement during feature development.
 */

export async function getExerciseById(_id: string): Promise<Exercise | null> {
  throw new Error('Not implemented');
}

export async function getActiveSession(
  _userId: string
): Promise<WorkoutSession | null> {
  throw new Error('Not implemented');
}

export async function getUserProfile(
  _userId: string
): Promise<UserProfile | null> {
  throw new Error('Not implemented');
}
