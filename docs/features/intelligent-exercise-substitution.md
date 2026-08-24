# Intelligent Exercise Substitution - Specification

> Living feature specification for replacing an exercise during an active workout while preserving the intended training stimulus. This document follows `docs/FEATURE_DEVELOPMENT_GUIDE.md` and the safety constraints in `docs/DOMAIN-RULES.md`.

## Feature Metadata

| Field | Value |
|---|---|
| Feature Name | Intelligent Exercise Substitution |
| Feature Owner | Gym AI product team |
| Priority | High |
| Estimated Effort | 3 development days for MVP; 2 additional days for persistence and QA |
| Dependencies | Active session, exercise taxonomy, user profile, AI service, authentication, Supabase exercise data |
| Status | Development |
| Primary Route | `/session` |
| API Route | `POST /api/ai/substitute` |

## 1. Overview

### What This Feature Does

During an active workout, the user can replace an exercise when equipment is unavailable, the training location changes, or discomfort appears. Gym AI returns one to three ranked alternatives that preserve the movement pattern and target muscles, recalculates the prescription, and explains the decision so the user can continue without rebuilding the day's routine.

### User Problem Solved

Users often stop or improvise when a rack is occupied, equipment is missing, or an exercise becomes uncomfortable. Improvised replacements can change the movement pattern, overload an injured area, or break the progression planned for the training cycle. This feature gives the user a fast, explainable and safety-aware choice at the moment the obstacle occurs.

### Goals

- Preserve the planned stimulus at the micro-adjustment level.
- Keep the replacement inside the original movement pattern whenever possible.
- Respect current equipment, space and injury restrictions.
- Translate load and repetitions instead of copying the original prescription.
- Keep the user in control through explicit confirmation and an undo path.

### Non-Goals

- Rebuilding the entire session, routine or macrocycle.
- Reordering or adding exercises manually.
- Diagnosing pain or replacing professional medical advice.
- Supporting multi-set voice parsing in the MVP.

### Success Metrics

- [ ] At least 90% of valid substitution requests return one or more displayable suggestions.
- [ ] 100% of displayed suggestions have a confidence score of at least `0.5` and match the original movement pattern unless an injury restriction justifies an exception.
- [ ] 100% of confirmed replacements preserve `sets`, target `rir`, and `substitutedFrom`.
- [ ] Median suggestion response time is below 8 seconds; timeout threshold is 30 seconds.
- [ ] Users can complete the substitution flow in three or fewer primary actions after opening the panel.

## 2. User Stories

### Primary User Story

> As a lifter in an active session, I want to replace an unavailable or uncomfortable exercise with a biomechanically equivalent option so that I can keep training the planned muscles without disrupting my progression.

### Additional User Stories

- As a lifter whose rack is occupied, I want a dumbbell alternative so that I can continue training the same movement pattern.
- As a lifter who feels pain or discomfort, I want alternatives that respect my recorded injuries so that I do not aggravate a restricted area.
- As a beginner, I want an explicit weight, rep range and RIR target so that I know exactly how to perform the replacement.
- As a lifter training at home, I want suggestions limited to my available equipment and space.
- As a time-constrained lifter, I want the replacement to happen inside the current session so that I do not need to rebuild today's workout.
- As a user who does not trust an option, I want to cancel or undo a substitution so that I retain control of my plan.
- As a user with sharp or worsening pain, I want the app to advise me to stop rather than treating the symptom as a normal equipment substitution.

## 3. User Flow

### Happy Path

1. User opens `/session` and selects the current exercise.
2. System displays the exercise name, target sets, reps, load, rest and RIR.
3. User selects **Substitute with AI**.
4. System opens the substitution panel with the reason chips: **Equipment busy**, **Pain today**, **Don't like it**, and **Other**.
5. User selects a chip and optionally enters free text such as `The rack is occupied; I only have free dumbbells`.
6. System validates the exercise context, reason, prescription and user context before sending the request.
7. System calls `POST /api/ai/substitute` and displays a loading state while the AI evaluates movement pattern, muscles, equipment, injuries and recent effort.
8. Server validates the structured AI response and removes suggestions below `0.5` confidence or with an invalid movement pattern.
9. User sees up to three ranked cards with match label, rationale, translated load, rep target, preserved RIR, and a technical equivalence explanation.
10. User opens an option detail if needed, reviews the before/after load calculation, chooses the scope, and selects **Confirm substitution**.
11. System updates the active session with the selected exercise, adjusted prescription and `substitutedFrom` equal to the original exercise ID.
12. System shows an **Updated** confirmation and a five-second undo action, then returns the user to the current exercise.

### Alternative Flows

**User selects a quick reason without free text**

1. The selected category is sent as structured context.
2. The server uses the category to constrain equipment, pain and space interpretation.

**User reports pain or discomfort**

1. If the text indicates sharp, acute, worsening or radiating pain, the system shows a stop-and-assess message.
2. The system does not present the result as medical clearance.
3. User can return to the session or choose a low-risk alternative only after acknowledging the warning.

**User requests a replacement from routine preview**

1. The same panel opens with routine prescription data.
2. Confirmation updates the routine exercise for the selected scope; active-session persistence is not required for this entry point in the MVP.

**User selects “Show weaker matches”**

1. Suggestions below `0.5` remain hidden by default.
2. The user must explicitly expand the warning state.
3. Each weaker match is labeled as questionable and cannot be confirmed without a warning acknowledgement.

### Error Flows

**Invalid request**

1. API returns `400 VALIDATION_ERROR`.
2. Client keeps the panel open, displays the exact corrective message, and preserves entered text.

**AI unavailable or timed out**

1. API returns `502 AI_SUBSTITUTION_FAILED`.
2. Client offers retry and a rule-based fallback filtered by movement pattern and available equipment.

**No valid alternatives**

1. Client displays `No encontramos una alternativa segura para este ejercicio.`
2. User can skip the exercise or return to the active session.

**Duplicate submission**

1. Submit control becomes disabled immediately.
2. A second request is not sent while the first is pending.

## 4. Screens & Design

### Screen List

| # | Screen/state | Reference | Description |
|---|---|---|---|
| 1 | Active session | `app/session/page.tsx` | Current exercise, prescription, progress and substitution entry point. |
| 2 | Reason input | `components/session/exercise-substitution.tsx` | Quick reason chips, free-text input, cancel and submit controls. |
| 3 | Loading suggestions | `components/session/exercise-substitution.tsx` | Disabled form, progress indicator and non-blocking AI status message. |
| 4 | Ranked suggestions | `components/session/exercise-substitution.tsx` | One to three recommendation cards with match, rationale, load, reps and RIR. |
| 5 | Option detail | `components/session/exercise-substitution.tsx` | Expanded equivalence explanation, before/after load calculation and scope toggle. |
| 6 | No match / fallback | `components/session/exercise-substitution.tsx` | Rule-based same-pattern alternatives, retry and skip actions. |
| 7 | Updated session | `components/session/exercise-substitution.tsx` | Confirmation state, persistent `Substituted from` label and five-second undo. |
| 8 | Pain safety warning | `components/session/exercise-substitution.tsx` | Stop-and-assess message for sharp or worsening symptoms. |

### Component States

**Substitution trigger**

- Default: enabled for an active exercise.
- Hover: stronger contrast and clear label.
- Focus: visible two-pixel focus ring and keyboard activation.
- Loading: disabled while a request is being submitted.
- Disabled: unavailable when no exercise is selected or the session is completed.

**Reason chips**

- Default: unselected category.
- Selected: high-contrast selected state and included in request.
- Disabled: unavailable while loading or after confirmation.

**Free-text input**

- Default: optional placeholder describing equipment, pain or location.
- Error: inline message when the final reason is shorter than three characters.
- Disabled: disabled during request.

**Recommendation card**

- Default: ranked card with explicit confirm action.
- Hover/focus: raised border and visible focus ring.
- Loading: skeleton cards while response is pending.
- Success: selected card becomes confirmed and session context updates.
- Error: failed response is replaced by retry/fallback state.
- Disabled: card actions disabled during confirmation.

### Responsive Behavior

- Desktop (`1024px+`): two-column session shell; exercise overview on the left and detail/substitution panel on the right.
- Tablet (`768px-1023px`): compressed two-column layout when space permits; otherwise detail panel becomes a full-width sheet.
- Mobile (`<768px`): one exercise focus view; substitution panel is a bottom sheet or full-screen modal, with primary actions in the bottom thumb zone.
- All tap targets are at least `48px`; long rationales wrap without changing card width or overlapping controls.
- Keyboard users can reach chips, text input, suggestion cards, confirm, cancel and undo in logical order.

## 5. API Endpoints

### Endpoint 1: Generate Substitution Suggestions

**Method:** `POST`  
**Route:** `/api/ai/substitute`  
**Purpose:** Generate and validate up to three biomechanically compatible alternatives for the current exercise.

**Request headers:**

```http
Content-Type: application/json
Authorization: Bearer <user-session-token>
```

**Request body:**

```json
{
  "originalExercise": {
    "id": "bench-barbell",
    "name": "Barbell Bench Press",
    "muscleGroup": "chest",
    "synergistMuscles": ["triceps", "anterior deltoid"],
    "movementPattern": "push_horizontal",
    "equipment": ["barbell", "bench"],
    "resistanceProfile": "ascending"
  },
  "exerciseId": "bench-barbell",
  "reason": "The rack is occupied; I only have free dumbbells",
  "reasonCategory": "equipment_occupied",
  "currentWeight": 80,
  "currentReps": 8,
  "currentRir": 2,
  "voiceInput": false
}
```

**Field rules:**

| Field | Rule |
|---|---|
| `originalExercise` | Required; must include ID, name, muscle group, movement pattern and at least one equipment item. |
| `exerciseId` | Required non-empty string; must identify the current exercise. |
| `reason` | Required trimmed string with at least 3 characters. |
| `reasonCategory` | Optional enum: `equipment_occupied`, `pain_discomfort`, `lack_space`, `home_workout`, `preference`, `other`. |
| `currentWeight` | Required number greater than or equal to 0. |
| `currentReps` | Required integer from 1 to 100. |
| `currentRir` | Required integer from 0 to 4. |
| `voiceInput` | Optional boolean. |

**Response (success - 200):**

```json
{
  "success": true,
  "data": {
    "originalExercise": {
      "id": "bench-barbell",
      "name": "Barbell Bench Press",
      "muscleGroup": "chest",
      "movementPattern": "push_horizontal",
      "equipment": ["barbell", "bench"]
    },
    "suggestions": [
      {
        "exercise": {
          "id": "bench-dumbbell",
          "name": "Dumbbell Bench Press",
          "muscleGroup": "chest",
          "movementPattern": "push_horizontal",
          "equipment": ["dumbbells", "bench"]
        },
        "justification": "The dumbbell press keeps the horizontal push pattern and trains the chest with the equipment available.",
        "adjustedWeight": 30,
        "adjustedReps": 8,
        "confidenceScore": 0.94,
        "biomechanicalEquivalence": "Same horizontal pressing pattern and primary chest emphasis; load is reduced for unilateral stability and range-of-motion demands."
      }
    ],
    "processingTime": 1840
  }
}
```

**Response errors:**

| Status | Code | Response and meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `{ "error": "Cuéntanos qué cambió para encontrar una alternativa segura.", "code": "VALIDATION_ERROR" }` for malformed or incomplete input. |
| 401 | `UNAUTHORIZED` | `{ "error": "Inicia sesión para sustituir un ejercicio.", "code": "UNAUTHORIZED" }` when authentication is enforced. |
| 404 | `EXERCISE_NOT_FOUND` | `{ "error": "No pudimos identificar el ejercicio actual.", "code": "EXERCISE_NOT_FOUND" }` when the exercise is not available to the user. |
| 422 | `NO_VALID_SUBSTITUTIONS` | `{ "error": "No encontramos una alternativa segura para este ejercicio.", "code": "NO_VALID_SUBSTITUTIONS" }` when all suggestions fail safety filters. |
| 429 | `RATE_LIMITED` | `{ "error": "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.", "code": "RATE_LIMITED" }`. |
| 502 | `AI_SUBSTITUTION_FAILED` | `{ "error": "No pudimos encontrar alternativas ahora. Inténtalo de nuevo.", "code": "AI_SUBSTITUTION_FAILED" }` for provider, timeout or configuration failures. |

**MVP implementation note:** the current route validates the request and returns `400` or `502`; authentication, database lookup, `404`, `422` and `429` handling must be added before production persistence.

## 6. Database

### Tables Used

**Table: `exercises`**

- Operations: Read.
- Columns: `id`, `name`, `muscle_group`, `synergist_muscles`, `movement_pattern`, `equipment`, `resistance_profile`, `biomechanical_tags`, `embedding`.
- New columns: None.
- Purpose: validate and rank candidate exercises.

**Table: `user_profiles`**

- Operations: Read.
- Columns: `id`, `experience_level`, `bodyweight`, `units`, `injury_history`, `equipment`.
- New columns: None.
- Purpose: apply injury, experience, bodyweight and equipment constraints.

**Table: `workout_sessions`**

- Operations: Read and update.
- Columns: `id`, `user_id`, `status`, `updated_at`.
- New columns: None.
- Purpose: ensure the selected session is active and belongs to the user.

**Table: `session_exercises`**

- Operations: Read and update.
- Columns: `id`, `session_id`, `exercise_id`, `sets`, `reps`, `weight`, `rir`, `rest_seconds`, `completed`, `substituted_from`, `notes`.
- New columns: None; `substituted_from` already represents the original exercise ID.
- Purpose: persist the confirmed replacement and adjusted prescription.

### Queries Needed

- `getActiveSession(userId)` - fetch the single active session; enforce the one-active-session invariant.
- `getSessionExercise(sessionId, sessionExerciseId)` - fetch the current prescription and original exercise.
- `getUserProfile(userId)` - fetch injuries, experience, bodyweight, units and equipment.
- `findCompatibleExercises(filters)` - filter by movement pattern, muscle overlap, equipment and injury restrictions; use cosine similarity when embeddings are available.

### Mutations Needed

- `substituteSessionExercise(sessionId, sessionExerciseId, update)` - atomically update `exercise_id`, adjusted `weight`, adjusted `reps`, preserve `sets` and `rir`, and write `substituted_from`.
- `undoSubstitution(sessionId, sessionExerciseId)` - restore the original exercise and prescription within the five-second undo window.
- `recordSubstitutionEvent(...)` - optional audit/event record for analytics; not required for the MVP schema.

### Persistence Rules

- The update must verify `workout_sessions.status = 'active'` and the current user owns the session.
- The mutation must be atomic so a selected exercise cannot be saved without its translated prescription.
- “Just today” updates the active `session_exercises` row. “All future sessions” requires a separate routine-level mutation and is out of MVP scope unless explicitly enabled.

## 7. Business Logic

### Validation Rules

**Movement pattern**

- Rule: candidate pattern must equal the original pattern unless that pattern is explicitly restricted by an injury.
- Error: `No encontramos una alternativa segura para este patrón de movimiento.`

**Muscle overlap**

- Rule: primary muscle plus synergists must overlap by at least 80% for a normal recommendation.
- Error: candidate is filtered out; no user-facing error unless no candidates remain.

**Equipment and space**

- Rule: candidate may use only equipment available in the live request, profile or location context.
- Error: `Esta alternativa necesita equipo que no tienes disponible ahora.`

**Confidence**

- Rule: suggestions below `0.5` are hidden by default and never appear as normal recommendations.
- Error: `No encontramos una alternativa con suficiente equivalencia.`

**Pain**

- Rule: sharp, acute, worsening or radiating pain triggers stop-and-assess guidance; the AI result is not medical advice.
- Error: `Detén el ejercicio si el dolor es agudo o empeora. Si persiste, consulta a un profesional de salud.`

### Load Translation

The system preserves stimulus, not the numeric load. Every recommendation must include the arithmetic used:

```text
Barbell bench 80 kg -> dumbbell bench
80 / 2 = 40 kg per hand
ROM/stability adjustment: 40 x 0.85 = 34 kg per hand
Round to available increment: 32.5 or 35 kg per hand
```

Additional rules:

- Free weight to machine: increase by 10-20% only when the resistance and stability profile justify it.
- Pull-up to lat pulldown: use 70-75% of bodyweight as the starting estimate.
- Unilateral alternatives must not copy the full bilateral load to one side.
- If load cannot be translated reliably, prescribe a conservative starting load and require RIR 2 confirmation.

### Repetitions, Sets and RIR

- Preserve the number of sets and target RIR.
- Preserve the original reps when the resistance profile is equivalent.
- Use a bounded rep range, normally `original reps - 2` to `original reps + 2`, when the alternative has a meaningfully different resistance profile.
- Never silently increase weekly volume or exceed the user's experience-based hard cap.
- Suggested progression remains consistent with the domain rule: when recent RIR is `0-2`, add `2.5 kg` upper body or `5 kg` lower body, or add one rep at the same load.

### Ranking

Rank candidates in this order:

1. Movement pattern match.
2. Injury and pain safety.
3. Equipment availability.
4. Primary and synergist muscle overlap.
5. User experience and familiarity.
6. Load translation confidence and semantic similarity.

## 8. AI Integration

### AI Service Used

- Model: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`).
- Function: `generateExerciseSubstitution` in `lib/ai/service.ts`.
- Why: this is a safety-sensitive, biomechanical reasoning task where exact movement-pattern and injury interpretation matter more than minimum latency.
- Validation: `SubstitutionResponseSchema` in `lib/ai/schemas.ts`.

### Prompt Requirements

The prompt must follow `Context -> Task -> Constraints -> Output Format` and include:

```typescript
{
  originalExercise: Exercise,
  liveRestriction: {
    category: string | undefined,
    freeText: string
  },
  prescription: {
    weight: number,
    reps: number,
    rir: number
  },
  userProfile: {
    experienceLevel: string,
    bodyweight: number,
    injuryHistory: Injury[],
    equipment: string[]
  },
  trainingScience: {
    movementPatterns: MovementPattern[],
    minimumConfidence: 0.5,
    muscleOverlapTarget: 0.8,
    loadTranslationRules: string
  }
}
```

The prompt must explicitly instruct the model to:

- Return one to three ranked options.
- Keep the movement pattern identical unless an injury restriction requires a safe exception.
- Never recommend a flagged injured area or unavailable equipment.
- Include a user-facing `justification`, technical `biomechanicalEquivalence`, adjusted load, adjusted reps and confidence score.
- Return structured output only; no raw prose outside the schema.

### Response Format

`SubstitutionResponseSchema` requires one to three suggestions. Each suggestion requires:

- `exercise.name`, `muscleGroup`, `movementPattern`, `equipment`.
- `justification`.
- `adjustedWeight` and `adjustedReps`.
- `confidenceScore` from `0` to `1`.
- `biomechanicalEquivalence`.

The server then filters confidence below `0.5` and pattern mismatches before returning data to the client. The server must eventually validate candidate exercise IDs against the database rather than assigning generated IDs to AI-only exercise objects.

### Fallback Behavior

- Missing API key, timeout or provider error: return a recoverable API error and show a same-pattern rule-based list.
- Rule-based fallback: filter by movement pattern, available equipment and injury restrictions; do not use semantic ranking when embeddings are unavailable.
- No fallback candidate: offer skip and return-to-session actions.
- Never expose raw model output or stack traces to the user.

## 9. Components

### Existing Components to Reuse

- `components/session/exercise-substitution.tsx` - current interactive substitution panel.
- `components/shared/Button.tsx` - primary, secondary, loading and disabled actions.
- `components/shared/Card.tsx` - exercise and recommendation framing.
- `components/shared/Alert.tsx` - pain, validation and no-match messages.
- `components/shared/Modal.tsx` - desktop modal and mobile full-screen sheet behavior.
- `components/shared/StatusChip.tsx` - reason and confidence/match states.

### New Components to Create or Extract

**Component: `SubstitutionReasonPicker`**

- Location: `components/session/substitution-reason-picker.tsx`.
- Purpose: render reason chips and free-text context with accessible selection.
- Props: `value`, `onChange`, `freeText`, `onFreeTextChange`, `disabled`, `error`.
- State: selected category, text value and validation message.

**Component: `SubstitutionSuggestionCard`**

- Location: `components/session/substitution-suggestion-card.tsx`.
- Purpose: display a ranked alternative and make the load translation the primary scan target.
- Props: `suggestion`, `originalPrescription`, `onSelect`, `disabled`.
- State: collapsed/expanded detail and confirmation pending.

**Component: `SubstitutionResult`**

- Location: `components/session/substitution-result.tsx`.
- Purpose: render loading, success, no-match, fallback and error states consistently.
- Props: `status`, `suggestions`, `error`, `onRetry`, `onSelect`, `onCancel`.

**Component: `SubstitutionConfirmation`**

- Location: `components/session/substitution-confirmation.tsx`.
- Purpose: show updated exercise, preserved RIR, `substitutedFrom` and undo action.
- Props: `originalExercise`, `replacement`, `onUndo`, `onDone`.

### Component State Contract

```typescript
type SubstitutionStatus =
  | 'input'
  | 'loading'
  | 'success'
  | 'fallback'
  | 'error'
  | 'confirmed'
  | 'pain_warning';
```

## 10. Error Handling

| Scenario | When | User experience | Recovery |
|---|---|---|---|
| Empty reason | Trimmed reason is shorter than 3 characters | Inline validation below input | Select a reason or add context. |
| Missing exercise | Current session has no valid exercise context | Panel cannot submit; show identification message | Return to session and reload the exercise. |
| Unauthorized | Session/auth token missing or expired | Sign-in message | Re-authenticate, then retry. |
| Network failure | Request cannot reach API | Retry plus fallback option | Retry or use pattern-filtered fallback. |
| AI timeout/provider failure | AI does not return a valid response | Explain that alternatives are temporarily unavailable | Retry; do not lose the active session. |
| Invalid AI output | Schema or safety filter rejects response | No raw output shown; no-match state | Retry with same input or skip. |
| Pain warning | Text indicates acute/worsening pain | Stop-and-assess alert | Stop exercise, return to session or seek professional advice. |
| Persistence failure | Confirmation cannot save | Keep selected card and show save error | Retry save; do not show the change as persisted. |
| Rate limited | Too many requests | Wait message and disabled retry timer | Retry after the server-provided delay. |

### Exact User Messages

```typescript
const ERROR_MESSAGES = {
  EMPTY_REASON: 'Cuéntanos qué cambió para encontrar una alternativa segura.',
  MISSING_EXERCISE: 'No pudimos identificar el ejercicio actual.',
  NO_MATCH: 'No encontramos una alternativa segura para este ejercicio.',
  AI_FAILED: 'No pudimos encontrar alternativas ahora. Inténtalo de nuevo.',
  PAIN_WARNING: 'Detén el ejercicio si el dolor es agudo o empeora. Si persiste, consulta a un profesional de salud.',
  SAVE_FAILED: 'No pudimos guardar el cambio. Tu ejercicio original sigue intacto.',
};
```

## 11. Edge Cases

### Empty and First-Use States

- No active session: route to Today/session start; do not render a substitution panel.
- No reason selected: keep submit disabled until text or a category is provided.
- No user history: use profile data and conservative translation; do not imply personal calibration.
- No bodyweight for bodyweight conversion: do not convert pull-ups to a numeric load; prescribe effort/RIR instead.
- No available equipment: offer skip rather than an unsafe cross-pattern replacement.

### Loading and Offline States

- Loading UI: stable skeleton cards, disabled submit, and status text such as `Analizando alternativas seguras...`.
- Expected duration: 2-5 seconds; show retry after 30 seconds.
- Offline: detect failed request, preserve the form, and show the local same-pattern fallback.
- Browser back/close: warn only if a confirmation is pending; never discard a persisted substitution.

### Data Limits

- Maximum displayed recommendations: 3.
- Minimum normal confidence: `0.5`.
- Maximum reason length: 500 characters; truncate only at input boundary with an accessible counter.
- One active substitution request per exercise at a time.
- One undo window: 5 seconds after confirmation.

## 12. Acceptance Criteria

### Functional Requirements

- [ ] User can open substitution from an active exercise.
- [ ] User can select a reason chip or enter free text.
- [ ] API validates all required request fields and returns documented error codes.
- [ ] Suggestions show exercise, match quality, rationale, translated load, reps, and preserved RIR.
- [ ] Server rejects malformed AI output, confidence below `0.5`, and invalid movement-pattern changes.
- [ ] Confirming a suggestion updates the current session and stores the original ID in `substitutedFrom`.
- [ ] Sets, target RIR and session progression remain unchanged after confirmation.
- [ ] User can cancel before confirmation and undo immediately after confirmation.
- [ ] Pain warnings prevent the normal flow for acute or worsening pain language.
- [ ] AI failure has retry and same-pattern fallback behavior.

### Non-Functional Requirements

- [ ] Responsive at 390x844, tablet and desktop widths.
- [ ] Keyboard navigation and visible focus states work for every interactive control.
- [ ] Screen-reader labels identify reason chips, recommendation rank, load units and confirmation actions.
- [ ] No console errors in the substitution flow.
- [ ] No raw AI response, API key or server stack trace reaches the client.
- [ ] AI request completes within 30 seconds or transitions to a recoverable error state.

### Domain Invariants

- [ ] No pattern crossing unless the original pattern is injury-restricted and the exception is justified.
- [ ] No exercise targets an injury-restricted area.
- [ ] No recommendation requires unavailable equipment.
- [ ] Every load change is recalculated and explained.
- [ ] Weekly per-muscle volume remains within the experience-level hard cap.
- [ ] `substitutedFrom` is preserved for every confirmed swap.

## 13. Testing Checklist

### Manual Testing

- [ ] Happy path: barbell bench, occupied rack, dumbbells available; confirm 4x8 with translated dumbbell load.
- [ ] Equipment chip only; verify the request can be submitted without free text.
- [ ] Other reason with Spanish text: `No hay racks disponibles, solo mancuernas.`
- [ ] Pain text: `siento un pinchazo fuerte en el hombro`; verify stop-and-assess state.
- [ ] Empty and two-character reason; verify inline validation and no request.
- [ ] Slow network and 30-second timeout; verify retry and fallback.
- [ ] AI returns cross-pattern candidate; verify server filters it.
- [ ] AI returns confidence below `0.5`; verify it is hidden or enters explicit weaker-match state.
- [ ] No valid alternatives; verify skip action.
- [ ] Confirm replacement; verify exercise, load, reps, RIR and `substitutedFrom`.
- [ ] Trigger undo within five seconds and after five seconds.
- [ ] Test mobile layout at 390x844 and desktop layout at 1440px.
- [ ] Test keyboard navigation and screen reader labels.

### API/Test Data

**Sample input:**

```json
{
  "originalExercise": {
    "id": "bench-barbell",
    "name": "Barbell Bench Press",
    "muscleGroup": "chest",
    "synergistMuscles": ["triceps", "anterior deltoid"],
    "movementPattern": "push_horizontal",
    "equipment": ["barbell", "bench"],
    "resistanceProfile": "ascending"
  },
  "exerciseId": "bench-barbell",
  "reason": "The rack is occupied; I only have free dumbbells",
  "reasonCategory": "equipment_occupied",
  "currentWeight": 80,
  "currentReps": 8,
  "currentRir": 2,
  "voiceInput": false
}
```

**Expected safety assertions:**

- At least one result and no more than three.
- Every normal result has confidence `>= 0.5`.
- Every result has `movementPattern = push_horizontal`.
- Adjusted load is not `80 kg` copied unchanged to each dumbbell.
- RIR remains `2` and the session keeps four sets.

## 14. Dependencies

### External Libraries

- `ai` - `generateObject` structured model output.
- `@ai-sdk/anthropic` - Anthropic provider for Claude 3.5 Sonnet.
- `zod` - request and AI response validation.
- Supabase client - exercise, profile and session persistence.

### Internal Dependencies

- `types/index.ts` - `Exercise`, `SessionExercise`, `SubstitutionRequest`, `SubstitutionSuggestion`, and `SubstitutionResponse`.
- `lib/ai/prompts.ts` - substitution prompt builder and system constraints.
- `lib/ai/schemas.ts` - Zod contracts.
- `lib/ai/service.ts` - AI orchestration and safety filtering.
- `lib/supabase/queries.ts` and `lib/supabase/mutations.ts` - future data access and persistence.
- Active session UI and authentication context.

### Blockers

- [ ] Confirm the authenticated user/session contract for API routes.
- [ ] Complete typed Supabase session queries and mutations.
- [ ] Provide candidate exercise IDs from the database instead of AI-generated IDs.
- [ ] Confirm final Stitch/Figma assets or approve the documented low-fi states.

## 15. Implementation Notes

### Development Approach

1. Finalize request/response schemas and error codes.
2. Validate the existing service prompt and server-side safety filters.
3. Implement the reason picker and suggestion state machine with mock response data.
4. Connect the API and add loading, error, fallback and pain-warning states.
5. Add atomic session mutation and `substitutedFrom` persistence.
6. Add explicit confirmation, scope handling and five-second undo.
7. Run lint/build checks and complete the manual browser checklist.

### Technical Decisions

**State management**

- Choice: local React state for the panel and active-session update in the MVP.
- Why: substitution is scoped to one exercise and does not need global state.
- Future: move the confirmed mutation behind the session hook when persistence is available.

**AI output**

- Choice: structured `generateObject` output validated with Zod.
- Why: free-form model text is unsafe for load and movement decisions.
- Alternative rejected: parsing prose with regular expressions.

**Fallback**

- Choice: same-pattern rule-based list.
- Why: it preserves the core safety invariant when network or AI services are unavailable.
- Alternative rejected: showing arbitrary popular exercises.

**Scope**

- Choice: “Just today” is the MVP default.
- Why: it limits accidental macrocycle changes during a live session.
- Future: support “All future sessions” through an explicit routine-level mutation.

### Performance Considerations

- Keep the payload limited to the current exercise, relevant profile fields and live restriction.
- Cache the user's exercise/profile context for the duration of the session.
- Use embeddings for candidate retrieval only when the exercise database has vectors; safety filters remain deterministic.
- Disable duplicate submissions and cap AI response time at 30 seconds.

## 16. Open Questions

- [ ] Which authenticated user context is available inside `POST /api/ai/substitute`?
- [ ] Should the AI receive complete injury notes or only normalized restricted zones/patterns?
- [ ] What exact equipment vocabulary will be canonical in the seeded exercise database (`dumbbells` vs. `dumbbell`)?
- [ ] Should “All future sessions” be delivered in this feature or a later routine-editing feature?
- [ ] What is the approved rounding policy for available plates and dumbbell increments?
- [ ] Should weaker matches be viewable at all when confidence is below `0.5`, or only logged for analytics?
- [ ] Which medical/legal review is required for pain-warning copy before release?

## 17. Related Documents

- [Feature Development Guide](../FEATURE_DEVELOPMENT_GUIDE.md)
- [Domain Rules](../DOMAIN-RULES.md)
- [Wireframe Brief](../WIREFRAME-BRIEF.md), especially §3.3 active session and §3.4 substitution
- [Shared Components](../SHARED_COMPONENTS.md)
- [AI service](../../lib/ai/service.ts)
- [AI schemas](../../lib/ai/schemas.ts)
- [Substitution route](../../app/api/ai/substitute/route.ts)
- [Session substitution component](../../components/session/exercise-substitution.tsx)

## 18. Timeline & Milestones

| Milestone | Target | Status |
|---|---|---|
| Specification complete | 2026-08-23 | In progress |
| Design states approved | TBD | Pending |
| Request/response contract | 2026-08-23 | In development |
| AI service and safety filters | 2026-08-23 | In development |
| UI flow and responsive states | TBD | Pending |
| Session persistence | TBD | Pending Supabase query/mutation work |
| Manual browser testing | TBD | Pending |
| Launch | TBD | Pending |

## 19. Feedback & Iteration

### Design Review Notes

- The load translation is the primary information in a suggestion card, not a secondary technical detail.
- The default scope is “Just today” to protect the planned macrocycle.
- Pain is treated as a safety branch, not merely another equipment filter.
- The active-session layout follows the mobile-first 390x844 brief and keeps primary actions in the thumb zone.

### Development Feedback

- Current MVP code already contains the route, Zod request/response schemas, AI service function and substitution component.
- Current route does not yet authenticate the request or persist the confirmed replacement.
- Current service creates generated exercise IDs for AI-returned objects; production must resolve candidates against `exercises` and use canonical database IDs.

### User Testing Feedback

- No formal user testing has been completed yet.

### Changes Made

| Date | Change | Reason |
|---|---|---|
| 2026-08-23 | Expanded document to all feature-template sections | Make the feature implementation-ready and expose unresolved dependencies. |
| 2026-08-23 | Added safety, load-translation, fallback and persistence requirements | Align the feature with `DOMAIN-RULES.md` and the active-session wireframe. |

**Last Updated:** 2026-08-23  
**Feature Owner:** Gym AI product team  
**Status:** Development
