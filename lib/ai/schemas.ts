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

export const SubstitutionRequestSchema = z.object({
  originalExercise: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    muscleGroup: z.string().min(1),
    synergistMuscles: z.array(z.string()).optional(),
    movementPattern: z.enum([
      'push_horizontal', 'push_vertical', 'pull_horizontal', 'pull_vertical',
      'squat', 'hinge', 'lunge', 'carry',
    ]),
    equipment: z.array(z.string()).min(1),
    resistanceProfile: z.enum(['constant', 'ascending', 'descending', 'accommodating']).optional(),
  }),
  exerciseId: z.string().min(1),
  reason: z.string().trim().min(3),
  reasonCategory: z.enum([
    'equipment_occupied', 'pain_discomfort', 'lack_space', 'home_workout', 'preference', 'other',
  ]).optional(),
  currentWeight: z.number().nonnegative(),
  currentReps: z.number().int().min(1).max(100),
  currentRir: z.number().int().min(0).max(4),
  voiceInput: z.boolean().optional(),
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
