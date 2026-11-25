import type { WorkoutSession } from '@/types';

// Typed stubs owned by Dev A (PT-02).

export async function getActiveSession(
  _userId: string
): Promise<WorkoutSession | null> {
  throw new Error('Not implemented');
}

export async function createSession(
  _session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkoutSession> {
  throw new Error('Not implemented');
}
