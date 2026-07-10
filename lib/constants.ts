import type { MovementPattern } from '@/types';

/**
 * App-wide domain constants.
 * Source of truth for training rules referenced throughout the app.
 */

// Weekly volume caps (sets per muscle group per week) by experience level.
export const WEEKLY_VOLUME_CAPS = {
  beginner: { min: 10, max: 12 },
  intermediate: { min: 12, max: 18 },
  advanced: { min: 16, max: 22 },
} as const;

// Reps in Reserve interpretation.
export const RIR = {
  FAILURE: 0,
  OPTIMAL_MIN: 1,
  OPTIMAL_MAX: 2,
  TOO_EASY: 4,
} as const;

// Progressive overload increments (kg).
export const LOAD_INCREMENT_KG = {
  upperBody: 2.5,
  lowerBody: 5,
} as const;

// Recovery window between training the same muscle group (hours).
export const RECOVERY_WINDOW_HOURS = { min: 48, max: 72 } as const;

// Load translation multipliers used when substituting exercises.
export const LOAD_TRANSLATION = {
  barbellToDumbbellRomFactor: 0.85,
  freeWeightToMachine: 1.15,
  squatToLegPress: 1.7,
  bodyweightToLatPulldown: 0.7,
} as const;

export const MOVEMENT_PATTERNS: readonly MovementPattern[] = [
  'push_horizontal',
  'push_vertical',
  'pull_horizontal',
  'pull_vertical',
  'squat',
  'hinge',
  'lunge',
  'carry',
] as const;
