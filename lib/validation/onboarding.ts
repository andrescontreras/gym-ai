import { z } from 'zod';
import type { OnboardingData } from '@/types';

export const OnboardingSchema: z.ZodType<OnboardingData> = z
  .object({
    version: z.literal(2),
    goal: z.enum(['hypertrophy', 'fat_loss', 'endurance']),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    biometrics: z
      .object({
        sex: z.string().trim().min(1).max(40).optional(),
        age: z.number().int().positive(),
        heightCm: z.number().positive(),
        bodyweight: z.number().positive(),
        units: z.enum(['kg', 'lb']),
      })
      .strict(),
    injuries: z
      .array(
        z
          .object({
            zone: z.enum([
              'neck',
              'shoulder',
              'elbow',
              'wrist',
              'lower_back',
              'hip',
              'knee',
              'ankle',
            ]),
            severity: z.enum(['mild', 'moderate', 'severe']),
            notes: z.string().trim().max(500).optional(),
          })
          .strict()
      )
      .superRefine((injuries, context) => {
        const zones = new Set<string>();
        injuries.forEach((injury, index) => {
          if (zones.has(injury.zone)) {
            context.addIssue({
              code: 'custom',
              message: 'Each injury zone can only be included once.',
              path: [index, 'zone'],
            });
          }
          zones.add(injury.zone);
        });
      }),
    availability: z
      .object({
        daysPerWeek: z.union([
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
          z.literal(6),
        ]),
        minutesPerSession: z.union([
          z.literal(30),
          z.literal(45),
          z.literal(60),
          z.literal(75),
          z.literal(90),
        ]),
      })
      .strict(),
    equipment: z
      .object({
        preset: z.enum(['commercial', 'home', 'bodyweight']).optional(),
        items: z
          .array(
            z.enum([
              'full_gym',
              'dumbbells',
              'barbell',
              'kettlebells',
              'resistance_bands',
              'bodyweight',
              'machines',
              'cables',
            ])
          )
          .refine((items) => new Set(items).size === items.length, 'Equipment items must be unique.'),
      })
      .strict()
      .refine(
        ({ preset, items }) => preset !== undefined || items.length > 0,
        'Select an equipment preset or at least one equipment option.'
      ),
    preferredSplit: z.enum([
      'full_body',
      'upper_lower',
      'ppl',
      'no_preference',
    ]),
    knownLifts: z
      .object({
        squat: z
          .object({ weight: z.number().positive(), reps: z.number().int().positive() })
          .strict()
          .optional(),
        bench: z
          .object({ weight: z.number().positive(), reps: z.number().int().positive() })
          .strict()
          .optional(),
        deadlift: z
          .object({ weight: z.number().positive(), reps: z.number().int().positive() })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
