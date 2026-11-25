-- CAT-02 (part 1): catalog integrity fixes that don't depend on the S0-C3 vocabulary sign-off.
-- Equipment renames and isolation reclassification follow in a later CAT-02 migration.

-- Lets catalog migrations upsert with ON CONFLICT (name).
ALTER TABLE exercises
  ADD CONSTRAINT exercises_name_key UNIQUE (name);

-- 'linear' isn't a resistance profile; unknown is safer than a guessed value for load translation.
UPDATE exercises
SET resistance_profile = NULL
WHERE resistance_profile = 'linear';

ALTER TABLE exercises
  ADD CONSTRAINT exercises_resistance_profile_check
  CHECK (resistance_profile IN ('constant', 'ascending', 'descending', 'accommodating'));

-- D12: the SELECT policy for authenticated users already exists; it had no effect until now.
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
