-- Session tables baseline (S0-J1) --------------------------------------------
-- Owner: Dev A. Reviewed by B and C. Contract: docs/TEAM-IMPLEMENTATION-PLAN.md §5.4.

-- workout_sessions: status lifecycle -----------------------------------------
alter table workout_sessions
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists plan_week_number int,
  add column if not exists plan_session_number int;

update workout_sessions
set started_at = coalesce(started_at, created_at)
where status in ('active', 'completed');

update workout_sessions
set completed_at = coalesce(completed_at, greatest(updated_at, started_at))
where status = 'completed';

alter table workout_sessions
  add constraint workout_sessions_status_check
    check (status in ('planned', 'active', 'completed')),
  add constraint workout_sessions_lifecycle_check
    check (
      (status = 'planned' and started_at is null and completed_at is null)
      or (status = 'active' and started_at is not null and completed_at is null)
      or (status = 'completed' and started_at is not null and completed_at is not null
          and completed_at >= started_at)
    ),
  add constraint workout_sessions_plan_slot_check
    check (
      (plan_week_number is null) = (plan_session_number is null)
      and coalesce(plan_week_number, 1) >= 1
      and coalesce(plan_session_number, 1) >= 1
    );

-- DOMAIN-RULES.md §5: only one active session per user.
create unique index if not exists uq_sessions_one_active_per_user
  on workout_sessions (user_id)
  where status = 'active';

-- A plan slot is materialized into at most one session row.
create unique index if not exists uq_sessions_plan_slot
  on workout_sessions (plan_id, plan_week_number, plan_session_number)
  where plan_id is not null and plan_week_number is not null;

create index if not exists idx_sessions_user_date on workout_sessions (user_id, date);

drop trigger if exists workout_sessions_set_updated_at on workout_sessions;
create trigger workout_sessions_set_updated_at
  before update on workout_sessions
  for each row execute function public.set_updated_at();

-- session_exercises: ordering, unknown load, plan link, substitution ----------
alter table session_exercises
  add column if not exists position int,
  add column if not exists plan_exercise_number int,
  add column if not exists substituted_at timestamptz,
  add column if not exists substitution_rationale text,
  add column if not exists original_reps int,
  add column if not exists original_weight numeric;

with ranked as (
  select id, row_number() over (partition by session_id order by id) as pos
  from session_exercises
)
update session_exercises se
set position = ranked.pos
from ranked
where se.id = ranked.id and se.position is null;

update session_exercises
set substituted_at = now(), original_reps = reps
where substituted_from is not null and substituted_at is null;

alter table session_exercises
  alter column position set not null,
  alter column weight drop not null,
  add constraint session_exercises_position_check check (position >= 1),
  add constraint session_exercises_session_position_key unique (session_id, position),
  add constraint session_exercises_plan_exercise_check
    check (plan_exercise_number is null or plan_exercise_number >= 1),
  add constraint session_exercises_weight_check
    check (weight is null or weight >= 0),
  add constraint session_exercises_original_weight_check
    check (original_weight is null or original_weight >= 0),
  add constraint session_exercises_substitution_check
    check (
      (substituted_from is null) = (substituted_at is null)
      and (substituted_from is null) = (original_reps is null)
    );

comment on column workout_sessions.plan_week_number is
  '1-based weekNumber of the microcycle in workout_plans.microcycles this session came from.';
comment on column workout_sessions.plan_session_number is
  '1-based position of the session in that microcycle''s sessions array.';
comment on column session_exercises.position is
  '1-based display order within the session. Substitution keeps it.';
comment on column session_exercises.plan_exercise_number is
  '1-based position of the exercise in the planned session''s exercises array. Fixed at creation; unlike position it never changes.';
comment on column session_exercises.weight is
  'Prescribed load in kg (dumbbells per hand). NULL means the starting load is unknown, never 0.';
comment on column session_exercises.substituted_from is
  'Exercise this row was originally prescribed, set when it is substituted.';
comment on column session_exercises.original_reps is
  'Prescribed reps before the substitution, so undo can restore them.';
comment on column session_exercises.original_weight is
  'Prescribed load in kg before the substitution, so undo can restore it. NULL if it was unknown.';
comment on column set_logs.weight_used is
  'Logged load in kg (dumbbells per hand).';
