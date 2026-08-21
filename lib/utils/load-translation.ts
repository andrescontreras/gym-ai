import { LOAD_TRANSLATION } from '@/lib/constants';

interface LoadTranslationResult {
  suggestedWeight: number;
  suggestedReps: number;
  rationale: string;
}

/**
 * Translate load between exercises (e.g., barbell bench → dumbbell bench).
 * Uses multipliers from constants.ts.
 */
export function translateLoad(
  fromExercise: string,
  toExercise: string,
  currentWeight: number,
  currentReps: number
): LoadTranslationResult {
  // Simple heuristic implementation - can be enhanced with AI later
  const lowerFromExercise = fromExercise.toLowerCase();
  const lowerToExercise = toExercise.toLowerCase();

  let multiplier = 1.0;
  let rationale = 'Maintaining same weight';

  // Barbell → Dumbbell
  if (lowerFromExercise.includes('barbell') && lowerToExercise.includes('dumbbell')) {
    multiplier = LOAD_TRANSLATION.barbell_to_dumbbell_per_hand;
    rationale = 'Barbell to dumbbell conversion (per hand)';
  }
  // Machine → Free Weight
  else if (lowerFromExercise.includes('machine') && !lowerToExercise.includes('machine')) {
    multiplier = 0.85;
    rationale = 'Machine to free weight (reduced stability)';
  }
  // Free Weight → Machine
  else if (!lowerFromExercise.includes('machine') && lowerToExercise.includes('machine')) {
    multiplier = 1.15;
    rationale = 'Free weight to machine (increased stability)';
  }

  return {
    suggestedWeight: Math.round(currentWeight * multiplier * 2) / 2, // Round to nearest 0.5
    suggestedReps: currentReps,
    rationale,
  };
}
