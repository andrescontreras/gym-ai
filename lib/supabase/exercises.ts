import type { CandidateExerciseFilters, Exercise } from '@/types';

// S2 catalog seam (S0-J2). Bodies land in CAT-04.

export async function getExerciseById(_id: string): Promise<Exercise | null> {
  throw new Error('Not implemented');
}

export async function getCandidateExercises(
  _filters: CandidateExerciseFilters
): Promise<Exercise[]> {
  throw new Error('Not implemented');
}
