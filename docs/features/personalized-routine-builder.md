# Personalized Routine Builder - Specification

> Feature specification based on the Kinetic Routine Wizard prototype at `/Users/oscarepam/Downloads/kinetic-routine-wizard` and the Gym AI safety rules in `docs/DOMAIN-RULES.md`.

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

The builder gathers a trainee's goal, experience, frequency, session duration, split preference, equipment, muscle priorities, limitations, effort method, rest preference, and optional notes. It then produces a personalized weekly routine with exercise prescriptions, warm-up and cooldown protocols, weekly volume, progression guidance, recovery notes, and explainable AI diagnostics.

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
- As a user with a muscle priority, I want that muscle to receive additional planned volume.
- As a user reviewing a plan, I want to select a day, replace an exercise, export the routine, ask a coach question, or recalibrate.
- As an active lifter, I want to log weight, reps, RPE, rest, and completion by set.

---

## 3. User Flow

### Happy Path

1. User opens `/onboarding` or selects **Create your routine**.
2. User selects a primary goal and experience level.
3. User selects 2-6 training days, 30-90 minutes per session, and a split preference.
4. User selects a training environment and available equipment.
5. User selects priority muscle groups and limitations from the front/back body map.
6. User selects RIR, RPE, or technical-failure intensity; a rest preference; and optional custom notes.
7. User selects **Calibrate and generate**.
8. System shows staged analysis: profile and goals, MRV, equipment, safety filters, then microcycle synthesis.
9. System returns a generated routine and persists it for the user.
10. User reviews diagnostic tiles, selects a training day, reviews warm-up, exercises, cooldown, volume, and progression.
11. User selects **Start session**, logs sets in the active-workout player, and finishes the workout.
12. System persists the workout log and returns the user to the routine/dashboard.

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

**Export**

1. User opens **Export**.
2. User copies a plain-text plan, downloads JSON, or prints/saves as PDF.

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
| 1 | Goal and experience | `Step1Goal.tsx` | Goal cards and experience segmented control. |
| 2 | Frequency and split | `Step2Frequency.tsx` | 2-6 day options, duration, and split preference. |
| 3 | Equipment | `Step3Equipment.tsx` | Environment cards plus equipment checklist. |
| 4 | Body map | `Step4BodyMap.tsx` | Front/back anatomy map for priorities and limitations. |
| 5 | Calibration | `Step5Calibration.tsx` | Intensity, rest, custom notes, and generation action. |
| 6 | AI loading | `AiLoadingScreen.tsx` | Staged calibration messages and progress. |
| 7 | Routine dashboard | `RoutineDashboard.tsx` | Plan diagnostics, day selection, prescriptions, and volume. |
| 8 | Exercise replacement | `ExerciseSwapModal.tsx` | Catalog alternatives and AI alternative request. |
| 9 | Export | `ExportModal.tsx` | Copy, JSON download, and print/PDF actions. |
| 10 | Coach drawer | `AiCoachDrawer.tsx` | Contextual coach conversation and quick questions. |
| 11 | Active workout | `ActiveWorkoutPlayer.tsx` | Set logging, rest timer, plate calculator, and completion. |

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
- Mobile (`<768px`): single-column wizard, horizontal scroll for dense controls, modal/sheet replacement and export views, primary actions in the lower thumb zone.
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
    goals: [{ type: 'hypertrophy', priority: 'primary' }],
    injuryHistory: [{ area: 'knee', severity: 'moderate', restrictedPatterns: ['squat'] }],
    daysPerWeek: 4,
    sessionDuration: 60,
    equipment: ['barbell', 'dumbbells', 'cables'],
    completedAt: '2026-09-04T12:00:00.000Z'
  },
  calibration: {
    targetMuscles: ['chest', 'back'],
    splitPreference: 'upper_lower',
    intensityMethod: 'rir',
    restPreference: 'moderate',
    customNotes: 'Prioritize lateral deltoids'
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

**Current status:** `app/api/routines/generate/route.ts` returns `501`. The existing `generateWorkoutPlan` service calls Claude 3.5 Sonnet with `WorkoutPlanSchema`; route validation, authorization, safety checks, and persistence remain to be implemented.

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
- New fields needed: target muscles, split preference, intensity method, rest preference, and custom notes should be modeled in `onboarding` or an explicitly typed profile shape.

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

- Rule: accept 2-6 days per week, matching the prototype and wireframe.
- Error: `Choose between 2 and 6 training days per week.`

**Session duration**

- Rule: allow 30, 45, 60, 75, or 90 minutes; prescribed exercise count must fit the selected duration.
- Error: `Choose an available session duration.`

**Equipment**

- Rule: at least one environment/equipment option is required; every selected exercise must be compatible.
- Error: `Select the equipment available to you.`

**Limitations and injuries**

- Rule: map each reported limitation to internal restricted movement patterns and veto them completely.
- Error: `Tell us the severity for each selected injury area.`

**Custom notes**

- Rule: optional, but must not override a hard safety constraint.
- Error: unsafe instruction is ignored and described in the rationale.

### Calculations & Algorithms

**Split selection**

- 2 days: Full Body A/B.
- 3 days: Full Body when selected; otherwise an explicitly justified alternative. The current prototype uses PPL by default, but production must avoid the 3-day PPL recovery/frequency conflict unless the user knowingly retains it.
- 4 days: Upper/Lower.
- 5 days: PPL plus Upper/Lower.
- 6 days: Push/Pull/Legs twice weekly.

**Volume**

| Experience | Weekly sets per muscle group |
|---|---|
| Beginner | 10-12 |
| Intermediate | 12-18 |
| Advanced | 16-22 |

- Priority muscles may receive additional volume only while staying within the hard cap.
- The prototype adds one exercise and one set for target muscles; production must calculate total sets rather than rely on a multiplier.

**Intensity and rest**

- RIR: default target of RIR 1-2 for hypertrophy work.
- RPE: intermediate target RPE 7.5-8.5; advanced target RPE 8.5-9.5.
- Technical failure: only permit under explicit, safety-reviewed criteria; it is not a default for every last exercise.
- Rest: short 60 seconds, moderate uses each exercise default, strength 180 seconds.

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

- Model: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`).
- Function: `generateWorkoutPlan` in `lib/ai/service.ts`.
- Prompt builder: `buildRoutineBuilderPrompt` in `lib/ai/prompts.ts`.
- Validation: `WorkoutPlanSchema` through `generateObject` in `lib/ai/schemas.ts`.
- Why: routine creation requires safety-sensitive reasoning across injuries, equipment, volume, recovery, and periodization.

### Prompt Requirements

The request must include user experience, goals, injury history and restrictions, frequency, session duration, equipment, muscle priorities, selected split, intensity method, rest preference, and custom notes. It must direct the model to return only the typed plan structure, a programming rationale, weekly volume distribution, and explicit injury considerations.

### Response Format (Zod Schema)

```typescript
const WorkoutPlanSchema = z.object({
  name: z.string(),
  durationWeeks: z.number().min(4).max(16),
  microcycles: z.array(z.object({
    weekNumber: z.number(),
    focus: z.string(),
    sessions: z.array(/* typed serializable session schema */)
  })),
  volumeProfile: z.object({
    weeklyVolume: z.number(),
    volumeDistribution: z.record(z.string(), z.number()),
    progressionStrategy: z.enum(['linear', 'undulating', 'block'])
  }),
  aiRationale: z.string()
});
```

`z.any()` currently validates sessions in the existing schema and must be replaced with a strict serializable session/exercise schema before persistence.

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
| `OnboardingWizard` | `components/onboarding/OnboardingWizard.tsx` | Five-step builder state and validation. |
| `GoalExperienceStep` | `components/onboarding/goal-experience-step.tsx` | Goal cards and experience selection. |
| `ScheduleSplitStep` | `components/onboarding/schedule-split-step.tsx` | Frequency, duration, and soft split preference. |
| `EquipmentStep` | `components/onboarding/equipment-step.tsx` | Environment and equipment selections. |
| `BodyMapStep` | `components/onboarding/body-map-step.tsx` | Priorities, injuries, severity, and notes. |
| `CalibrationStep` | `components/onboarding/calibration-step.tsx` | Intensity, rest, and custom constraints. |
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
- CTA: edit equipment, limitations, or custom notes; never silently use the unfiltered catalog.

### Loading States

**Routine generation**

- UI: full-screen, staged progress.
- Expected duration: 5-20 seconds; timeout threshold: 30 seconds.
- Messages: profile analysis, volume calculation, equipment alignment, limitation filtering, microcycle synthesis.

### Data Limits

- Training days: 2-6.
- Duration choices: 30, 45, 60, 75, 90 minutes.
- Goals: one primary goal in the source prototype; Gym AI types support primary and secondary goals.
- No max saved-routine limit is defined.

---

## 12. Acceptance Criteria

### Functional Requirements

- [ ] User can complete the five-step builder and generate a plan.
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
- [ ] User skips optional custom notes.
- [ ] Provider failure.
- [ ] Failed plan or workout persistence.

---

## 13. Testing Checklist

### Manual Testing

- [ ] Complete the builder for every experience level.
- [ ] Generate routines at 2, 3, 4, 5, and 6 days and validate split/recovery behavior.
- [ ] Verify all session-duration choices stay within exercise-count constraints.
- [ ] Test each equipment environment and custom equipment selection.
- [ ] Test knee, shoulder, lumbar, wrist, and elbow restrictions; verify prohibited patterns never appear.
- [ ] Test a priority muscle and verify extra volume remains below its cap.
- [ ] Test RIR, RPE, and technical-failure selections.
- [ ] Exercise plan day selection, replacement, export, and coach-drawer states.
- [ ] Log, complete, and retry persistence for a workout at mobile and desktop widths.
- [ ] Simulate slow, failed, malformed, and unsafe AI outputs.

### Test Data

```json
{
  "goals": [{ "type": "hypertrophy", "priority": "primary" }],
  "injuryHistory": [{ "area": "knee", "severity": "moderate", "restrictedPatterns": ["squat"] }],
  "daysPerWeek": 4,
  "sessionDuration": 60,
  "equipment": ["dumbbells", "cables"],
  "targetMuscles": ["chest", "back"],
  "intensityMethod": "rir",
  "restPreference": "moderate"
}
```

Expected: an 8-12 week plan that uses a recovery-aware four-day split, avoids squat-pattern work, includes a rationale, and remains at or below intermediate weekly volume caps.

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
- [ ] Add a typed request and serializable session schema.
- [ ] Build deterministic safety validators.
- [ ] Implement workout-plan and planned-session persistence.
- [ ] Map body-map limitations to the canonical injury/restricted-pattern model.

---

## 15. Implementation Notes

### Development Approach

1. Align prototype wizard inputs with `OnboardingData` and `UserProfile` in `types/index.ts`.
2. Create strict request/output schemas and deterministic post-generation validators.
3. Implement protected generation and persistence routes.
4. Build the five wizard steps and real asynchronous progress state.
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

- [ ] Should `strength` become a selectable goal in the UI, since Gym AI types support it but the prototype does not?
- [ ] Which profile fields store target muscles, split preference, intensity method, rest preference, and custom notes?
- [ ] What canonical mapping translates each body-map limitation to `restrictedPatterns`?
- [ ] Should plans create planned sessions immediately or only after explicit user acceptance?
- [ ] How should an approved `arnold` split be reconciled with recovery and volume constraints?
- [ ] Are export and coach chat part of the MVP, or should they be independently specified?
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
| Specification complete | 2026-09-04 | Done |
| Schema and safety validators | TBD | Not started |
| Generation API | TBD | Not started |
| Wizard UI | TBD | Not started |
| Dashboard and session integration | TBD | Not started |
| Manual QA | TBD | Not started |
| Launch | TBD | Not started |

---

## 19. Feedback & Iteration

### Design Review Notes

- The Kinetic prototype is Spanish-first, desktop-responsive, and uses a dark precision-training visual system.
- Its core routine flow is a five-step calibration wizard followed by a detailed routine dashboard and workout player.

### Development Feedback

- The prototype is local-first: plan and history are saved in `localStorage`.
- Generation is deterministic and based on a local exercise catalog despite simulated AI loading.
- Its catalog fallback, volume calculation, and limitation model cannot be used unchanged because Gym AI requires hard training-safety constraints.
- Gym AI already has the Claude generation service, but its route and persistence layer remain incomplete.

### User Testing Feedback

- Pending.

### Changes Made

| Date | Change | Reason |
|---|---|---|
| 2026-09-04 | Created this specification from the attached Kinetic Routine Wizard source. | Translate prototype behavior into an implementation-ready Gym AI feature contract. |

---

**Last Updated:** 2026-09-04  
**Feature Owner:** Gym AI product team  
**Status:** Development