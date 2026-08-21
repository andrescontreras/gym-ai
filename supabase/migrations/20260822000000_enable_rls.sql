-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
-- Exercises table remains public read-only (no RLS needed)

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workout Plans: Users can only access their own plans
CREATE POLICY "Users can read own workout plans"
  ON workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout plans"
  ON workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Workout Sessions: Users can only access their own sessions
CREATE POLICY "Users can read own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Session Exercises: Users can only access exercises in their sessions
CREATE POLICY "Users can read session exercises"
  ON session_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create session exercises"
  ON session_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update session exercises"
  ON session_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete session exercises"
  ON session_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Set Logs: Users can only access logs in their session exercises
CREATE POLICY "Users can read set logs"
  ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = set_logs.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create set logs"
  ON set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = set_logs.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update set logs"
  ON set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = set_logs.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete set logs"
  ON set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = set_logs.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );

-- Exercises: Public read-only for authenticated users
CREATE POLICY "Authenticated users can read exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);
