import type { SetLog } from '@/types';

/**
 * Volume calculation utilities (tonnage = weight x reps x sets).
 * Thin stubs — implement during feature development.
 */

export function calculateSetVolume(_set: SetLog): number {
  throw new Error('Not implemented');
}

export function calculateWeeklyVolume(_sets: SetLog[]): number {
  throw new Error('Not implemented');
}
