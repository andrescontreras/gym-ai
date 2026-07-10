import type { WorkoutSession, SetLog } from '@/types';

/**
 * Write operations (inserts/updates/deletes).
 * Thin stubs — implement during feature development.
 */

export async function createSession(
  _session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkoutSession> {
  throw new Error('Not implemented');
}

export async function logSet(
  _sessionExerciseId: string,
  _set: SetLog
): Promise<void> {
  throw new Error('Not implemented');
}
