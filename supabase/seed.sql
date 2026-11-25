-- Gym AI local dev seed (PROP-07). LOCAL ONLY: never apply to a hosted project.
-- Applied by `npx supabase db reset`. Dates are relative to the reset day, so "today" always has
-- the active session. Each owner maintains their section (TEAM-IMPLEMENTATION-PLAN.md §6.3).
-- Plan and session rows follow the S0-J1/S0-J3 contracts in TEAM-IMPLEMENTATION-PLAN.md.

-- ===========================================================================
-- Users (Dev A)
-- Demo login: demo@gym-ai.local / DemoLifter123!
-- ===========================================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  -- GoTrue fails to sign in when these token columns are NULL.
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '0d000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'demo@gym-ai.local',
  extensions.crypt('DemoLifter123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"name":"Demo Lifter"}', now(), now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  '0d000000-0000-4000-8000-000000000001',
  '0d000000-0000-4000-8000-000000000001',
  '{"sub":"0d000000-0000-4000-8000-000000000001","email":"demo@gym-ai.local","email_verified":true}',
  'email', now(), now(), now()
);

-- Upsert: the AUTH-03 trigger may already have created the profile row.
insert into user_profiles (id, email, name, experience_level, injuries, preferences, onboarding)
values (
  '0d000000-0000-4000-8000-000000000001',
  'demo@gym-ai.local',
  'Demo Lifter',
  'intermediate',
  '[]',
  '{}',
  jsonb_build_object(
    'goals', '[{"type":"hypertrophy","priority":"primary"}]'::jsonb,
    'injuryHistory', '[]'::jsonb,
    'daysPerWeek', 4,
    'sessionDuration', 60,
    'equipment', '["full_gym"]'::jsonb,
    'completedAt', to_char(now() - interval '29 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  )
)
on conflict (id) do update set
  name = excluded.name,
  experience_level = excluded.experience_level,
  injuries = excluded.injuries,
  preferences = excluded.preferences,
  onboarding = excluded.onboarding;

-- ===========================================================================
-- Catalog references (Dev C)
-- Exercise IDs are random per database, so templates reference the unique exercise name.
-- Dumbbell loads are per hand. Weekly sets per muscle: chest 10, back 13, shoulders 6,
-- legs 16 (intermediate cap 18).
-- ===========================================================================

create temp table seed_sessions (
  session_key text primary key,
  day_offset int not null,
  session_name text not null,
  rationale text not null
);

insert into seed_sessions values
  ('upper_a', 0, 'Upper A', 'Heavy horizontal and vertical pressing and pulling.'),
  ('lower_a', 1, 'Lower A', 'Squat and hinge strength with unilateral accessory work.'),
  ('upper_b', 3, 'Upper B', 'Higher-rep chest, back and shoulder volume.'),
  ('lower_b', 4, 'Lower B', 'Machine and glute work to finish weekly leg volume.');

create temp table seed_exercises (
  session_key text not null references seed_sessions,
  position int not null,
  exercise_name text not null,
  sets int not null,
  reps int not null,
  rir int not null,
  rest_seconds int not null,
  weight_history_week_3 numeric not null,
  weight_history_week_1 numeric not null,
  weight_plan_week_1 numeric not null,
  weight_plan_week_2 numeric not null,
  rationale text not null,
  primary key (session_key, position)
);

insert into seed_exercises values
  ('upper_a', 1, 'Barbell Bench Press',          4,  8, 2, 150,  75,  77.5,  80,  82.5, 'Primary chest compound; +2.5 kg after RIR 2 last week.'),
  ('upper_a', 2, 'Barbell Row',                  4,  8, 2, 120,  65,  67.5,  70,  72.5, 'Horizontal pull to balance the bench press.'),
  ('upper_a', 3, 'Dumbbell Shoulder Press',      3, 10, 2,  90,  18,  20,    20,  22,   'Vertical press for anterior and medial deltoids.'),
  ('upper_a', 4, 'Lat Pulldown',                 3, 10, 2,  90,  52.5, 55,   57.5, 60,  'Vertical pull for lat width.'),
  ('lower_a', 1, 'Barbell Back Squat',           4,  6, 2, 180,  90,  95,   100, 105,   'Primary lower-body compound; +5 kg after RIR 2 last week.'),
  ('lower_a', 2, 'Romanian Deadlift',            3,  8, 2, 150,  80,  85,    90,  95,   'Hinge for hamstrings and glutes.'),
  ('lower_a', 3, 'Walking Lunge',                3, 10, 2,  90,  16,  18,    18,  20,   'Unilateral quad and glute work.'),
  ('upper_b', 1, 'Incline Dumbbell Bench Press', 3, 10, 2, 120,  24,  26,    26,  28,   'Upper-chest emphasis at higher reps.'),
  ('upper_b', 2, 'Cable Row',                    3, 10, 2,  90,  55,  57.5,  60,  62.5, 'Constant-tension horizontal pull.'),
  ('upper_b', 3, 'Chest-Supported Row',          3, 10, 2,  90,  20,  22,    22,  24,   'Back volume without lower-back fatigue.'),
  ('upper_b', 4, 'Dumbbell Chest Fly',           3, 12, 2,  75,  12,  12,    14,  14,   'Chest isolation to reach weekly volume.'),
  ('upper_b', 5, 'Lateral Raise',                3, 15, 2,  60,   8,   8,     8,  10,   'Medial deltoid isolation.'),
  ('lower_b', 1, 'Leg Press',                    3, 12, 2, 120, 150, 160,   170, 180,   'Quad volume with low technical demand.'),
  ('lower_b', 2, 'Hip Thrust',                   3, 10, 2, 120,  90,  95,   100, 105,   'Glute-dominant hinge.');

do $$
declare
  missing text;
begin
  select string_agg(t.exercise_name, ', ') into missing
  from seed_exercises t
  left join exercises e on e.name = t.exercise_name
  where e.id is null;

  if missing is not null then
    raise exception 'seed.sql references exercises missing from the catalog: %', missing;
  end if;
end $$;

-- ===========================================================================
-- Plans and planned sessions (Dev B)
-- Two-week plan starting today. workout_plans.microcycles matches WorkoutPlanSchema (S0-J3);
-- order and rationales live only there, not in the session rows.
-- ===========================================================================

insert into workout_plans (id, user_id, name, duration_weeks, microcycles, goals, volume_profile, ai_rationale)
select
  '0d000000-0000-4000-8000-000000000101',
  '0d000000-0000-4000-8000-000000000001',
  'Upper/Lower Hypertrophy (demo)',
  2,
  (
    select jsonb_agg(
      jsonb_build_object(
        'weekNumber', w,
        'startDate', to_char(current_date + (w - 1) * 7, 'YYYY-MM-DD'),
        'focus', 'accumulation',
        'rationale', 'Accumulation week: moderate loads at RIR 2 to build volume.',
        'sessions', (
          select jsonb_agg(
            jsonb_build_object(
              'date', to_char(current_date + (w - 1) * 7 + s.day_offset, 'YYYY-MM-DD'),
              'name', s.session_name,
              'rationale', s.rationale,
              'exercises', (
                select jsonb_agg(
                  jsonb_build_object(
                    'exerciseId', e.id,
                    'sets', t.sets,
                    'reps', t.reps,
                    'weight', case when w = 1 then t.weight_plan_week_1 else t.weight_plan_week_2 end,
                    'rir', t.rir,
                    'restSeconds', t.rest_seconds,
                    'rationale', t.rationale
                  )
                  order by t.position
                )
                from seed_exercises t
                join exercises e on e.name = t.exercise_name
                where t.session_key = s.session_key
              )
            )
            order by s.day_offset
          )
          from seed_sessions s
        )
      )
      order by w
    )
    from generate_series(1, 2) as w
  ),
  '[{"type":"hypertrophy","priority":"primary"}]',
  '{"weeklyVolume":45,"volumeDistribution":{"chest":10,"back":13,"shoulders":6,"legs":16},"progressionStrategy":"linear"}',
  'Four-day upper/lower split for an intermediate lifter with full gym access. Each muscle is trained twice a week with 48-72 h of recovery, and weekly sets stay within the intermediate cap.';

insert into workout_sessions (id, user_id, plan_id, date, name, status, plan_week_number, plan_session_number)
select
  md5('gym-ai-seed:plan:' || w || ':' || s.session_key)::uuid,
  '0d000000-0000-4000-8000-000000000001',
  '0d000000-0000-4000-8000-000000000101',
  current_date + (w - 1) * 7 + s.day_offset,
  s.session_name,
  'planned',
  w,
  row_number() over (partition by w order by s.day_offset)
from generate_series(1, 2) as w
cross join seed_sessions s;

insert into session_exercises (id, session_id, exercise_id, position, plan_exercise_number, sets, reps, weight, rir, rest_seconds, completed)
select
  md5('gym-ai-seed:plan:' || w || ':' || t.session_key || ':' || t.position)::uuid,
  md5('gym-ai-seed:plan:' || w || ':' || t.session_key)::uuid,
  e.id,
  t.position,
  t.position,
  t.sets,
  t.reps,
  case when w = 1 then t.weight_plan_week_1 else t.weight_plan_week_2 end,
  t.rir,
  t.rest_seconds,
  false
from generate_series(1, 2) as w
cross join seed_exercises t
join exercises e on e.name = t.exercise_name;

-- ===========================================================================
-- Active session and set history (Dev A)
-- Today's Upper A is in progress with two bench sets logged. History covers the three weeks
-- before the plan; the middle week is untrained so the progress chart shows a gap.
-- ===========================================================================

update workout_sessions
set status = 'active', started_at = now() - interval '20 minutes'
where id = md5('gym-ai-seed:plan:1:upper_a')::uuid;

insert into set_logs (session_exercise_id, set_number, reps_completed, weight_used, rir, created_at)
select
  md5('gym-ai-seed:plan:1:upper_a:1')::uuid,
  n,
  8,
  80,
  2,
  now() - (3 - n) * interval '4 minutes'
from generate_series(1, 2) as n;

create temp table seed_history_weeks (week_offset int primary key);
insert into seed_history_weeks values (-3), (-1);

insert into workout_sessions (id, user_id, plan_id, date, name, status, started_at, completed_at, created_at, updated_at)
select
  md5('gym-ai-seed:history:' || h.week_offset || ':' || s.session_key)::uuid,
  '0d000000-0000-4000-8000-000000000001',
  null,
  current_date + h.week_offset * 7 + s.day_offset,
  s.session_name,
  'completed',
  (current_date + h.week_offset * 7 + s.day_offset) + time '18:00',
  (current_date + h.week_offset * 7 + s.day_offset) + time '19:00',
  (current_date + h.week_offset * 7 + s.day_offset) + time '18:00',
  (current_date + h.week_offset * 7 + s.day_offset) + time '19:00'
from seed_history_weeks h
cross join seed_sessions s;

insert into session_exercises (id, session_id, exercise_id, position, sets, reps, weight, rir, rest_seconds, completed)
select
  md5('gym-ai-seed:history:' || h.week_offset || ':' || t.session_key || ':' || t.position)::uuid,
  md5('gym-ai-seed:history:' || h.week_offset || ':' || t.session_key)::uuid,
  e.id,
  t.position,
  t.sets,
  t.reps,
  case when h.week_offset = -3 then t.weight_history_week_3 else t.weight_history_week_1 end,
  t.rir,
  t.rest_seconds,
  true
from seed_history_weeks h
cross join seed_exercises t
join exercises e on e.name = t.exercise_name;

insert into set_logs (session_exercise_id, set_number, reps_completed, weight_used, rir, created_at)
select
  md5('gym-ai-seed:history:' || h.week_offset || ':' || t.session_key || ':' || t.position)::uuid,
  n,
  t.reps,
  case when h.week_offset = -3 then t.weight_history_week_3 else t.weight_history_week_1 end,
  case when n = t.sets then greatest(t.rir - 1, 0) else t.rir end,
  (current_date + h.week_offset * 7 + (select day_offset from seed_sessions where session_key = t.session_key))
    + time '18:00' + (t.position * 15 + n * 3) * interval '1 minute'
from seed_history_weeks h
cross join seed_exercises t
cross join lateral generate_series(1, t.sets) as n;

drop table seed_history_weeks, seed_exercises, seed_sessions;
