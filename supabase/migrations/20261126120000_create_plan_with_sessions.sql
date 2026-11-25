-- Persist an accepted plan and its materialized planned sessions atomically.
-- Session row ordering and plan-slot relationships follow the S0-J1 contract.
create or replace function public.create_plan_with_sessions(p_plan jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
  v_duration_weeks integer;
  v_existing public.workout_plans%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_plan) is distinct from 'object' then
    raise exception 'Plan must be a JSON object';
  end if;

  v_plan_id := (p_plan ->> 'id')::uuid;
  if (p_plan ->> 'userId')::uuid is distinct from v_user_id then
    raise exception 'Plan user does not match the authenticated user' using errcode = '42501';
  end if;

  v_duration_weeks := (p_plan ->> 'durationWeeks')::integer;
  if v_duration_weeks is null or v_duration_weeks not between 1 and 16 then
    raise exception 'Plan duration is outside the supported range';
  end if;

  if jsonb_typeof(p_plan -> 'microcycles') is distinct from 'array' then
    raise exception 'Plan microcycles must be an array';
  end if;

  if jsonb_array_length(p_plan -> 'microcycles') <> v_duration_weeks
     or jsonb_typeof(p_plan -> 'goals') is distinct from 'array'
     or jsonb_typeof(p_plan -> 'volumeProfile') is distinct from 'object'
     or nullif(btrim(p_plan ->> 'name'), '') is null
     or nullif(btrim(p_plan ->> 'aiRationale'), '') is null then
    raise exception 'Plan does not satisfy the persistence contract';
  end if;

  insert into public.workout_plans (
    id, user_id, name, duration_weeks, microcycles, goals, volume_profile, ai_rationale
  )
  values (
    v_plan_id,
    v_user_id,
    p_plan ->> 'name',
    v_duration_weeks,
    p_plan -> 'microcycles',
    p_plan -> 'goals',
    p_plan -> 'volumeProfile',
    p_plan ->> 'aiRationale'
  )
  on conflict (id) do nothing;

  select *
  into v_existing
  from public.workout_plans
  where id = v_plan_id;

  if not found
     or v_existing.user_id is distinct from v_user_id
     or v_existing.name is distinct from (p_plan ->> 'name')
     or v_existing.duration_weeks is distinct from v_duration_weeks
     or v_existing.microcycles is distinct from (p_plan -> 'microcycles')
     or v_existing.goals is distinct from (p_plan -> 'goals')
     or v_existing.volume_profile is distinct from (p_plan -> 'volumeProfile')
     or v_existing.ai_rationale is distinct from (p_plan ->> 'aiRationale') then
    raise exception 'Plan ID already exists with different data';
  end if;

  insert into public.workout_sessions (
    user_id, plan_id, date, name, status, plan_week_number, plan_session_number
  )
  select
    v_user_id,
    v_plan_id,
    (session.session ->> 'date')::date,
    session.session ->> 'name',
    'planned',
    week.week_number::integer,
    session.session_number::integer
  from jsonb_array_elements(p_plan -> 'microcycles')
    with ordinality as week(microcycle, week_number)
  cross join lateral jsonb_array_elements(week.microcycle -> 'sessions')
    with ordinality as session(session, session_number)
  on conflict (plan_id, plan_week_number, plan_session_number)
    where plan_id is not null and plan_week_number is not null
    do nothing;

  insert into public.session_exercises (
    session_id, exercise_id, position, plan_exercise_number, sets, reps, weight, rir,
    rest_seconds, completed
  )
  select
    workout_session.id,
    (exercise.exercise ->> 'exerciseId')::uuid,
    exercise.exercise_number::integer,
    exercise.exercise_number::integer,
    (exercise.exercise ->> 'sets')::integer,
    (exercise.exercise ->> 'reps')::integer,
    (exercise.exercise ->> 'weight')::numeric,
    (exercise.exercise ->> 'rir')::integer,
    (exercise.exercise ->> 'restSeconds')::integer,
    false
  from jsonb_array_elements(p_plan -> 'microcycles')
    with ordinality as week(microcycle, week_number)
  cross join lateral jsonb_array_elements(week.microcycle -> 'sessions')
    with ordinality as session(session, session_number)
  cross join lateral jsonb_array_elements(session.session -> 'exercises')
    with ordinality as exercise(exercise, exercise_number)
  join public.workout_sessions as workout_session
    on workout_session.plan_id = v_plan_id
    and workout_session.plan_week_number = week.week_number
    and workout_session.plan_session_number = session.session_number
  on conflict (session_id, position) do nothing;

  return v_plan_id;
end;
$$;

revoke all on function public.create_plan_with_sessions(jsonb) from public, anon;
grant execute on function public.create_plan_with_sessions(jsonb) to authenticated;
