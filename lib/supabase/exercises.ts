import type { CandidateExerciseFilters, Exercise, TableRow } from '@/types';

// S2 catalog seam (S0-J2). Query bodies land in CAT-04.

export function mapExerciseRow(row: TableRow<'exercises'>): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    synergistMuscles: row.synergist_muscles ?? [],
    movementPattern: row.movement_pattern,
    equipment: row.equipment ?? [],
    resistanceProfile: row.resistance_profile ?? undefined,
    description: row.description ?? undefined,
    videoUrl: row.video_url ?? undefined,
    biomechanicalTags: row.biomechanical_tags ?? [],
  };
}

export async function getExerciseById(_id: string): Promise<Exercise | null> {
  throw new Error('Not implemented');
}

export async function getCandidateExercises(
  _filters: CandidateExerciseFilters
): Promise<Exercise[]> {
  throw new Error('Not implemented');
}
