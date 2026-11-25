import { RECOVERY_WINDOW_HOURS, WEEKLY_VOLUME_CAPS } from '@/lib/constants';
import type {
  Exercise,
  GeneratedWorkoutPlan,
  SessionExercise,
  TrainingSafetyValidationResult,
  TrainingSafetyViolation,
  UserProfile,
} from '@/types';
import { countWeeklySetsByMuscle } from '@/lib/training/volume';

type PlannedExerciseSummary = Pick<SessionExercise, 'sets' | 'exercise'>;

function createResult(
  violations: TrainingSafetyViolation[]
): TrainingSafetyValidationResult {
  return { ok: violations.length === 0, violations };
}

function createExerciseLookup(exercises: readonly Exercise[]): Map<string, Exercise> {
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}

function addMissingExerciseViolation(
  violations: TrainingSafetyViolation[],
  exerciseId: string,
  weekNumber: number,
  sessionDate: string
): void {
  violations.push({
    code: 'missing_exercise',
    exerciseId,
    weekNumber,
    sessionDate,
    message: `Exercise ${exerciseId} is missing from the supplied catalog.`,
  });
}

export function validateWeeklyVolume(
  plan: GeneratedWorkoutPlan,
  exercises: readonly Exercise[],
  experienceLevel: UserProfile['experienceLevel']
): TrainingSafetyValidationResult {
  const exerciseById = createExerciseLookup(exercises);
  const violations: TrainingSafetyViolation[] = [];
  const maxSets = WEEKLY_VOLUME_CAPS[experienceLevel].max;

  for (const microcycle of plan.microcycles) {
    const plannedExercises: PlannedExerciseSummary[] = [];

    for (const session of microcycle.sessions) {
      for (const plannedExercise of session.exercises) {
        const exercise = exerciseById.get(plannedExercise.exerciseId);
        if (!exercise) {
          addMissingExerciseViolation(
            violations,
            plannedExercise.exerciseId,
            microcycle.weekNumber,
            session.date
          );
          continue;
        }

        plannedExercises.push({ sets: plannedExercise.sets, exercise });
      }
    }

    const setsByMuscle = countWeeklySetsByMuscle(plannedExercises);
    for (const [muscleGroup, actualSets] of Object.entries(setsByMuscle)) {
      if (actualSets > maxSets) {
        violations.push({
          code: 'weekly_volume_exceeded',
          weekNumber: microcycle.weekNumber,
          muscleGroup,
          actualSets,
          maxSets,
          message: `${muscleGroup} has ${actualSets} sets in week ${microcycle.weekNumber}, above the ${maxSets}-set cap.`,
        });
      }
    }
  }

  return createResult(violations);
}

export function validateRecovery(
  plan: GeneratedWorkoutPlan,
  exercises: readonly Exercise[]
): TrainingSafetyValidationResult {
  const exerciseById = createExerciseLookup(exercises);
  const violations: TrainingSafetyViolation[] = [];
  const sessions: Array<{
    date: string;
    timestamp: number;
    muscleGroups: Set<string>;
    order: number;
  }> = [];
  let order = 0;

  for (const microcycle of plan.microcycles) {
    for (const session of microcycle.sessions) {
      const muscleGroups = new Set<string>();

      for (const plannedExercise of session.exercises) {
        const exercise = exerciseById.get(plannedExercise.exerciseId);
        if (!exercise) {
          addMissingExerciseViolation(
            violations,
            plannedExercise.exerciseId,
            microcycle.weekNumber,
            session.date
          );
          continue;
        }

        muscleGroups.add(exercise.muscleGroup);
      }

      sessions.push({
        date: session.date,
        timestamp: Date.parse(`${session.date}T00:00:00.000Z`),
        muscleGroups,
        order: order++,
      });
    }
  }

  sessions.sort((left, right) => left.timestamp - right.timestamp || left.order - right.order);

  const lastExposureByMuscle = new Map<string, { date: string; timestamp: number }>();
  const minimumRecoveryMs = RECOVERY_WINDOW_HOURS.min * 60 * 60 * 1000;

  for (const session of sessions) {
    for (const muscleGroup of session.muscleGroups) {
      const previousExposure = lastExposureByMuscle.get(muscleGroup);
      if (previousExposure) {
        const gapMs = session.timestamp - previousExposure.timestamp;
        if (gapMs < minimumRecoveryMs) {
          const gapHours = gapMs / (60 * 60 * 1000);
          violations.push({
            code: 'insufficient_recovery',
            muscleGroup,
            previousSessionDate: previousExposure.date,
            sessionDate: session.date,
            gapHours,
            message: `${muscleGroup} has only ${gapHours} hours of recovery between ${previousExposure.date} and ${session.date}; at least ${RECOVERY_WINDOW_HOURS.min} hours are required.`,
          });
        }
      }

      lastExposureByMuscle.set(muscleGroup, {
        date: session.date,
        timestamp: session.timestamp,
      });
    }
  }

  return createResult(violations);
}
