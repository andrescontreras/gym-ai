# Personalized Routine Builder - Specification

> The Kinetic Routine Wizard is visual reference only. The product flow follows
> `WIREFRAME-BRIEF.md` §3.1 and the Gym AI safety rules in `docs/DOMAIN-RULES.md`.

---

## Feature Metadata

| Field | Value |
|---|---|
| Feature Name | Personalized Routine Builder |
| Feature Owner | Gym AI product team |
| Priority | High |
| Estimated Effort | 5 development days plus QA |
| Dependencies | Auth, profiles, exercise catalog, AI service, Supabase routines and sessions |
| Status | Development |

---

## 1. Overview

### What This Feature Does

The builder captures the nine-step onboarding contract: goal, experience, biometrics, injuries, availability, equipment, preferred split, optional known lifts, and review. It then produces a personalized weekly routine with exercise prescriptions, weekly volume, progression guidance, recovery notes, and explainable AI diagnostics.

### User Problem Solved

Users lack a practical, individualized program and often choose exercises, volume, and splits that do not reflect their equipment, constraints, recovery capacity, or priorities. The feature turns those inputs into an actionable routine and lets users adjust it without rebuilding the plan manually.

### Success Metrics

- [ ] 100% of plans exclude injury-restricted movements.
- [ ] 100% of weekly per-muscle volumes remain within experience-specific hard caps.
- [ ] 100% of generated plans include a user-visible rationale.
- [ ] At least 90% of valid generation attempts return a displayable plan within 30 seconds.
- [ ] Users can start a selected routine day and log a completed workout.

---

## 2. User Stories

**Primary User Story:**

> As a lifter, I want to answer a short calibration wizard and receive a routine tailored to my goals, schedule, equipment, and limitations so that I can begin training with confidence.

**Additional User Stories:**

- As a beginner, I want an experience-appropriate starting volume and intensity.
- As a lifter with knee, shoulder, wrist, elbow, or lower-back discomfort, I want unsafe movements removed from my plan.
- As a time-constrained user, I want sessions matched to 30, 45, 60, 75, or 90 minutes.
- As a user reviewing a plan, I want to select a day, replace an exercise, or recalibrate.
- As an active lifter, I want to log weight, reps, RPE, rest, and completion by set.

---

## 3. User Flow

### Happy Path

1. User opens `/onboarding` or selects **Create your routine**.
2. User completes the nine steps: goal, experience, biometrics, injuries, availability, equipment, preferred split, optional known lifts, and review.
3. On review, the user can edit answers and confirm any split-conflict recommendation.
4. User selects **Generate my program**.
5. System shows staged analysis: profile and goals, volume, equipment, safety filters, then microcycle synthesis.
6. System returns a generated routine and persists it for the user.
7. User reviews diagnostics, selects a training day, and reviews exercises, volume, and progression.
8. User starts a session, logs sets in the active-workout player, and finishes the workout.
9. System persists the workout log and returns the user to the routine/dashboard.

### Alternative Flows

**Recalibrate**

1. User selects **Recalibrate** from the routine dashboard.
2. The wizard starts again with existing values retained where appropriate.
3. User changes inputs and generates a replacement routine.

**Exercise replacement**

1. User opens the replacement control from a routine exercise.
2. User selects a catalog alternative or enters a reason for an AI alternative.
3. User reviews the alternative and applies it.
4. The plan updates and persists.

Export and coach chat are out of MVP scope.

### Error Flows

**Invalid or incomplete input**: user remains on the affected wizard step, sees inline validation, and retains entries.

**AI generation failure**: preserve the submission, end the loading state, show retry, and do not show an incomplete plan.

**Unsafe plan output**: reject output that violates injury, equipment, volume, or recovery constraints; retry once with explicit correction requirements, then return a safe error.

**Storage failure**: show that the plan or workout log could not be saved and provide retry; do not silently claim persistence.

---

## 4. Screens & Design

### Screen List

| # | Screen Name | Source | Description |
|---|---|---|---|
| Step 1 | Goal | Single-select MVP goal. |
| Step 2 | Experience | Beginner, intermediate, or advanced. |
| Step 3 | Biometrics | Sex (optional until product vocabulary is decided), age, height, bodyweight, and kg/lb units. |
| Step 4 | Injury map | Front/back body map with zone, severity, and optional note. |
| Step 5 | Availability | 2-6 days/week and 30/45/60/75/90 minutes/session. |
| Step 6 | Equipment | Commercial, home, or bodyweight preset with optional equipment checklist. |
| Step 7 | Preferred split | Full body, upper/lower, PPL, or no preference; a soft input. |
| Step 8 | Known 1RM | Optional squat, bench, and deadlift best sets (weight × reps); "I don't know" is valid. |
| Step 9 | Review | Editable summary and split-conflict card. |
| — | AI loading | Staged analysis and progress. |
| — | Routine dashboard | Plan diagnostics, day selection, prescriptions, and volume. |
| — | Exercise replacement | Catalog alternatives and AI alternative request. |
| — | Active workout | Set logging, rest timer, plate calculator, and completion. |

### Component States

**Wizard navigation**

- Default: current step highlighted in the header; prior steps are reachable with **Back**.
- Generating: back and submit controls disabled.
- Cancel: returns to the dashboard when a plan exists, otherwise the first step.

**Selectable cards and controls**

- Default: unselected card or segmented option.
- Selected: high-contrast selection state and included in `WizardData`.
- Hover/focus: visible contrast and focus indicator.
- Disabled: unavailable during routine generation.

**Generation screen**

- Loading: sequential biomechanical-analysis messages and percentage progress.
- Success: transition to routine dashboard.
- Error: replace simulated progress with a clear retry and return action.

**Routine dashboard**

- Default: first routine day selected.
- Day selected: shows session focus, estimated duration, protocols, exercises, and volume.
- Exercise edited: updates the selected exercise while preserving its prescription unless the replacement provides one.
- Empty: full-width **Create your routine** action when no active plan exists.

**Active workout**

- Default: first exercise and prefilled set rows.
- Set completed: row changes state and rest timer starts.
- Rest running, paused, extended, and skipped: timer remains visible at the bottom.
- Finish: shows summary/confirmation after workout log persistence.

### Responsive Behavior

- Desktop (`1024px+`): two-column selection grids, dense dashboard day grid, and centered active workout content.
- Tablet (`768px-1023px`): two-column cards where practical; dashboard controls wrap without losing actions.
- Mobile (`<768px`): single-column wizard, horizontal scroll for dense controls, modal/sheet replacement views, primary actions in the lower thumb zone.
- Tap targets must be at least `48px`; user-entered notes and long translated labels must wrap without clipping.

---

## 5. API Endpoints

### Endpoint 1: Generate Routine

**Method:** `POST`  
**Route:** `/api/routines/generate`  
**Purpose:** Generate, safety-validate, and save a personalized routine from onboarding input.

**Request:**

```typescript
{
  onboardingData: {
    version: 2,
    goal: 'hypertrophy',
    experienceLevel: 'intermediate',
    biometrics: { age: 30, heightCm: 175, bodyweight: 80, units: 'kg' },
    injuries: [{ zone: 'knee', severity: 'moderate', notes: 'Pain when squatting deeply' }],
    availability: { daysPerWeek: 4, minutesPerSession: 60 },
    equipment: { preset: 'home', items: ['dumbbells', 'resistance_bands'] },
    preferredSplit: 'upper_lower',
    knownLifts: { bench: { weight: 80, reps: 5 } }
  }
}
```

**Response (Success - 200):**

```typescript
{
  success: true,
  data: {
    plan: WorkoutPlan,
    aiRationale: 'Upper/lower split selected to preserve recovery across four days.',
    injuryConsiderations: ['knee (moderate): Avoid squat'],
    progressionNotes: 'Add 2.5 kg or one rep when RIR is at most 2.'
  }
}
```

**Response (Error):**

```typescript
{ error: 'We could not safely generate a routine.', code: 'UNSAFE_GENERATED_PLAN' }
```

**Current status:** `app/api/routines/generate/route.ts` returns `501`. The existing `generateWorkoutPlan` service uses `claude-sonnet-4-5` with `WorkoutPlanSchema`; route validation, authorization, safety checks, and persistence remain to be implemented.

### Endpoint 2: Save Workout Log

**Method:** `POST`  
**Route:** `/api/tracking/log`  
**Purpose:** Persist completed set logs, workout duration, total tonnage, and notes.

**Request:**

```typescript
{
  sessionId: 'uuid',
  exercises: [{ exerciseId: 'uuid', sets: [{ setNumber: 1, weightUsed: 80, repsCompleted: 8, rir: 2 }] }],
  durationSeconds: 3600,
  notes: 'Felt strong'
}
```

**Response (Success - 200):**

```typescript
{ success: true, data: { sessionId: 'uuid', status: 'completed', totalVolume: 1920 } }
```

### Endpoint 3: Replace Exercise

**Method:** `POST`  
**Route:** `/api/ai/substitute`  
**Purpose:** Return safe alternatives with rationale and translated prescription.

The prototype invokes `/api/suggest-alternative`; Gym AI must use its existing typed substitution endpoint instead and preserve movement pattern, injury constraints, and load translation.

---

## 6. Database

### Tables Used

**Table: `user_profiles`**

- Operations: Read and update.
- Columns: `id`, `experience_level`, `injuries`, `preferences`, `onboarding`.
- `onboarding` stores the complete, versioned `OnboardingData` v2 snapshot as the canonical onboarding record.
- `experience_level` and `injuries` mirror `onboarding.experienceLevel` and `onboarding.injuries` for existing profile consumers.
- Goal, biometrics, availability, equipment, preferred split, and known lifts are stored in the `onboarding` JSONB snapshot. `preferences` remains for durable user preferences outside this submission.
- No schema migration is required for RB-01. Any update must write the snapshot and its mirrors atomically.
- A saved draft is not completion. RB-04 must define a durable indication that the user confirmed review, and `isOnboardingComplete` must require that indication and a valid v2 snapshot. Neither the indication nor persistence is implemented by RB-01.

### Onboarding contract (v2)

The canonical shape is `OnboardingData` in `types/index.ts`, validated by
`OnboardingSchema` in `lib/validation/onboarding.ts`. It represents:

| Field | Contract |
|---|---|
| `version` | Literal `2`. |
| `goal` | `hypertrophy`, `fat_loss`, or `endurance`. Strength remains in the shared plan `Goal` type but is not an MVP onboarding choice (TEAM-IMPLEMENTATION-PLAN.md Q12). |
| `experienceLevel` | `beginner`, `intermediate`, or `advanced`; mirrored to `experience_level`. |
| `biometrics` | Optional free-text `sex`, age, height in centimeters, bodyweight, and bodyweight/lift units (`kg` or `lb`). |
| `injuries` | Unique zone entries with severity and optional notes; mirrored to `injuries`. |
| `availability` | 2-6 training days and 30/45/60/75/90 minutes per session. |
| `equipment` | An equipment item list and optional `commercial`, `home`, or `bodyweight` preset; at least one preset or item is required. |
| `preferredSplit` | `full_body`, `upper_lower`, `ppl`, or `no_preference`; the generator may override it for recovery. |
| `knownLifts` | Optional squat, bench, and deadlift best sets (`weight` × `reps`); omitted or empty means the user does not know their 1RM. Best sets are converted using Epley as described in `WIREFRAME-BRIEF.md` §3.1. |

Height is normalized to centimeters; bodyweight and best-set weights use `biometrics.units`.
The wireframe does not define allowed sex values or whether the field is required, so the
contract leaves it optional and accepts a bounded string until product resolves the UI.
The injury-zone vocabulary uses the current proposed catalog zones; the zone-to-restricted-
pattern mapping remains pending product approval (TEAM-IMPLEMENTATION-PLAN.md Q1).

**Table: `workout_plans`**

- Operations: Create, read, update.
- Columns: `id`, `user_id`, `name`, `duration_weeks`, `microcycles`, `goals`, `volume_profile`, `ai_rationale`, timestamps.
- New columns: none for the existing JSONB plan representation.

**Table: `workout_sessions`**

- Operations: Create, read, update.
- Columns: `id`, `user_id`, `plan_id`, `date`, `name`, `status`.
- Purpose: materialize accepted routine days as planned sessions.

**Table: `session_exercises` and `set_logs`**

- Operations: Create, read, update.
- Purpose: preserve prescriptions and completed weight, reps, RIR, RPE, and timestamps.

### Queries Needed

- `getUserProfile(userId)` - existing profile lookup.
- `getWorkoutPlanById(planId, userId)` - owned routine detail.
- `getUserWorkoutPlans(userId)` - plan dashboard/list.
- `getPlanSessions(planId, userId)` - planned session and exercise detail.

### Mutations Needed

- `createWorkoutPlan(plan)` - save a validated AI plan.
- `createPlannedSessions(plan)` - create planned sessions and their exercises after acceptance.
- `updateWorkoutPlan(planId, userId, updates)` - save accepted recalibration or routine replacement.
- `updatePlanExercise(...)` - persist a routine-level exercise swap.
- `logSet(...)` and `completeSession(...)` - record workout completion atomically.

---

## 7. Business Logic

### Validation Rules

**Frequency**

- Rule: accept 2-6 days per week, matching the wireframe.
- Error: `Choose between 2 and 6 training days per week.`

**Session duration**

- Rule: allow 30, 45, 60, 75, or 90 minutes; prescribed exercise count must fit the selected duration.
- Error: `Choose an available session duration.`

**Equipment**

- Rule: require an equipment preset or at least one equipment item; every selected exercise must be compatible.
- Error: `Select the equipment available to you.`

**Limitations and injuries**

- Rule: capture each zone and severity. Map injury zones to restricted movement patterns only after product approval of the mapping (TEAM-IMPLEMENTATION-PLAN.md Q1).
- Error: `Tell us the severity for each selected injury area.`

### Calculations & Algorithms

**Split selection**

- 2 days: Full Body A/B.
- 3 days: Full Body when selected; otherwise an explicitly justified alternative. The review step surfaces the 3-day PPL recovery/frequency conflict and lets the user choose the recommended split or retain their preference.
- 4 days: Upper/Lower.
- 5 days: PPL plus Upper/Lower.
- 6 days: Push/Pull/Legs twice weekly.

**Volume**

| Experience | Weekly sets per muscle group |
|---|---|
| Beginner | 10-12 |
| Intermediate | 12-18 |
| Advanced | 16-22 |

**Periodization**

- Hypertrophy plans default to 8-12 weeks.
- Accumulation uses higher volume and moderate intensity.
- Intensification uses lower volume and higher intensity.
- Deload reduces volume 40-50% every 4-6 weeks.

### Business Constraints

- Never prescribe a user-restricted movement pattern.
- Never exceed per-muscle hard caps.
- Ensure 48-72 hours before the same muscle group is trained again.
- Never fall back to incompatible equipment after filtering removes all candidates.
- Every AI decision carries a rationale.
- Raw AI output is never displayed or persisted without validation.

---

## 8. AI Integration

### AI Service Used

- Model: Claude Sonnet 4.5 (`claude-sonnet-4-5`, configured in `lib/ai/config.ts`).
- Function: `generateWorkoutPlan` in `lib/ai/service.ts`.
- Prompt builder: `buildRoutineBuilderPrompt` in `lib/ai/prompts.ts`.
- Validation: `WorkoutPlanSchema` from `lib/ai/schemas.ts`, called via `generateValidatedObject` in `lib/ai/service.ts`.
- Why: routine creation requires safety-sensitive reasoning across injuries, equipment, volume, recovery, and periodization.

### Prompt Requirements

The request uses the v2 onboarding contract: experience, goal, biometrics needed for load context, injury zones and notes, availability, equipment, preferred split, and optional best sets. It must direct the model to return only the typed plan structure, a programming rationale, weekly volume distribution, and explicit injury considerations. Injury-zone restrictions must follow the approved mapping once Q1 is resolved; do not infer an approved mapping from the current proposal.

### Response Format (Zod Schema)

`WorkoutPlanSchema` validates generated plan content using the strict nested
`MicrocycleSchema`, `PlannedSessionSchema`, and `PlannedExerciseSchema` from S0-J3.
Each week, session, and exercise includes a rationale; exercise IDs are catalog UUIDs,
and `weight: null` represents an unknown starting load. The server supplies plan identity,
user identity, goals, and timestamps. See `TEAM-IMPLEMENTATION-PLAN.md` §5.3 for
date consistency and planned-session mapping.

Schema validation alone does not establish injury, equipment, volume, recovery, or catalog
safety. RB-03 and RB-06 must enforce those invariants before persistence or presentation.
The current structured output schema has no safety-blocker variant, so the future generation
route must surface unresolved safety constraints as an error rather than relying on the model
to return a blocker in a plan-shaped response.

### Fallback Behavior

- Retry once after a model-output validation or invariant failure using a clarified prompt.
- On subsequent failure, show a recoverable error and retain wizard data.
- Do not use the prototype's unrestricted catalog fallback, because it can reintroduce unsafe or unavailable exercises.
- A future rule-based fallback must apply the same injury, equipment, recovery, and volume validation.

---

## 9. Components

### New Components to Create

| Component | Location | Purpose |
|---|---|---|
| `OnboardingWizard` | `components/onboarding/OnboardingWizard.tsx` | Nine-step wizard state, review, and validation. |
| `GoalStep` | `components/onboarding/goal-step.tsx` | Single goal selection. |
| `ExperienceStep` | `components/onboarding/experience-step.tsx` | Experience level selection. |
| `BiometricsStep` | `components/onboarding/biometrics-step.tsx` | Age, height, bodyweight, units, and optional sex. |
| `InjuryStep` | `components/onboarding/injury-step.tsx` | Injury zones, severity, and notes. |
| `AvailabilityStep` | `components/onboarding/availability-step.tsx` | Training days and session duration. |
| `EquipmentStep` | `components/onboarding/equipment-step.tsx` | Preset and equipment selections. |
| `PreferredSplitStep` | `components/onboarding/preferred-split-step.tsx` | Soft split preference. |
| `KnownLiftsStep` | `components/onboarding/known-lifts-step.tsx` | Optional best-set entries. |
| `ReviewStep` | `components/onboarding/review-step.tsx` | Editable summary and split-conflict card. |
| `RoutineGenerationProgress` | `components/routine/routine-generation-progress.tsx` | Real async generation state. |
| `RoutineDashboard` | `components/routine/routine-dashboard.tsx` | Plan review, day navigation, diagnostics, and volume. |
| `ActiveWorkoutPlayer` | `components/session/active-workout-player.tsx` | Logging, timer, calculator, and completion. |

### Existing Components to Reuse

- `components/shared/Button.tsx`
- `components/shared/Card.tsx`
- `components/shared/Input.tsx`
- `components/shared/Alert.tsx`
- `components/shared/Modal.tsx`
- `components/shared/StatusChip.tsx`
- `components/session/exercise-substitution.tsx`

---

## 10. Error Handling

### Error Scenarios

**Network or AI provider error**

- When: route timeout, unavailable provider, or missing server configuration.
- User experience: `We couldn't generate your routine right now. Your answers are saved.`
- Recovery: retry or return later.

**Unsafe output**

- When: plan fails injury, equipment, volume, recovery, or rationale validation.
- User experience: `We couldn't safely build a plan from these details yet.`
- Recovery: automatic retry once, then user can edit data or retry.

**Workout save error**

- When: one or more set logs cannot persist.
- User experience: visible unsaved state; do not mark the workout complete.
- Recovery: retry the write with the locally retained set data.

### Error Messages

```typescript
const ERROR_MESSAGES = {
  INVALID_FREQUENCY: 'Choose between 2 and 6 training days per week.',
  INVALID_DURATION: 'Choose an available session duration.',
  NO_EQUIPMENT: 'Select the equipment available to you.',
  AI_FAILED: "We couldn't generate your routine right now. Your answers are saved.",
  UNSAFE_PLAN: "We couldn't safely build a plan from these details yet.",
  SAVE_FAILED: "We couldn't save this workout. Try again before leaving."
};
```

---

## 11. Edge Cases

### Empty States

**No active routine**

- Display: one clear routine-creation entry point.
- CTA: opens `/onboarding`.

**No safe exercise for a muscle/equipment combination**

- Display: explain that the current constraints do not support a safe exercise.
- CTA: edit equipment or limitations; never silently use the unfiltered catalog.

### Loading States

**Routine generation**

- UI: full-screen, staged progress.
- Expected duration: 5-20 seconds; timeout threshold: 30 seconds.
- Messages: profile analysis, volume calculation, equipment alignment, limitation filtering, microcycle synthesis.

### Data Limits

- Training days: 2-6.
- Duration choices: 30, 45, 60, 75, 90 minutes.
- Goal: one MVP goal per onboarding submission. The UI offers hypertrophy, fat loss, and endurance; `strength` remains represented in the shared plan `Goal` type but is not an MVP onboarding choice (TEAM-IMPLEMENTATION-PLAN.md Q12).
- No max saved-routine limit is defined.

---

## 12. Acceptance Criteria

### Functional Requirements

- [ ] User can complete all nine onboarding steps, skip known lifts, review the summary, and generate a plan.
- [ ] The authenticated identity controls routine ownership.
- [ ] Plans pass strict structured validation before display and persistence.
- [ ] Plans exclude restricted patterns and unavailable equipment.
- [ ] Per-muscle volume is within the correct experience cap.
- [ ] Recovery spacing meets 48-72 hours.
- [ ] Plan dashboard displays diagnostics, days, protocols, prescriptions, volume, and progression.
- [ ] User can start a day, log sets, run rest timer, and save a completed workout.
- [ ] User can request a safe exercise substitution with an explanation.
- [ ] Retry and error states preserve entered data.

### Non-Functional Requirements

- [ ] Generation resolves or fails recoverably inside 30 seconds.
- [ ] Layout is usable on mobile, tablet, and desktop.
- [ ] All controls work with keyboard and assistive technologies.
- [ ] No client receives model secrets, raw model output, or internal errors.

### Edge Cases Handled

- [ ] No limitations.
- [ ] Multiple limitations.
- [ ] No compatible exercise remains after safety filters.
- [ ] User skips optional known-lift entries.
- [ ] Provider failure.
- [ ] Failed plan or workout persistence.

---

## 13. Testing Checklist

### Manual Testing

- [ ] Complete the builder for every experience level.
- [ ] Validate the v2 request schema for each goal, equipment path, injury list, and optional best-set state.
- [ ] Generate routines at 2, 3, 4, 5, and 6 days and validate split/recovery behavior.
- [ ] Verify all session-duration choices stay within exercise-count constraints.
- [ ] Test each equipment environment and custom equipment selection.
- [ ] Test injury-zone capture, severity, optional notes, and duplicate-zone rejection.
- [ ] Verify injury-to-pattern safety behavior after the product approves the mapping (Q1).
- [ ] Exercise plan day selection and replacement states.
- [ ] Log, complete, and retry persistence for a workout at mobile and desktop widths.
- [ ] Simulate slow, failed, malformed, and unsafe AI outputs.

### Test Data

```json
{
  "version": 2,
  "goal": "hypertrophy",
  "experienceLevel": "intermediate",
  "biometrics": {
    "age": 30,
    "heightCm": 175,
    "bodyweight": 80,
    "units": "kg"
  },
  "injuries": [{ "zone": "knee", "severity": "moderate" }],
  "availability": { "daysPerWeek": 4, "minutesPerSession": 60 },
  "equipment": { "preset": "home", "items": ["dumbbells", "cables"] },
  "preferredSplit": "upper_lower",
  "knownLifts": { "bench": { "weight": 80, "reps": 5 } }
}
```

Expected: an 8-12 week plan that uses a recovery-aware four-day split, includes a rationale, and remains at or below intermediate weekly volume caps. Injury-to-pattern behavior is blocked on Q1 approval; the contract does not silently treat the proposed mapping as approved.

---

## 14. Dependencies

### External Libraries

- `ai` and `@ai-sdk/anthropic` - structured Claude generation.
- `zod` - request and model-output validation.
- `@supabase/ssr` and `@supabase/supabase-js` - authentication and persistence.
- `lucide-react` - interface icons.

### Internal Dependencies

- `lib/ai/prompts.ts`, `lib/ai/service.ts`, and `lib/ai/schemas.ts`.
- `types/index.ts` for shared contracts.
- `lib/supabase/queries.ts` and `lib/supabase/mutations.ts` for data access.
- `docs/DOMAIN-RULES.md` for safety constraints.
- `docs/WIREFRAME-BRIEF.md` for mobile flow and screen decisions.

### Blockers

- [ ] Implement the routine-generation route.
- [ ] Integrate the typed onboarding request and S0-J3 serializable plan schema in the generation route.
- [ ] Build deterministic safety validators.
- [ ] Implement workout-plan and planned-session persistence.
- [ ] Resolve TEAM-IMPLEMENTATION-PLAN.md Q1 before enabling injury-to-pattern safety validation; do not infer product approval from the proposed mapping.

---

## 15. Implementation Notes

### Development Approach

1. Align prototype wizard inputs with `OnboardingData` and `UserProfile` in `types/index.ts`.
2. Create strict request/output schemas and deterministic post-generation validators.
3. Implement protected generation and persistence routes.
4. Build the nine wizard steps and real asynchronous progress state.
5. Build dashboard, session-player, and safe-substitution integrations.
6. Manually verify safety invariants against real Supabase and AI services.

### Technical Decisions

**Generation source**

- Choice: Claude structured output plus deterministic validation.
- Why: the source prototype uses `generateCalibratedRoutine`, a local deterministic generator; Gym AI already has a Claude service and must combine it with server-side safety guarantees.
- Alternative: port the prototype generator unchanged. Rejected because its fallback can bypass equipment and limitation filtering, and its volume logic does not enforce hard caps.

**Persistence**

- Choice: Supabase `workout_plans`, `workout_sessions`, `session_exercises`, and `set_logs`.
- Why: production users need authenticated cross-device state; prototype `localStorage` is local-only.

### Performance Considerations

- Validate before invoking the AI model.
- Load the user profile once on the server as the authoritative context.
- Disable duplicate submissions while generation runs.
- Use a 30-second timeout and preserve client-side wizard state for retry.
- Persist only validated plans and atomically save completion data.

---

## 16. Open Questions

- [ ] What canonical mapping translates each body-map limitation to `restrictedPatterns`?
- [ ] Should plans create planned sessions immediately or only after explicit user acceptance?
- [ ] How should an approved `arnold` split be reconciled with recovery and volume constraints?
- [ ] Should the active workout player use RIR as the MVP effort field, with RPE hidden per the wireframe brief?

---

## 17. Related Documents

- Design reference: `/Users/oscarepam/Downloads/kinetic-routine-wizard`.
- [docs/FEATURE_TEMPLATE.md](../FEATURE_TEMPLATE.md)
- [docs/DOMAIN-RULES.md](../DOMAIN-RULES.md)
- [docs/WIREFRAME-BRIEF.md](../WIREFRAME-BRIEF.md)
- [docs/features/intelligent-exercise-substitution.md](intelligent-exercise-substitution.md)

---

## 18. Timeline & Milestones

| Milestone | Target Date | Status |
|---|---|---|
| Specification complete | 2026-11-25 | Done |
| Onboarding contract and schema (RB-01) | 2026-11-25 | Done |
| Deterministic safety validators | TBD | Not started |
| Generation API | TBD | Not started |
| Wizard UI | TBD | Not started |
| Dashboard and session integration | TBD | Not started |
| Manual QA | TBD | Not started |
| Launch | TBD | Not started |

---

## 19. Feedback & Iteration

### Design Review Notes

- The Kinetic prototype is Spanish-first, desktop-responsive, and uses a dark precision-training visual system.
- Its five-step flow is visual reference only; Gym AI follows the nine-step onboarding contract in `WIREFRAME-BRIEF.md` §3.1.

### Development Feedback

- The prototype is local-first: plan and history are saved in `localStorage`.
- Generation is deterministic and based on a local exercise catalog despite simulated AI loading.
- Its catalog fallback, volume calculation, and limitation model cannot be used unchanged because Gym AI requires hard training-safety constraints.
- Gym AI already has the Claude generation service, but its route and persistence layer remain incomplete.

### User Testing Feedback

- Pending.

### Changes Made


---

**Last Updated:** 2026-11-25
**Feature Owner:** Gym AI product team  
**Status:** Development