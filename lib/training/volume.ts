import type { SessionExercise, SetLog } from '@/types';

export function calculateTonnage(setLogs: SetLog[]): number {
  return setLogs.reduce(
    (total, setLog) => total + setLog.weightUsed * setLog.repsCompleted,
    0
  );
}

export function countWeeklySetsByMuscle(
  exercises: Array<Pick<SessionExercise, 'sets' | 'exercise'>>
): Record<string, number> {
  return exercises.reduce<Record<string, number>>((setsByMuscle, item) => {
    const muscleGroup = item.exercise.muscleGroup;
    setsByMuscle[muscleGroup] = (setsByMuscle[muscleGroup] ?? 0) + item.sets;
    return setsByMuscle;
  }, {});
}
