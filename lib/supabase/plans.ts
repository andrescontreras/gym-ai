import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GoalSchema, WorkoutPlanSchema } from '@/lib/ai/schemas';
import { createClient } from '@/lib/supabase/server';
import type {
  CreateWorkoutPlanInput,
  Database,
  Microcycle,
  TableRow,
  WorkoutPlan,
} from '@/types';

function mapWorkoutPlanRow(row: TableRow<'workout_plans'>): WorkoutPlan {
  const parsedPlan = WorkoutPlanSchema.safeParse({
    name: row.name,
    durationWeeks: row.duration_weeks,
    microcycles: row.microcycles,
    volumeProfile: row.volume_profile,
    aiRationale: row.ai_rationale,
  });

  if (!parsedPlan.success) {
    throw new Error('Stored workout plan does not match the plan contract', {
      cause: parsedPlan.error,
    });
  }

  const parsedGoals = z.array(GoalSchema).safeParse(row.goals);
  if (!parsedGoals.success) {
    throw new Error('Stored workout plan goals do not match the plan contract', {
      cause: parsedGoals.error,
    });
  }

  return {
    id: row.id,
    userId: row.user_id,
    ...parsedPlan.data,
    goals: parsedGoals.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPlanWithSessions(
  supabase: SupabaseClient<Database>,
  plan: CreateWorkoutPlanInput
): Promise<WorkoutPlan> {
  const parsedId = z.uuid().parse(plan.id);
  const parsedUserId = z.uuid().parse(plan.userId);
  const parsedPlan = WorkoutPlanSchema.parse({
    name: plan.name,
    durationWeeks: plan.durationWeeks,
    microcycles: plan.microcycles,
    volumeProfile: plan.volumeProfile,
    aiRationale: plan.aiRationale,
  });
  const goals = z.array(GoalSchema).min(1).parse(plan.goals);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error authenticating workout plan creation:', authError.message);
    throw new Error('Failed to authenticate workout plan creation', { cause: authError });
  }

  if (!user || user.id !== parsedUserId) {
    throw new Error('Authentication required to create a workout plan for this user');
  }

  const { data: planId, error } = await supabase.rpc('create_plan_with_sessions', {
    p_plan: {
      id: parsedId,
      userId: parsedUserId,
      ...parsedPlan,
      goals,
    },
  });

  if (error) {
    console.error('Error creating workout plan and sessions:', error.message);
    throw new Error('Failed to create workout plan and sessions', { cause: error });
  }

  const savedPlan = await getPlan(supabase, user.id, planId);
  if (!savedPlan) {
    throw new Error('Workout plan was created but could not be retrieved');
  }

  return savedPlan;
}

export async function getPlans(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<WorkoutPlan[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workout plans:', error.message);
    throw new Error('Failed to fetch workout plans', { cause: error });
  }

  return data.map(mapWorkoutPlanRow);
}

export async function getPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string
): Promise<WorkoutPlan | null> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workout plan:', error.message);
    throw new Error('Failed to fetch workout plan', { cause: error });
  }

  return data ? mapWorkoutPlanRow(data) : null;
}

export async function getCurrentMicrocycle(
  planId: string,
  date: string
): Promise<Microcycle | null> {
  if (!z.iso.date().safeParse(date).success) {
    throw new Error('Date must be a calendar date in YYYY-MM-DD format');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error authenticating workout plan lookup:', authError.message);
    throw new Error('Failed to authenticate workout plan lookup', { cause: authError });
  }

  if (!user) {
    throw new Error('Authentication required to look up a workout plan');
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workout plan microcycles:', error.message);
    throw new Error('Failed to fetch workout plan microcycles', { cause: error });
  }

  if (!data) {
    return null;
  }

  const microcycles = mapWorkoutPlanRow(data).microcycles;
  return (
    microcycles.find((microcycle) => {
      const startDate = microcycle.startDate;
      const endDate = new Date(`${startDate}T00:00:00.000Z`);
      endDate.setUTCDate(endDate.getUTCDate() + 7);
      return date >= startDate && date < endDate.toISOString().slice(0, 10);
    }) ?? null
  );
}
