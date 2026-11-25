import { z } from 'zod';
import type { GeneratedWorkoutPlan, Microcycle, PlannedExercise, PlannedSession } from '@/types';

/**
 * Zod schemas for validating AI responses.
 * Keep in sync with the interfaces in `@/types`.
 */

// Substitution (Dev C)
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

// Routine builder (Dev B)
export const PlannedExerciseSchema: z.ZodType<PlannedExercise> = z.strictObject({
  exerciseId: z.uuid(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative().nullable(),
  rir: z.number().int().min(0).max(4),
  restSeconds: z.number().int().nonnegative(),
  rationale: z.string().trim().min(1),
});

export const PlannedSessionSchema: z.ZodType<PlannedSession> = z.strictObject({
  date: z.iso.date(),
  name: z.string().trim().min(1),
  rationale: z.string().trim().min(1),
  exercises: z.array(PlannedExerciseSchema).min(1),
});

export const MicrocycleSchema: z.ZodType<Microcycle> = z.strictObject({
  weekNumber: z.number().int().positive(),
  startDate: z.iso.date(),
  focus: z.enum(['accumulation', 'intensification', 'deload']),
  rationale: z.string().trim().min(1),
  sessions: z.array(PlannedSessionSchema).min(1),
});

export const WorkoutPlanSchema: z.ZodType<GeneratedWorkoutPlan> = z.strictObject({
  name: z.string().trim().min(1),
  durationWeeks: z.number().int().min(1).max(16),
  microcycles: z.array(MicrocycleSchema).min(1),
  volumeProfile: z.strictObject({
    weeklyVolume: z.number().int().nonnegative(),
    volumeDistribution: z.record(z.string(), z.number().int().nonnegative()),
    progressionStrategy: z.enum(['linear', 'undulating', 'block']),
  }),
  aiRationale: z.string().trim().min(1),
}).superRefine((plan, ctx) => {
  if (plan.microcycles.length !== plan.durationWeeks) {
    ctx.addIssue({
      code: 'custom',
      path: ['microcycles'],
      message: 'The number of microcycles must match durationWeeks',
    });
  }

  plan.microcycles.forEach((week, index) => {
    if (week.weekNumber !== index + 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['microcycles', index, 'weekNumber'],
        message: 'Weeks must be consecutive and start at 1',
      });
    }

    const start = Date.parse(`${week.startDate}T00:00:00Z`);
    const previous = plan.microcycles[index - 1];
    if (previous && start !== Date.parse(`${previous.startDate}T00:00:00Z`) + 7 * 86400000) {
      ctx.addIssue({
        code: 'custom',
        path: ['microcycles', index, 'startDate'],
        message: 'Microcycles must start seven days apart',
      });
    }

    week.sessions.forEach((session, sessionIndex) => {
      const date = Date.parse(`${session.date}T00:00:00Z`);
      if (date < start || date >= start + 7 * 86400000) {
        ctx.addIssue({
          code: 'custom',
          path: ['microcycles', index, 'sessions', sessionIndex, 'date'],
          message: 'Session date must fall within its microcycle',
        });
      }
    });
  });
});

// Progress tracking and voice parsing (Dev A)
export const VoiceParsingSchema = z.object({
  reps: z.number().optional(),
  weight: z.number().optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
  rir: z.number().optional(),
  rpe: z.number().optional(),
  confidence: z.number().min(0).max(1),
});
