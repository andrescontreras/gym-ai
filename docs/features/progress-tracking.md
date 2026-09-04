# Progress Tracking - Specification

> Living feature specification for logging sets during an active workout (reps, weight, RIR/RPE)
> with an auto-starting rest timer, and for the routine-level dashboard that shows week-over-week
> strength progress. This document follows `docs/FEATURE_DEVELOPMENT_GUIDE.md` and the safety
> constraints in `docs/DOMAIN-RULES.md`. It corresponds to roadmap items 7 (Active Session UI) and
> 10 (Volume Tracking UI) and to Feature 3 in `AGENTS.md` ("Volume Tracking, Progressive Overload
> & Voice Logging"), scoped here to manual logging + the progress dashboard — see **Non-Goals**.

## Feature Metadata

| Field | Value |
|---|---|
| Feature Name | Progress Tracking (Set Logging, Rest Timer & Volume Dashboard) |
| Feature Owner | Gym AI product team |
| Priority | High |
| Estimated Effort | 4 development days for set logging + rest timer (MVP); 3 additional days for the progress dashboard and chart integration; 1 day to harden `predictNextLoad` with Zod (see §8) |
| Dependencies | Active session (`WorkoutSession`, `SessionExercise`), authentication, exercise taxonomy, AI service (`predictNextLoad`), Supabase persistence |
| Status | Planning — API routes and pages exist as stubs only (see §15 Development Feedback) |
| Primary Routes | `/session`, `/session/[id]`, `/progress`, `/history` |
| API Routes | `POST /api/tracking/log`, `GET /api/tracking/history`, `GET /api/tracking/volume`, `POST /api/ai/predict-load` |

## 1. Overview

### What This Feature Does

During an active workout, the user logs each completed set (reps, weight, and effort) in one or
two taps per set, sees a rest timer start automatically, and moves to the next exercise once a
target is met. At the routine level, the user opens a Progress dashboard that shows how their
lifts have improved week over week since they started the program — the same weight for more
reps, or more weight for the same reps, both count as progress — plus their personal records and
a history of past sessions.

### User Problem Solved

Tracking sets manually on paper or in a notes app is slow enough that people either stop logging
mid-workout or log inaccurately after the fact, which breaks progressive overload (the next
session has no reliable basis for the load suggestion) and makes it impossible to see whether the
program is actually working. This feature makes logging a set the fastest action in the app and
turns the accumulated logs into a visible, motivating trend.

### Goals

- Logging a set should be a single tap in the common case (values pre-filled from the prediction).
- The rest timer starts itself — the user never has to remember to start it.
- Every logged set immediately contributes to that session's tonnage and to the historical trend.
- The progress chart must reflect **both** dimensions of strength gain (more reps at the same
  load, more load at the same reps) — see `DOMAIN-RULES.md` §4.4 (estimated 1RM).
- Every load suggestion carries a plain-language rationale (`DOMAIN-RULES.md` §4.2).

### Non-Goals

- **Voice-input logging.** A mic-driven entry path already has its own AI endpoint
  (`POST /api/ai/voice-parse`, `lib/ai/service.ts#parseVoiceTrackingInput`) and schema
  (`VoiceParsingSchema`). This spec defines the manual entry path and the data contract that a
  voice-parsed result must be written into (`SetLog`); the listening/transcript/confirmation UI
  (Screens 23-24 in `WIREFRAME-BRIEF.md`) is scoped to roadmap item 9, not here.
- Editing or deleting a logged set after the session is completed (MVP is append-only during an
  active session).
- Multi-set voice parsing ("3 sets of 10 at 40") — explicitly Phase 2 per `DOMAIN-RULES.md` §4.5.
- Push/sound notifications when the rest timer reaches zero — MVP is an inline, in-app countdown
  only; background notifications are Phase 3 per `WIREFRAME-BRIEF.md` §3.3.
- Editing exercise order, adding exercises, or rebuilding the routine (owned by the Routine
  Builder / substitution features).

### Success Metrics

- [ ] Logging a set with pre-filled values takes one tap; overriding weight/reps/RIR takes three
      or fewer taps.
- [ ] 100% of logged sets are persisted with `reps`, `weight`, `weightUnit`, and `rir` populated;
      `rir` is present on the last set of every exercise (required per `WIREFRAME-BRIEF.md` §3.3).
- [ ] The rest timer auto-starts within 300ms of a logged set with zero additional user action.
- [ ] The Progress hero chart never interpolates a week a lift wasn't trained (broken line, not a
      connected one) — see §7.
- [ ] Weekly per-muscle volume shown on the dashboard never silently exceeds the experience-level
      cap in `DOMAIN-RULES.md` §2.2 without a visible cap marker.

## 2. User Stories

### Primary User Story

> As a lifter mid-workout, I want to log my reps, weight, and effort for each set in one tap and
> have the rest timer start automatically, so that tracking never interrupts my training rhythm.

### Additional User Stories

- As a lifter finishing a program week, I want to see how much my squat, bench, and deadlift have
  improved since Week 1, so that I know the program is working.
- As a beginner, I want the next set's weight and reps pre-filled based on my last performance, so
  that I don't have to guess what to do.
- As a lifter who trains in pounds at one gym and kilos at another, I want my logged weight
  converted correctly regardless of which unit I entered, so that my history and volume stay
  accurate.
- As a lifter who left 2 reps in the tank last time, I want the app to tell me to add weight and
  explain why, so that I trust the suggestion instead of second-guessing it.
- As a lifter checking my history, I want to see exactly what I did in a past session (sets, reps,
  weight, RIR), not just a summary number, so that I can verify a personal record.
- As a lifter in a deload week, I want the volume dashboard to reflect the intentional drop without
  flagging it as a problem, so that I don't feel like I'm regressing.

## 3. User Flow

### Happy Path — Set logging (workout level)

```
1. User is in an active session, focused on one exercise (Screen 21).
2. System shows the exercise name, movement pattern, target muscles, and an
   overload badge ("+2.5 kg — you left 2 RIR last time") from POST /api/ai/predict-load.
3. Set row is pre-filled: weight and reps from the prediction (or last session if the
   prediction call failed), RIR defaulted to the target.
4. User optionally adjusts weight (±2.5) and reps (±1) with steppers.
5. User selects RIR (0-4 chip row); required on the last set of the exercise, optional earlier.
6. User taps "Log set".
7. System calls POST /api/tracking/log, persists the set, updates that exercise's running
   tonnage, and returns the rest duration.
8. Rest timer starts automatically, counting down from restSeconds.
9. When the timer reaches zero, the next set's row becomes active (no auto-advance to the
   next exercise while sets remain).
10. After the last set of the exercise, user taps "Next exercise" and repeats from step 2.
11. After the last exercise, system shows the Session Summary (tonnage, sets, duration, PRs,
    per-muscle volume added this week, next-session teaser) and marks the session 'completed'.
```

### Happy Path — Progress dashboard (routine level)

```
1. User opens the Progress tab.
2. System calls GET /api/tracking/volume for the hero chart series (squat/bench/deadlift by
   default) and the weekly-volume-vs-cap bars.
3. User sees the headline ("+12% average strength gain since Week 1"), the e1RM trend line per
   lift, and a `▲ today` marker with a dashed projection to the program's end date.
4. User taps a point on the chart and sees the raw set notation, the Week-1 comparison, and a
   plain-language delta ("+3 reps at the same load").
5. User switches the view toggle (% change / Absolute kg / Volume) and the chart re-renders.
6. User scrolls to weekly sets per muscle group vs. cap, total tonnage trend, personal records,
   adherence, and the current mesocycle position.
7. User opens History and sees a chronological list of past sessions.
8. User taps a session and sees every logged set for that session.
```

### Alternative Flows

**First workout of the program (no history)**

1. `predict-load` has no `recentHistory` to reason from.
2. Set row shows "Find your working weight" (calibration-week copy, Screen 22) instead of a
   predicted number.
3. The first logged set becomes the Week-1 baseline the Progress chart compares against.

**Rest timer runs while the user leaves the screen**

1. Timer end time is stored as an absolute timestamp, not a countdown that pauses when the tab or
   app loses focus.
2. On return, the timer recomputes remaining time from the stored end time rather than resuming a
   stale countdown.

**Exercise substituted mid-session**

1. The active `session_exercises` row's `exercise_id` changes (handled by the substitution
   feature) but `substitutedFrom` is preserved.
2. Sets logged after the swap are attributed to the new exercise; the history view shows the
   substitution badge so a jump in the chart is explained rather than looking like an anomaly
   (see Open Questions — exact chart treatment is not yet resolved).

### Error Flows

**Set logging fails (network/server error)**

1. `POST /api/tracking/log` fails or times out.
2. The entered values stay in the set row (never cleared on failure) and a retry action appears.
3. The rest timer does **not** start until the set is confirmed persisted.

**Load prediction fails or times out**

1. `POST /api/ai/predict-load` fails.
2. Client falls back to the most recent logged set for that exercise (last weight/reps/RIR) with
   no AI rationale, per the existing `predictNextLoad` fallback pattern.
3. If there is no prior set either, the row falls back to the calibration-week copy.

**Progress data fails to load**

1. `GET /api/tracking/volume` or `GET /api/tracking/history` fails.
2. Dashboard shows a retry state per section — never a chart drawn from partial or zeroed data
   that could be mistaken for a real (flat/declining) trend.

**Duplicate submission**

1. "Log set" is disabled immediately on tap.
2. A second identical request for the same `sessionExerciseId` + `setNumber` is rejected by the
   server as already logged, not inserted twice.

## 4. Screens & Design

### Screen List

| # | Screen/state | Wireframe ref | Description |
|---|---|---|---|
| 1 | Exercise focus | Screen 21, `WIREFRAME-BRIEF.md` §3.3 | Current exercise, overload badge, prefilled set row, RIR chips. |
| 2 | Rest timer | Screen 25 | Inline countdown, auto-start, visible in the thumb zone. |
| 3 | Session summary | Screen 26 | Tonnage, sets, duration, PRs, per-muscle volume added, next-session teaser. |
| 4 | Progress hero | Screen 27 | e1RM strength progression chart with view toggle and tap-to-inspect detail. |
| 5 | Volume + body heatmap | Screen 28 | Weekly sets per muscle group vs. cap, silhouette toggle reusing the injury-map asset. |
| 6 | History list & session recap | Screen 29 | Chronological past sessions, tappable to view logged sets. |
| 7 | Calibration-week variant | Screen 22 | "Find your working weight" when no prior data exists for an exercise. |

Low-fi ASCII references for Screens 21 and 27 are already drawn in `WIREFRAME-BRIEF.md` §6 —
reuse those, don't redraw them here.

### Component States

**Set row**

- Default: prefilled from prediction or last session, steppers enabled.
- Calibration: no numeric prefill, "Find your working weight" copy (Screen 22).
- RIR required: last set of an exercise blocks "Log set" until an RIR chip is selected.
- Loading: "Log set" shows a brief pending state while the request is in flight.
- Error: values preserved, inline retry, timer does not start.
- Disabled: after the set is confirmed logged, the row is replaced by a compact logged summary
  (`Set 2 ✓ 10 × 80.0 kg RIR 2`, as drawn in Screen 21).

**Rest timer**

- Default (hidden): not visible before the first set of an exercise is logged.
- Running: auto-started countdown, visible in the thumb zone.
- Near zero (last 5s): visual emphasis so the user notices without a sound (MVP has no audio).
- Expired: countdown reaches `0:00` and stays visible until the next set is logged or skipped.
- Skippable: user can dismiss the timer early to start the next set sooner.

**Overload badge**

- Default: `↑ +2.5 kg — you left 2 RIR last time.` (upper body) / `+5 kg` (lower body).
- Maintain: `Same load — you were near failure last time.`
- Deload note: distinct styling when the current week is a scheduled deload, so a lower prefilled
  load doesn't read as a bug.
- Calibration: hidden — no badge exists until there's a prior set to compare against.

**Progress hero chart**

- Default: three lines (squat/bench/deadlift) plus `[+ Add lift]`.
- Loading: skeleton chart, no fabricated numbers.
- Empty (no sessions yet): "Log your first session to start tracking progress."
- Broken series: a lift not trained in a given week shows a visual gap, never an interpolated
  line (hard rule, `WIREFRAME-BRIEF.md` §3.5).
- Error: retry state, chart area does not render a flat/zero line as if it were real data.

### Responsive Behavior

- Canvas is mobile-first at 390×844 per `WIREFRAME-BRIEF.md` §2; all primary session actions
  (log set, rest timer, next exercise) stay in the bottom third (thumb zone) — a hard constraint,
  not a preference.
- Tap targets ≥ 48px; numerals in the set row and chart tooltip stay legible at arm's length
  (standing at a rack).
- Desktop (`1024px+`): session view keeps the two-column shell (exercise list + focused
  exercise) already used by `/session`; Progress becomes a wider chart with the detail panel
  beside it instead of below it.
- Tablet (`768px-1023px`): compressed two-column where space allows, otherwise stacked.

## 5. API Endpoints

### Endpoint 1: Log a Completed Set

**Method:** `POST`
**Route:** `/api/tracking/log`
**Purpose:** Persist one completed set for a session exercise, update that exercise's running
totals, and return the rest duration to drive the timer.

**Request body:**

```json
{
  "sessionId": "uuid",
  "sessionExerciseId": "session-bench",
  "exerciseId": "bench-barbell",
  "setNumber": 3,
  "reps": 10,
  "weight": 80,
  "weightUnit": "kg",
  "rir": 2,
  "rpe": 8,
  "isLastSet": true
}
```

**Field rules:**

| Field | Rule |
|---|---|
| `sessionId` | Required; must reference the caller's own `active` session. |
| `sessionExerciseId` | Required; must belong to `sessionId`. |
| `exerciseId` | Required; must match the exercise currently assigned to `sessionExerciseId` (guards against a stale client after a substitution). |
| `setNumber` | Required positive integer; must be the next unlogged set number for this exercise. |
| `reps` | Required integer, 1-100. |
| `weight` | Required number ≥ 0 (0 for bodyweight-only sets). |
| `weightUnit` | Required enum `'kg' \| 'lb'`; converted to kg for storage (§7). |
| `rir` | Required integer 0-4 when `isLastSet` is true; optional (but recommended) otherwise. |
| `rpe` | Optional integer 6-10 — see §7 for why this is optional rather than required. |
| `isLastSet` | Required boolean; tells the server whether to mark the `session_exercises` row `completed`. |

**Response (success - 201):**

```json
{
  "success": true,
  "data": {
    "setLog": {
      "setNumber": 3,
      "repsCompleted": 10,
      "weightUsed": 80,
      "rir": 2,
      "rpe": 8,
      "timestamp": "2026-09-04T14:32:10.000Z"
    },
    "sessionExerciseCompleted": true,
    "restSeconds": 120,
    "sessionTonnageSoFar": 2400
  }
}
```

**Response errors:**

| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/out-of-range field, or `setNumber` is not the next expected set. |
| 401 | `UNAUTHORIZED` | No authenticated session. |
| 404 | `SESSION_NOT_FOUND` | `sessionId` does not exist, isn't active, or doesn't belong to the user. |
| 409 | `EXERCISE_MISMATCH` | `exerciseId` no longer matches `sessionExerciseId` (a substitution happened since the client last loaded). |
| 409 | `DUPLICATE_SET` | This `sessionExerciseId` + `setNumber` was already logged. |
| 500 | `LOG_FAILED` | Persistence failure; client keeps the entered values and offers retry. |

**MVP implementation note:** the current route is a stub (`return NextResponse.json({ error: 'Not implemented' }, { status: 501 })`) with no request parsing, auth, or persistence yet.

### Endpoint 2: Session/Set History

**Method:** `GET`
**Route:** `/api/tracking/history`
**Purpose:** Return past sessions and their logged sets, for the History screen and as the input
to the load-prediction and progress-chart calculations.

**Query parameters:** `exerciseId` (optional, filters to one exercise), `limit` (default 20),
`before` (cursor, ISO date, for pagination).

**Response (success - 200):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "date": "2026-08-28",
        "name": "Upper A",
        "status": "completed",
        "exercises": [
          {
            "exerciseId": "bench-barbell",
            "exerciseName": "Barbell Bench Press",
            "sets": [
              { "setNumber": 1, "repsCompleted": 10, "weightUsed": 80, "rir": 3, "timestamp": "2026-08-28T18:01:00.000Z" },
              { "setNumber": 2, "repsCompleted": 10, "weightUsed": 80, "rir": 2, "timestamp": "2026-08-28T18:05:30.000Z" }
            ]
          }
        ]
      }
    ],
    "nextCursor": "2026-08-21T00:00:00.000Z"
  }
}
```

**Response errors:** `401 UNAUTHORIZED`, `500 HISTORY_FETCH_FAILED`.

**MVP implementation note:** currently a 501 stub with no query parsing.

### Endpoint 3: Volume & Progress

**Method:** `GET`
**Route:** `/api/tracking/volume`
**Purpose:** Compute the data behind the Progress hero chart (e1RM trend), the weekly
volume-vs-cap bars, tonnage trend, and personal records.

**Query parameters:** `lifts` (comma-separated exercise IDs, default squat/bench/deadlift),
`weeks` (default: full program length).

**Response (success - 200):**

```json
{
  "success": true,
  "data": {
    "headlinePercentChange": 12.0,
    "programWeek": 8,
    "programDurationWeeks": 12,
    "byExercise": [
      {
        "exerciseId": "bench-barbell",
        "exerciseName": "Barbell Bench Press",
        "personalRecords": {
          "maxWeight": { "weight": 85, "reps": 5, "date": "2026-08-28" },
          "maxVolume": { "volume": 2550, "date": "2026-08-28" },
          "maxReps": { "reps": 12, "weight": 60, "date": "2026-08-14" }
        },
        "weeklyE1rm": [
          { "week": 1, "e1rm": 90.0, "rawSets": "3 × 6 @ 75kg", "trained": true },
          { "week": 2, "e1rm": null, "rawSets": null, "trained": false },
          { "week": 8, "e1rm": 97.5, "rawSets": "3 × 9 @ 75kg", "trained": true }
        ]
      }
    ],
    "weeklyVolume": {
      "weekStartDate": "2026-08-25",
      "totalVolume": 18400,
      "byMuscleGroup": {
        "chest": { "volume": 4200, "sets": 9 },
        "back": { "volume": 5100, "sets": 12 }
      }
    },
    "volumeCapsForExperience": { "min": 12, "max": 18 }
  }
}
```

**Response errors:** `401 UNAUTHORIZED`, `500 VOLUME_CALCULATION_FAILED`.

**MVP implementation note:** currently a 501 stub. `week.trained: false` with `e1rm: null` is what
drives the "break the line, never interpolate" chart rule in §7.

### Endpoint 4: Predict Next Load

**Method:** `POST`
**Route:** `/api/ai/predict-load`
**Purpose:** Suggest the next set's weight and reps from recent performance, with a rationale, to
prefill the set row.

**Request body:**

```json
{
  "exerciseId": "bench-barbell",
  "recentHistory": [
    { "weight": 80, "reps": 10, "rir": 2, "date": "2026-08-28" },
    { "weight": 77.5, "reps": 10, "rir": 3, "date": "2026-08-21" }
  ],
  "bodyweight": 82
}
```

**Response (success - 200):**

```json
{
  "success": true,
  "data": {
    "suggestedWeight": 82.5,
    "suggestedReps": 10,
    "rationale": "You left 2 RIR last session, so we're adding 2.5 kg.",
    "confidenceScore": 0.9
  }
}
```

**Response errors:** `400 VALIDATION_ERROR`, `502 AI_PREDICTION_FAILED` (falls back client-side to
`recentHistory[0]`, per §3 Alternative Flows).

**MVP implementation note:** the route is a 501 stub. The underlying service function
`predictNextLoad()` in `lib/ai/service.ts` already exists but uses `generateText` + regex parsing
(`/(\d+(?:\.\d+)?)\s*kg/i`) instead of `generateObject` + a Zod schema — see §8 and §15, this is a
direct violation of the "ALL AI responses MUST be validated with Zod" rule and must be fixed as
part of wiring this endpoint up, not treated as pre-existing and acceptable.

## 6. Database

### Tables Used

**Table: `session_exercises`** (existing)

- Operations: Read and update.
- Columns: `id`, `session_id`, `exercise_id`, `sets`, `reps`, `weight`, `rir`, `rpe`,
  `rest_seconds`, `completed`, `substituted_from`, `notes`.
- New columns: none — this table holds the *prescription* (target), not the log of what actually
  happened set-by-set.

**New table: `set_logs`** (needed)

- Operations: Insert (from `POST /api/tracking/log`), read (from `GET /api/tracking/history` and
  `GET /api/tracking/volume`).
- Columns: `id`, `session_exercise_id`, `session_id`, `user_id`, `exercise_id`, `set_number`,
  `reps_completed`, `weight_used_kg`, `weight_unit_entered`, `rir`, `rpe`, `logged_at`.
- Why a separate table instead of the `performanceLog: SetLog[]` field already declared on
  `SessionExercise` in `types/index.ts`: the Progress dashboard needs to query *across many past
  sessions* by user, exercise, and date range (e1RM trend, weekly tonnage, PRs). Querying a JSON
  array embedded per session row does not scale to that access pattern and can't be indexed by
  `(user_id, exercise_id, logged_at)`. The `SetLog` TypeScript shape stays the client-facing
  contract; `set_logs` is how it's persisted.
- `weight_used_kg` is the canonical stored value (§7); `weight_unit_entered` is kept only so the
  UI can echo back what the user actually typed.
- `types/index.ts`'s `Database.public.Tables` does not yet declare `set_logs` — add `Row` /
  `Insert` / `Update` types there alongside the existing tables when this is implemented.

**Table: `workout_sessions`** (existing)

- Operations: Read and update.
- Columns: `id`, `user_id`, `status`, `updated_at`.
- Purpose: verify the session is `'active'` and belongs to the caller before accepting a logged
  set; mark `'completed'` when the last exercise's last set is logged.

**Table: `user_profiles`** (existing)

- Operations: Read.
- Columns: `id`, `experience_level` (for the weekly volume cap), `bodyweight` (for bodyweight-only
  set logging and e1RM display), `injury_history` (not used by tracking itself, but read
  alongside for the session context).
- New column needed: a default display-unit preference (`kg` / `lb`) — **not present** on the
  `UserProfile` interface in `types/index.ts` today. Without it, every set entry has to ask for a
  unit with no sensible default. See §7 and Open Questions.

### Queries Needed

- `getSetLogsForExercise(userId, exerciseId, { since, limit })` — powers `predictNextLoad`'s
  `recentHistory` input and the exercise-level history view.
- `getSetLogsForSession(sessionId)` — powers the session recap on the History screen.
- `getWeeklyVolume(userId, weekStartDate)` — sums `set_logs` by muscle group for a given week;
  used for the volume-vs-cap bars.
- `getWeeklyE1rmSeries(userId, exerciseIds, programStartDate)` — one row per program week per
  exercise, with `trained: false` / `e1rm: null` for weeks with no logged sets (never
  interpolated).
- `getPersonalRecords(userId, exerciseId)` — max weight, max volume, max reps with their dates.

### Mutations Needed

- `logSet(sessionExerciseId, set: SetLog)` — already declared as a stub in
  `lib/supabase/mutations.ts` (`throw new Error('Not implemented')`); this is the function
  `POST /api/tracking/log` should call. It must, in one transaction: insert the `set_logs` row,
  update `session_exercises.completed` when `isLastSet` is true, and update
  `workout_sessions.status` to `'completed'` when it was the session's last exercise.
- `completeSession(sessionId)` — marks a session `'completed'` and computes the summary payload
  (tonnage, PRs, volume added) for Screen 26.

### Persistence Rules

- A set can only be logged against a session the caller owns with `status = 'active'` — enforces
  the "only one active session" invariant from `DOMAIN-RULES.md` §5 at the write boundary too.
- `weight_used_kg` is always stored in kg regardless of what unit the user entered (§7);
  conversion happens before the insert, never at read time, so historical rows aren't affected if
  the conversion constant is ever refined.
- Logging the last set of the last exercise is the single trigger that flips
  `workout_sessions.status` to `'completed'` — there is no separate "finish workout" mutation in
  MVP.

## 7. Business Logic

### Validation Rules

**Reps**

- Rule: integer, 1-100 (matches `SubstitutionRequestSchema.currentReps` for consistency).
- Error: `Ingresa un número de repeticiones entre 1 y 100.`

**Weight**

- Rule: number ≥ 0 (0 is valid for bodyweight sets).
- Error: `El peso no puede ser negativo.`

**RIR on the last set**

- Rule: required, 0-4, when `isLastSet` is true — matches the locked wireframe decision
  (`WIREFRAME-BRIEF.md` §3.3: "required on the last set of each exercise, optional on earlier
  sets").
- Error: `Selecciona cuánto te faltó para el fallo en esta última serie.`

**Set sequencing**

- Rule: `setNumber` must equal the next unlogged set for that `sessionExerciseId`; the server
  rejects out-of-order or duplicate submissions (`409 DUPLICATE_SET`) rather than silently
  overwriting.

### Weight Unit Handling

- **Canonical storage unit is kg** — every `DOMAIN-RULES.md` §3.2/§4 worked example is in kg, and
  the e1RM/tonnage formulas assume one consistent unit.
- Each logged set carries the unit the user actually typed (`weightUnit`); the server converts to
  kg for storage using `weightKg = unit === 'lb' ? weight * 0.453592 : weight`. This conversion
  constant does not exist yet anywhere in the codebase and needs a small
  `lib/utils/units.ts` (or similar) home — `lib/utils/formatters.ts#formatWeight` only
  concatenates a unit string today, it does **not** convert between units, so it cannot be reused
  for this without a change.
- Display unit should default to a per-user preference. `UserProfile` in `types/index.ts` has no
  such field today; the substitution feature's doc (`intelligent-exercise-substitution.md`,
  Database section) already assumes a `units` column exists on `user_profiles`, but it is **not**
  declared on the `UserProfile` TypeScript interface — this feature needs that field added for
  real (not just assumed), or it needs to independently confirm where unit preference lives. See
  Open Questions.
- "Configure per machine" (from the original request) is handled at the UI level as a per-set
  override of the default unit, not a machine registry — MVP does not maintain a
  database of which physical machines display which unit.

### Rest Timer

- `restSeconds` already exists per-exercise on `SessionExercise` (seen in the current mock data on
  `/session`: 120s for the barbell bench press, 90s for cable row, 75s for cable fly) and is
  reused unchanged — this feature does not introduce a new rest-duration field, it makes the
  existing one drive an actual timer.
- Starts automatically the instant `POST /api/tracking/log` returns success — never on a manual
  "start rest" tap.
- Client stores an absolute end timestamp (`now + restSeconds`), not a tick-down counter, so
  backgrounding the tab/app and returning still shows the correct remaining time (see Edge Cases).
- MVP is a visible in-app countdown only; sound/vibration/push notification at zero is Phase 3
  (`WIREFRAME-BRIEF.md` §3.3) and is explicitly out of scope here.

### Progressive Overload (reused from `DOMAIN-RULES.md` §4.2, not redefined)

| Condition | Action |
|---|---|
| Last session RIR ≤ 2 | `LOAD_INCREMENT_KG.upperBody` (+2.5 kg) or `.lowerBody` (+5 kg) from `lib/constants.ts`, or +1 rep at the same weight |
| Last session RIR ≥ 4 | Maintain or reduce load |
| RIR 0-1 for 2+ consecutive weeks | Surface a deload suggestion (non-blocking, dismissible) |

Every suggestion must render its rationale string (`"↑ +2.5 kg — you left 2 RIR last time"`) next
to the number — never a silent prefill change, per the Invariants Checklist in
`DOMAIN-RULES.md` §6.

### Volume & e1RM Calculation

- **Tonnage** = weight (kg) × reps × sets, via `calculateSetVolume` /
  `calculateWeeklyVolume` in `lib/utils/volume.ts` — **these currently read `set.weight` and
  `set.reps`**, but the `SetLog` type they're typed against (`types/index.ts`) defines
  `weightUsed` and `repsCompleted`. As written today, `calculateWeeklyVolume` silently returns `0`
  tonnage for every real `SetLog` (the `if (!set.weight || !set.reps) return total;` guard is
  always true), because those fields don't exist on the object. This must be fixed before the
  Progress dashboard can show real numbers — flagged again as a blocker in §14.
- **e1RM** = `weight × (1 + reps / 30)` (Epley), per `DOMAIN-RULES.md` §4.4, computed per week per
  exercise from the heaviest working set logged that week. Always displayed with the raw set
  notation alongside it (`3 × 9 @ 75kg`), never the e1RM number alone.
- **Weekly per-muscle volume** is checked against `WEEKLY_VOLUME_CAPS` in `lib/constants.ts`
  (already correct: `beginner 10-12`, `intermediate 12-18`, `advanced 16-22`) and surfaced with a
  cap marker — a bar approaching or exceeding the cap is informational, not an error state, since
  the routine builder (not this feature) is what enforces the hard cap at generation time.
- A scheduled deload week (40-50% volume reduction) must not be flagged as a regression on the
  volume-vs-cap bars — the dashboard needs to know the current week's `Microcycle.focus` to
  suppress a false "under target" warning.

## 8. AI Integration

### AI Service Used

- **Model:** Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) — speed-optimized, matches
  `AGENTS.md`/`CLAUDE.md` guidance ("Voice parsing, predictive load calculations" → Haiku).
- **Function:** `predictNextLoad()` in `lib/ai/service.ts`.
- **Why Haiku, not Sonnet:** this is a lightweight numeric extrapolation from a short history, not
  a safety-critical biomechanical judgment — it fits the same latency/complexity bucket as voice
  parsing.

### Current Implementation Gap

`predictNextLoad()` today calls `generateText` and then regex-parses the weight and reps out of
free-form prose (`/(\d+(?:\.\d+)?)\s*kg/i`, `/(\d+)\s*reps?/i`). This is inconsistent with every
other AI function in the codebase (`generateWorkoutPlan`, `generateExerciseSubstitution`,
`parseVoiceTrackingInput`), all of which use `generateObject` with a Zod schema, and it directly
contradicts the project-wide rule: *"ALL AI responses MUST be validated with Zod schemas before
reaching the client"* (`CLAUDE.md`, `AGENTS.md`). A model response that phrases the number
differently (e.g. "eighty two point five kilograms") silently produces `NaN`/`undefined` with no
validation error. **This must be replaced with a `PredictiveLoadSchema` (`z.object({
suggestedWeight: z.number(), suggestedReps: z.number().int(), rationale: z.string(),
confidenceScore: z.number().min(0).max(1) })`) and `generateObject`** as part of wiring up
`POST /api/ai/predict-load` — it is not acceptable to ship the current implementation behind the
new route unchanged.

### Prompt Requirements

Reuse the existing prompt content in `predictNextLoad()` (already correctly states the RIR
progressive-overload rule and the kg increments) but restructure it to the
`Context → Task → Constraints → Output Format` shape used by `buildSubstitutionPrompt` /
`buildRoutineBuilderPrompt` in `lib/ai/prompts.ts`, and move it there — it currently lives inline
in `service.ts`, which violates *"Keep prompts in `lib/ai/prompts.ts` — NEVER inline in
components"* (the same rule extends to services per `AGENTS.md`'s intent, even though the literal
text says "components").

### Response Format (Zod Schema — to be added)

```typescript
export const PredictiveLoadSchema = z.object({
  suggestedWeight: z.number().nonnegative(),
  suggestedReps: z.number().int().min(1).max(100),
  rationale: z.string(),
  confidenceScore: z.number().min(0).max(1),
});
```

### Fallback Behavior

- AI timeout/failure/missing key: fall back to `recentHistory[0]` (the most recent logged set)
  with no rationale shown, exactly as `predictNextLoad`'s current signature implies — the set row
  still gets useful prefilled numbers, just without AI reasoning attached.
- No history at all: fall back further to the calibration-week copy (Screen 22), never to a
  fabricated number.

## 9. Components

### Existing Components to Reuse

- `components/shared/MetricTile.tsx` — tonnage/PR tiles on the session summary and progress hero.
- `components/shared/Card.tsx`, `Button.tsx`, `Alert.tsx`, `Modal.tsx` — session summary layout,
  retry/error states.
- `components/shared/StatusChip.tsx` — RIR chip row styling base.
- `components/shared/RecommendationCard.tsx` — structural pattern (title + metric grid +
  justification block) the overload badge and prediction rationale should follow rather than
  inventing a new visual language.

### New Components to Create

**Component: `SetLogRow`**

- Location: `components/session/set-log-row.tsx`.
- Purpose: the prefilled set-entry row with weight/rep steppers and the RIR chip row.
- Props:
  ```typescript
  interface SetLogRowProps {
    setNumber: number;
    targetSets: number;
    prefill: { weight: number; reps: number; weightUnit: 'kg' | 'lb' };
    isLastSet: boolean;
    isCalibration: boolean;
    onLog: (entry: { weight: number; reps: number; weightUnit: 'kg' | 'lb'; rir?: number }) => Promise<void>;
    disabled?: boolean;
  }
  ```
- State: current weight/reps/unit/RIR selection, submitting, error.

**Component: `RestTimer`**

- Location: `components/session/rest-timer.tsx`.
- Purpose: inline countdown driven by an absolute end timestamp; visible in the thumb zone.
- Props: `endsAt: string /* ISO timestamp */`, `onExpire: () => void`, `onSkip: () => void`.
- State: remaining seconds, recomputed from `endsAt` on an interval and on visibility change.

**Component: `OverloadBadge`**

- Location: `components/session/overload-badge.tsx`.
- Purpose: render the progressive-overload rationale next to the prefilled numbers.
- Props: `direction: 'increase' | 'maintain' | 'decrease'`, `amount?: string`, `rationale: string`,
  `isDeloadWeek?: boolean`.

**Component: `SessionSummary`**

- Location: `components/session/session-summary.tsx`.
- Purpose: Screen 26 — tonnage, sets, duration, PRs hit this session, per-muscle volume added,
  next-session teaser.
- Props: `sessionId: string`, `onGoToProgress: () => void`.

**Component: `ProgressHeroChart`**

- Location: `components/progress/progress-hero-chart.tsx`.
- Purpose: Screen 27 — e1RM trend lines, view toggle, tap-to-inspect tooltip, dashed projection
  to program end.
- Props: `series: ProgressHistory[]`, `programWeek: number`, `programDurationWeeks: number`,
  `view: '% change' | 'Absolute kg' | 'Volume'`, `onViewChange`, `onAddLift`.
- State: selected tooltip point.

**Component: `VolumeVsCapChart`**

- Location: `components/progress/volume-vs-cap-chart.tsx`.
- Purpose: Screen 28 — bars vs. cap markers per muscle group, with a body-heatmap toggle that
  reuses the onboarding injury-map silhouette asset.
- Props: `weeklyVolume: WeeklyVolume`, `capsForExperience: { min: number; max: number }`,
  `isDeloadWeek: boolean`.

**Component: `HistoryList`**

- Location: `components/progress/history-list.tsx`.
- Purpose: Screen 29 — chronological sessions, tappable into logged-set detail.
- Props: `sessions: SessionHistoryEntry[]`, `onSelectSession: (id: string) => void`.

### Chart Library

No charting library is installed yet (`package.json` has none) and `WIREFRAME-BRIEF.md` §8 lists
this as an open technical question (Recharts vs. Visx vs. hand-rolled SVG). This is a real
dependency to resolve before `ProgressHeroChart`/`VolumeVsCapChart` can be built — see §14 and
§16. Whichever is chosen must be added to `package.json`, not just assumed to already be
available.

## 10. Error Handling

| Scenario | When | User experience | Recovery |
|---|---|---|---|
| Invalid reps/weight | Client-side range check fails | Inline validation under the stepper | Correct the value; "Log set" re-enables. |
| Missing RIR on last set | User taps "Log set" without selecting an RIR chip | Inline message, submit blocked | Select an RIR chip. |
| Network failure on log | `POST /api/tracking/log` fails | Values preserved, retry action shown, timer does not start | Retry; never silently drop a completed set. |
| Duplicate/out-of-order set | Client re-sends after a slow response | `409` from server, client reconciles to server state | No duplicate row is inserted; UI shows the already-logged set. |
| Exercise mismatch | A substitution happened after the client loaded the session | `409 EXERCISE_MISMATCH`, client refetches the session | User re-confirms the (new) exercise before logging continues. |
| Prediction failure | `POST /api/ai/predict-load` fails/times out | No visible error — silent fallback to last session's actuals | Set row is still usable; no AI rationale shown. |
| History/volume fetch failure | `GET /api/tracking/history` or `/volume` fails | Section-level retry state, not a full-page error | Retry; other dashboard sections remain usable. |
| Session already completed | User navigates back into a finished session | Read-only recap, no set-logging controls | Return to Today or Progress. |

### Exact User Messages

```typescript
const ERROR_MESSAGES = {
  INVALID_REPS: 'Ingresa un número de repeticiones entre 1 y 100.',
  INVALID_WEIGHT: 'El peso no puede ser negativo.',
  MISSING_RIR: 'Selecciona cuánto te faltó para el fallo en esta última serie.',
  LOG_FAILED: 'No pudimos guardar esta serie. Tus datos siguen aquí — inténtalo de nuevo.',
  EXERCISE_MISMATCH: 'Este ejercicio cambió. Actualizando tu sesión...',
  HISTORY_FAILED: 'No pudimos cargar tu historial ahora.',
  VOLUME_FAILED: 'No pudimos cargar tu progreso ahora.',
};
```

## 11. Edge Cases

### Empty and First-Use States

- No active session: no set-logging UI renders; route to Today.
- First exercise of the program, no history: calibration-week copy, no overload badge, no
  prediction rationale.
- No sessions completed yet: Progress hero shows "Log your first session to start tracking
  progress," not a zeroed/flat chart.
- Bodyweight-only exercise: weight input accepts `0`/blank, tonnage for that set is `0`, and the
  set is still logged (reps and RIR still matter for progression).

### Loading and Offline States

- Rest timer must survive the app/tab losing focus (absolute end timestamp, not a pausable
  interval) — see §7.
- Prediction request is capped at a short timeout (recommend ≤5s, this is a Haiku call) before
  falling back, so it never blocks the user from logging a set.
- Offline while logging: preserve the entered set locally and surface retry; do not silently
  discard a completed set the user has already performed in the gym.

### Data Limits

- Progress chart default series: squat/bench/deadlift, expandable via `[+ Add lift]`.
- History pagination: 20 sessions per page via `before` cursor.
- One rest timer active at a time, tied to the exercise currently in focus.

### Deload & Substitution Interactions

- A deload week's intentionally lower volume/load must not trigger the same visual treatment as
  an unplanned drop — the dashboard needs the current `Microcycle.focus` to distinguish them (see
  §7).
- A lift substituted mid-program creates a discontinuity in its own e1RM series; the exact
  chart/PR treatment (bridge the series under the original exercise, or start a new series under
  the substitute) is not resolved — see Open Questions.

## 12. Acceptance Criteria

### Functional Requirements

- [ ] User can log a set with prefilled values in one tap.
- [ ] RIR is required and enforced on the last set of every exercise; optional on earlier sets.
- [ ] Rest timer starts automatically on a successful log and survives the app losing focus.
- [ ] Session summary shows tonnage, sets, duration, PRs, and per-muscle volume added.
- [ ] Progress hero chart plots e1RM per lift, supports the three view toggles, and never
      interpolates an untrained week.
- [ ] Weekly volume vs. cap bars reflect `WEEKLY_VOLUME_CAPS` for the user's experience level.
- [ ] History list shows chronological sessions; tapping one shows every logged set.
- [ ] `predictNextLoad` returns a Zod-validated structured response, not regex-parsed prose.
- [ ] Weight entered in either kg or lb is stored consistently in kg and displayed correctly.

### Non-Functional Requirements

- [ ] All primary session actions (log set, rest timer, next exercise) stay in the bottom-third
      thumb zone at 390×844.
- [ ] Tap targets ≥ 48px; numerals legible at arm's length.
- [ ] No console errors during the logging or dashboard flows.
- [ ] Prediction call falls back within a bounded timeout rather than hanging the set row.
- [ ] No raw AI output, stack trace, or API key reaches the client.

### Domain Invariants

- [ ] Every load change shown to the user carries a rationale (`DOMAIN-RULES.md` §6).
- [ ] No weekly per-muscle volume is silently miscalculated (the `set.weight`/`set.reps` field-name
      bug in `lib/utils/volume.ts` is fixed before this ships).
- [ ] A deload week is never visually indistinguishable from an unplanned volume drop.
- [ ] `substitutedFrom` continuity is preserved when a substituted exercise's history is displayed.

## 13. Testing Checklist

### Manual Testing

- [ ] Log all sets of an exercise including a required-RIR last set; verify rest timer starts and
      counts down correctly.
- [ ] Background the app mid-rest-timer and return; verify remaining time is correct, not reset.
- [ ] Trigger a network failure on `POST /api/tracking/log`; verify entered values persist and
      retry works.
- [ ] Log the same set twice quickly (double-tap); verify only one `set_logs` row is created.
- [ ] First-ever exercise with no history; verify calibration-week copy, no overload badge.
- [ ] Complete a full session; verify the session summary tonnage matches the sum of logged sets
      and `workout_sessions.status` becomes `'completed'`.
- [ ] Open Progress with at least 2 weeks of data; verify the e1RM chart, the raw-set tooltip, and
      that an untrained week shows as a gap, not an interpolated line.
- [ ] Open Progress during a deload week; verify the volume bars don't render as a warning.
- [ ] Open History; verify chronological order and that tapping a session shows its exact logged
      sets.
- [ ] Log a set in `lb`; verify it is stored and later displayed consistent with sets logged in
      `kg`.
- [ ] Test mobile layout at 390×844 and desktop at 1440px.

### API/Test Data

**Sample input (`POST /api/tracking/log`):**

```json
{
  "sessionId": "session-upper-a",
  "sessionExerciseId": "session-bench",
  "exerciseId": "bench-barbell",
  "setNumber": 3,
  "reps": 10,
  "weight": 82.5,
  "weightUnit": "kg",
  "rir": 2,
  "isLastSet": true
}
```

**Expected safety assertions:**

- `sessionExerciseCompleted: true` only when `isLastSet` is true.
- `restSeconds` matches the exercise's configured rest, not a hardcoded default.
- A second identical request returns `409 DUPLICATE_SET`, not a second row.

## 14. Dependencies

### External Libraries

- `ai` / `@ai-sdk/anthropic` — `generateObject` for the (to-be-fixed) load prediction call.
- `zod` — request and `PredictiveLoadSchema` validation.
- A charting library — **not yet chosen or installed**; resolve per `WIREFRAME-BRIEF.md` §8
  before building `ProgressHeroChart`.

### Internal Dependencies

- `types/index.ts` — `SetLog`, `SessionExercise`, `VolumeCalculation`, `WeeklyVolume`,
  `ProgressHistory`, `PredictiveLoad`. Needs a new `set_logs` table entry under
  `Database.public.Tables` and (see Open Questions) a unit-preference field on `UserProfile`.
- `lib/constants.ts` — `RIR`, `LOAD_INCREMENT_KG`, `WEEKLY_VOLUME_CAPS` (all already correct and
  reusable as-is).
- `lib/utils/volume.ts` — needs the `set.weight`/`set.reps` → `set.weightUsed`/`set.repsCompleted`
  fix before it produces real numbers (§7).
- `lib/ai/service.ts#predictNextLoad`, `lib/ai/prompts.ts`, `lib/ai/schemas.ts` — need the
  Zod-schema rework described in §8.
- `lib/supabase/queries.ts` / `mutations.ts` — currently thin stubs; this feature is what defines
  most of their real implementations (§6).
- Active session UI (`app/session/page.tsx`) and authentication context.

### Blockers

- [ ] `lib/utils/volume.ts` field-name mismatch must be fixed (blocks all tonnage/volume numbers).
- [ ] `predictNextLoad` must move to `generateObject` + Zod before `predict-load` ships (blocks
      the prefill/overload badge from being trustworthy).
- [ ] A `set_logs` table (or equivalent) must exist — no normalized per-set history table exists
      today.
- [ ] Chart library decision (§9) must be made before `ProgressHeroChart` can be implemented.
- [ ] Authenticated user/session contract for API routes (shared blocker with the substitution
      feature — see `intelligent-exercise-substitution.md` §14).

## 15. Implementation Notes

### Development Approach

1. Fix `lib/utils/volume.ts`'s field names and add the missing `set_logs` schema/queries first —
   nothing else in this feature produces correct numbers without it.
2. Build `SetLogRow` and `RestTimer` against mock data in `/session`, matching the existing mock
   exercises already in `app/session/page.tsx`.
3. Wire `POST /api/tracking/log` to real persistence; replace the current "Registrar serie" button
   (which just marks the whole exercise `completed` with no per-set data) with the new flow.
4. Fix `predictNextLoad` to use `generateObject` + a Zod schema, then wire `POST
   /api/ai/predict-load` and the overload badge.
5. Build `SessionSummary`, wire session completion.
6. Choose a chart library, then build `ProgressHeroChart`, `VolumeVsCapChart`, and `HistoryList`
   against `GET /api/tracking/volume` and `GET /api/tracking/history`.
7. Run lint/build checks and complete the manual browser checklist (§13).

### Technical Decisions

**Set persistence granularity**

- Choice: a normalized `set_logs` table, not the JSON `performanceLog` field alone.
- Why: the Progress dashboard's access pattern (by user + exercise + date range, across the whole
  program) needs indexed queries, not JSON blobs read per session.
- Alternative rejected: keeping only `SessionExercise.performanceLog` — fine for display within one
  session, not for the cross-session queries this feature needs.

**Rest timer clock source**

- Choice: absolute end timestamp, recomputed on each render/visibility change.
- Why: a `setInterval` countdown that just decrements a local number drifts or resets when the tab
  is backgrounded — exactly the scenario a gym user hits (checking their phone, texting) that this
  feature must not break.

**Weight unit storage**

- Choice: canonical kg storage, unit conversion at write time.
- Why: keeps every downstream calculation (tonnage, e1RM, volume caps) in one unit; converting at
  read time instead would require every consumer to know the entered unit.

### Performance Considerations

- Cache the current session's exercise/prediction context client-side for the session's duration
  to avoid re-fetching between sets.
- Cap the `predict-load` AI call latency; the set row must remain usable even if it times out.
- `GET /api/tracking/volume` should be computed incrementally where possible (or cached per week)
  rather than recomputing the full program history on every dashboard open.

## 16. Open Questions

- [ ] Should RPE be a required input alongside RIR, as requested, or does the locked
      `WIREFRAME-BRIEF.md` §3.3 decision ("RPE hidden in MVP") stand? The `SetLog` and
      `SessionExercise` types already carry an optional `rpe` field, so this spec treats RPE as
      optional/secondary pending that confirmation — flag before building the set-row UI.
- [ ] Where does the user's preferred weight-unit (`kg`/`lb`) actually live? It's referenced as a
      `units` column on `user_profiles` in `intelligent-exercise-substitution.md`'s Database
      section, but is not declared on the `UserProfile` TypeScript interface — needs to be added
      for real, or an alternative source of truth confirmed.
- [ ] Which authenticated user/session context is available inside these API routes (same open
      question as the substitution feature)?
- [ ] Chart library: Recharts vs. Visx vs. hand-rolled SVG (`WIREFRAME-BRIEF.md` §8, unresolved).
- [ ] Does the Progress tab need a per-exercise drill-down beyond the PR list in MVP, or is the PR
      list + tap-to-inspect chart tooltip sufficient (`WIREFRAME-BRIEF.md` §8, unresolved)?
- [ ] When an exercise is substituted mid-program, does its e1RM/PR history continue under the
      original exercise, start fresh under the replacement, or show both series distinctly?
- [ ] Is the deload week's `Microcycle.focus` reliably available to the tracking API, or does this
      feature need its own way to detect "this week is a scheduled deload"?
- [ ] Program-completion behavior (candidate Screen 36 in `WIREFRAME-BRIEF.md` §8) — archiving a
      finished program's chart series as faded history is proposed but not approved.

## 17. Related Documents

- [Feature Development Guide](../FEATURE_DEVELOPMENT_GUIDE.md)
- [Domain Rules](../DOMAIN-RULES.md), especially §4 (Volume Tracking & Progressive Overload)
- [Wireframe Brief](../WIREFRAME-BRIEF.md), especially §3.3 (Active session) and §3.5 (Progress
  dashboard — FINAL)
- [Intelligent Exercise Substitution](intelligent-exercise-substitution.md) — shares the active
  session, `substitutedFrom` continuity, and the open auth-context question
- [AI service](../../lib/ai/service.ts)
- [AI schemas](../../lib/ai/schemas.ts)
- [Volume utilities](../../lib/utils/volume.ts)
- [Domain constants](../../lib/constants.ts)
- [Tracking routes](../../app/api/tracking)
- [Predict-load route](../../app/api/ai/predict-load/route.ts)
- [Active session page](../../app/session/page.tsx)

## 18. Timeline & Milestones

| Milestone | Target | Status |
|---|---|---|
| Specification complete | 2026-09-04 | Done |
| `set_logs` schema + volume-util fix | TBD | Pending |
| Set logging + rest timer UI | TBD | Pending |
| `predict-load` Zod rework + wiring | TBD | Pending |
| Session summary | TBD | Pending |
| Chart library decision | TBD | Pending |
| Progress dashboard (hero + volume-vs-cap + history) | TBD | Pending |
| Manual browser testing | TBD | Pending |
| Launch | TBD | Pending |

## 19. Feedback & Iteration

### Design Review Notes

- The rest timer and set row must stay in the bottom-third thumb zone — this is a hard constraint
  inherited from `WIREFRAME-BRIEF.md` §2, not a preference for this feature to relitigate.
- e1RM, not raw weight or raw reps, is the deliberate chart axis so that progress in either
  dimension is visible (`DOMAIN-RULES.md` §4.4).

### Development Feedback

- `/session` currently renders mock exercises with a "Registrar serie" button that marks the
  entire exercise `completed` — there is no per-set logging, no rest timer, and no RIR capture in
  the shipped UI yet.
- `/progress` and `/history` are placeholder pages (`<h1>Progress</h1>` / `<h1>History</h1>`).
- All three `/api/tracking/*` routes and `/api/ai/predict-load` are `501` stubs.
- `lib/supabase/queries.ts` and `mutations.ts` are mostly stubs (`getUserProfile` is the one real
  implementation); `logSet` throws `Not implemented`.
- Two concrete pre-existing bugs surfaced while writing this spec and are called out inline
  because they block this feature specifically: `lib/utils/volume.ts` reads field names that
  don't exist on `SetLog`, and `lib/ai/service.ts#predictNextLoad` regex-parses prose instead of
  using a validated schema.

### User Testing Feedback

- No formal user testing has been completed yet.

### Changes Made

| Date | Change | Reason |
|---|---|---|
| 2026-09-04 | Initial specification created | Requested to document the workout-level logging/rest-timer flow and the routine-level progress dashboard, grounded in the existing wireframe brief, domain rules, and current (stub) codebase state. |

**Last Updated:** 2026-09-04
**Feature Owner:** Gym AI product team
**Status:** Planning
