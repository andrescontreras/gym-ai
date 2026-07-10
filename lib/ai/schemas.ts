import { z } from 'zod';

/**
 * Zod schemas for validating AI responses.
 * Keep in sync with the interfaces in `@/types`.
 */

export const SubstitutionSuggestionSchema = z.object({
  exercise: z.object({
    name: z.string(),
    muscleGroup: z.string(),
    movementPattern: z.string(),
    equipment: z.array(z.string()),
  }),
  justification: z.string(),
  adjustedWeight: z.number(),
  adjustedReps: z.number(),
  confidenceScore: z.number().min(0).max(1),
  biomechanicalEquivalence: z.string(),
});

export const SubstitutionResponseSchema = z.object({
  suggestions: z.array(SubstitutionSuggestionSchema).min(1).max(3),
});

export const WorkoutPlanSchema = z.object({
  name: z.string(),
  durationWeeks: z.number().min(4).max(16),
  microcycles: z.array(
    z.object({
      weekNumber: z.number(),
      focus: z.string(),
      sessions: z.array(z.any()),
    })
  ),
  volumeProfile: z.object({
    weeklyVolume: z.number(),
    volumeDistribution: z.record(z.string(), z.number()),
    progressionStrategy: z.enum(['linear', 'undulating', 'block']),
  }),
  aiRationale: z.string(),
});

export const VoiceParsingSchema = z.object({
  reps: z.number().optional(),
  weight: z.number().optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
  rir: z.number().optional(),
  rpe: z.number().optional(),
  confidence: z.number().min(0).max(1),
});
