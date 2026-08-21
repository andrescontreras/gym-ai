import type { SetLog } from '@/types';

/**
 * Volume calculation utilities (tonnage = weight x reps x sets).
 */

/**
 * Calculate volume (tonnage) for a single set.
 * Volume = Weight × Reps
 */
export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total weekly volume for a muscle group.
 * Sums all set volumes targeting that muscle.
 */
export function calculateWeeklyVolume(sets: SetLog[]): number {
  return sets.reduce((total, set) => {
    if (!set.weight || !set.reps) return total;
    return total + calculateSetVolume(set.weight, set.reps);
  }, 0);
}

/**
 * Calculate total sets for a muscle group.
 */
export function calculateTotalSets(sets: SetLog[]): number {
  return sets.length;
}
