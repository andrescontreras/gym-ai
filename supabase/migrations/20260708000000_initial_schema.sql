-- Gym AI — initial schema
-- Corrects the draft schema in README.md and aligns column types with `types/index.ts`.
-- NOTE: Row Level Security is intentionally deferred (see CLAUDE.md) and must be
-- enabled before production.

-- Extensions -----------------------------------------------------------------
create extension if not exists vector;

-- Exercises ------------------------------------------------------------------
create table if not exists exercises (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  muscle_group       text not null,
  synergist_muscles  text[] default '{}',
  movement_pattern   text not null,
  equipment          text[] default '{}',
  resistance_profile text,
  description        text,
  video_url          text,
  embedding          vector(1536),            -- nullable; semantic search deferred
  biomechanical_tags text[] default '{}',
  created_at         timestamptz not null default now()
);

-- User profiles --------------------------------------------------------------
create table if not exists user_profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text not null,
  name             text,
  experience_level text not null default 'beginner',
  injuries         jsonb default '[]'::jsonb,
  preferences      jsonb default '{}'::jsonb,
  onboarding       jsonb,
  created_at       timestamptz not null default now()
);

-- Workout plans (routine builder output) -------------------------------------
create table if not exists workout_plans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references user_profiles (id) on delete cascade,
  name           text not null,
  duration_weeks int not null,
  microcycles    jsonb not null default '[]'::jsonb,
  goals          jsonb not null default '[]'::jsonb,
  volume_profile jsonb,
  ai_rationale   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Workout sessions -----------------------------------------------------------
create table if not exists workout_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references user_profiles (id) on delete cascade,
  plan_id    uuid references workout_plans (id) on delete set null,
  date       date not null,
  name       text not null,
  status     text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Session exercises ----------------------------------------------------------
create table if not exists session_exercises (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references workout_sessions (id) on delete cascade,
  exercise_id      uuid references exercises (id),
  sets             int not null,
  reps             int not null,
  weight           numeric not null,
  rir              int not null,
  rpe              int,
  rest_seconds     int not null default 90,
  notes            text,
  completed        boolean not null default false,
  substituted_from uuid references exercises (id)
);

-- Individual set logs --------------------------------------------------------
create table if not exists set_logs (
  id                  uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references session_exercises (id) on delete cascade,
  set_number          int not null,
  reps_completed      int not null,
  weight_used         numeric not null,
  rir                 int not null,
  rpe                 int,
  created_at          timestamptz not null default now()
);

-- Indexes --------------------------------------------------------------------
create index if not exists idx_sessions_user_id on workout_sessions (user_id);
create index if not exists idx_session_exercises_session_id on session_exercises (session_id);
create index if not exists idx_set_logs_session_exercise_id on set_logs (session_exercise_id);

-- Semantic-search vector index is deferred until an embeddings provider is chosen:
-- create index on exercises using ivfflat (embedding vector_cosine_ops) with (lists = 100);
