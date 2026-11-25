# Personalized Routine Builder — Implementation Plan

> Step-by-step plan for implementing the feature in
> [`personalized-routine-builder.md`](personalized-routine-builder.md), reconciled with
> [`TEAM-IMPLEMENTATION-PLAN.md`](../TEAM-IMPLEMENTATION-PLAN.md), `DOMAIN-RULES.md`, and
> `WIREFRAME-BRIEF.md`. Dev B owns the feature. Written 2026-11-25 from a read of the repo;
> Implementation has started; the complete feature and browser verification remain pending.

---

## 1. Where we are today

| Area | State | Gap |
|---|---|---|
| `/onboarding` | Unsaved, bilingual preview of goal, experience, availability, and split | Full nine-step wizard, persistence, review, and generation remain |
| `/routines`, `/routines/[id]` | Placeholder pages | No plan list or Program UI |
| `/api/routines/generate`, `/api/routines/list`, `/api/routines/[id]` | Return `501 Not implemented` | No routine API |
| `types/index.ts` | Has `OnboardingData`, `WorkoutPlan`, `Microcycle`, and related types | Types do not represent the nine-step contract; old plan types embed full workout sessions |
| `lib/ai/service.ts` | Uses configured model IDs and lazy provider; substitution uses the shared retry/fallback wrapper | Routine generation still needs the validated pipeline and safe fallback |
| `lib/ai/schemas.ts` | Has `WorkoutPlanSchema` | Nested sessions use `z.any()`; not strict enough for persisted plans |
| `lib/constants.ts` | Has sectioned volume caps and recovery constants | Full plan-level safety validation remains |
| `lib/training/volume.ts` | Provides tonnage and planned sets per primary muscle | Completed-set tracking and full cap validation remain |
| Supabase schema | `workout_plans`, `workout_sessions`, and `session_exercises` tables exist | No plan RPC or plan query layer; routines routes are stubs |
| Database access | `lib/supabase/queries.ts` and `mutations.ts` | Most functions are stubs; these are being replaced with owner-specific files |
| `components/shared/` | Shared components exist | No page currently uses them; use these rather than modifying Shadcn primitives |
| Dependencies | Zod 4, AI SDK 7, and `next-intl` are installed | `react-hook-form` remains to be added with the full wizard |

The current routine-builder spec describes an older five-step flow and includes features outside
the MVP. RB-01 updates it to the team's confirmed nine-step flow and scope.

## 2. Scope and implementation decisions

| Topic | Build |
|---|---|
| Feature ownership | Dev B owns `/onboarding`, `/routines`, `/routines/[id]`, routine APIs, plan storage, `lib/training/` volume/split/plan validation/fallback code, and onboarding/program messages |
| Onboarding | Nine steps from `WIREFRAME-BRIEF.md` §3.1, followed by review and split-conflict states |
| Goal options | Keep the `strength` goal in the data type; the current default is to omit it from the MVP UI until Q12 is resolved |
| Profile persistence | Dev B owns `experience_level`, `injuries`, `preferences`, and `onboarding` columns; coordinate with Dev A, who owns base profile columns and the profile trigger |
| Plan/session boundary | Dev B owns `workout_plans` and `create_plan_with_sessions`; A owns the session schema and lifecycle. The plan RPC inserts planned sessions using A's agreed S4 schema and requires A's review |
| Authentication | Use the S1 `requireUser()` contract from Dev A. Until it lands, build against the agreed demo user/seed stand-in; never trust a client-supplied user ID |
| Exercise candidates | Use C's S2 `getCandidateExercises(filters)` and canonical catalog vocabularies. Use the seed stand-in until CAT-04 lands |
| AI | Use Dev B's S0-B1 lazy provider, shared Zod-validated wrapper, configured model IDs, and 30-second generation timeout |
| Safety | Treat volume ceilings, injury exclusions, equipment constraints, and recovery as hard validation constraints; every generated and fallback plan passes the same validators |
| Program UI | Build `VolumeVsCapChart` with plain Tailwind, no chart library. Reuse it and `BodyMap` in Progress through the S5 contract |
| Explicit MVP exclusions | Export, coach chat, manual add/reorder, and the plan-level substitution affordance are out of MVP. Active-session player and set logging belong to Dev A |
| Persistence safety | Create new migrations; never edit an applied migration. Local development is allowed; applying hosted migrations requires explicit human approval |

## 3. Implementation steps

Work in dependency order. Cards may proceed in parallel only where their contracts and file
ownership allow it. Keep shared-file edits within the sectioned ownership rules in team-plan §6.3.

### Sprint 0: foundations and seams

**S0-B1: AI configuration and resilience (M, safety-critical)**

- Add `lib/ai/config.ts` with the approved model IDs, lazy Anthropic provider creation, and
  timeouts (30 seconds for routine generation; 5 seconds for predict-load).
- Missing credentials produce a typed, explicit error rather than a module-load crash or fabricated
  result.
- Implement the shared AI wrapper: validate with Zod, log a validation failure, retry once with a
  clarified prompt, then return a typed fallback result.
- Update AI SDK calls to the installed `ai@7` API and keep each feature's prompt, schema, and
  service code in its labeled section.
- **Done when:** the existing substitution call can use the wrapper and configured model; routine
  generation can call the same wrapper after RB-06.

**S0-B2: Move and fix volume math (S, safety-critical)**

- Move `lib/utils/volume.ts` to `lib/training/volume.ts` and update imports.
- Use `SetLog.weightUsed` and `SetLog.repsCompleted`; provide tonnage calculation and
  `countWeeklySetsByMuscle(...)`.
- Count completed sets per primary muscle for caps; do not use tonnage as a proxy for sets.
- **Done when:** the D2 errors are gone and the pure-function cases in §5 pass.

**S0-B3: Section shared files (S)**

- Add the ownership section headers specified in team-plan §6.3 to `types/index.ts`,
  `lib/constants.ts`, and `lib/ai/{prompts,schemas,service}.ts`.
- Move existing declarations into their proper sections without behavior changes.
- **Done when:** existing behavior is unchanged and the team can make small, isolated edits to its
  own sections.

**S0-B4: Configure i18n (M)**

- **In progress:** English/Spanish namespace files and cookie-based request configuration are in
  place. The onboarding preview has its own provider; app-wide provider and dynamic root
  `<html lang>` require coordination with Dev A. Profile/browser locale fallback remains pending.
- Read the current `next-intl` App Router guidance for the no-locale-prefix setup.
- Create the `i18n/` configuration and empty EN/ES namespace files from PROP-03, including
  `onboarding.json` and `program.json`.
- Coordinate the dynamic `<html lang>` implementation with Dev A, who owns `app/layout.tsx`.
- **Done when:** changing the locale cookie switches a test string between English and Spanish.

**Sprint 0 seam work:** participate in freezing S3 (a strict `WorkoutPlanSchema` with no `z.any()`,
plan → planned sessions, `create_plan_with_sessions`, and
`getCurrentMicrocycle(planId, date)`), S5 (BodyMap and VolumeVsCapChart props), and S6
(`isOnboardingComplete(profile)`). These contracts must be agreed before consumers integrate; use
the team-plan stand-ins until the provider is merged.

### Feature 1: Personalized Routine Builder

**RB-01: Align the spec and define the onboarding contract (S)**

- Update `personalized-routine-builder.md` to the nine-step flow; remove export and coach chat from
  MVP scope. Keep the active workout player and set logging in Dev A's scope.
- Define `OnboardingData` v2 and `OnboardingSchema` in `lib/validation/onboarding.ts`. Cover goal,
  experience, biometrics, injuries (`zone`, `severity`, optional notes), availability (2–6 days,
  30–90 minutes), equipment preset/list, preferred split, and optional known 1RM or best set.
- Define the strict plan schema and `GenerateRoutineRequest` / `GenerateRoutineResponse` types,
  covering plans, microcycles, planned sessions, planned exercises, rationale, and agreed error
  codes.
- Place all shared TypeScript types in the Onboarding/Plan section of `types/index.ts`.
- Decide how the answers map to B-owned profile columns and document that mapping in the spec.
- **Depends on:** S0-B3 and agreement on the catalog injury-zone vocabulary.
- **Done when:** the schema accepts valid nine-step data, rejects invalid ranges/shapes, and the
  feature spec matches the agreed request and storage contracts.

**RB-02: Plan persistence and reads (M)**

- Add a new migration for `create_plan_with_sessions`; atomically insert the plan and its planned
  `workout_sessions` / `session_exercises` using A's S4 schema. A reviews the RPC and migration.
- Implement `lib/supabase/plans.ts`: `createPlanWithSessions`, `getPlans`, `getPlan`, and
  `getCurrentMicrocycle`.
- Implement `lib/supabase/onboarding.ts` with `updateOnboarding`.
- Implement `GET /api/routines/list` and `GET /api/routines/[id]`, scoped to the authenticated
  user and returning typed responses.
- Add B's plan/planned-session section to the local dev seed, using the fixed agreed seed IDs.
- **Depends on:** S1/S3/S4 contracts, Dev C's database types/mappers, and local Supabase.
- **Done when:** an owned plan can be saved atomically, read back with its planned sessions, and
  onboarding updates persist without changing A-owned session lifecycle behavior.

**RB-03: Safety validators (L, safety-critical)**

- Implement pure functions under `lib/training/` for weekly volume, recovery, injury exclusion,
  equipment availability, and split resolution. Each returns `{ ok, violations[] }`.
- Apply experience-specific weekly set caps, using hypertrophy caps for fat-loss and endurance
  until the product owner decides otherwise (DEC-07).
- Enforce injury restrictions using C's approved zone-to-pattern mapping; do not invent mappings.
- Respect available equipment. Treat preferred split as a soft input and return an explicit
  conflict and safe alternative when it conflicts with recovery/schedule constraints.
- Validate the completed plan, not just individual AI fields. Keep these functions framework-free
  so their outcomes are deterministic and reusable.
- **Depends on:** S0-B2, S2 catalog vocabulary, and product decisions Q1–Q3.
- **Done when:** all §5 validator examples pass and invalid plans cannot proceed to persistence.

**RB-04: Onboarding wizard and onboarding status (L)**

- Implement the nine steps, review step, and split-conflict card from wireframe screens 3–12.
- Keep form state in a client provider; save through `updateOnboarding` so progress survives reload
  and retries. Validate with the same Zod schema on submission.
- Export `isOnboardingComplete(profile)` as the S6 contract used by Today routing.
- Use shared components, translated strings, accessible labels/errors, and mobile-first layouts.
- **Depends on:** RB-01, RB-02, S5/S6 contracts, and shared design system.
- **Done when:** a user can finish, reload, and resume the wizard; review reflects saved values and
  displays a split conflict where applicable.

**RB-05: Reusable BodyMap (M)**

- Implement `components/body-map/BodyMap` with front/back SVG silhouettes, approximately ten
  agreed zones, and the severity sheet (screen 7b).
- Support both selection mode for onboarding and display/heatmap mode for Progress; keep the API
  display-agnostic so A can reuse it.
- Render injuries and selection states from canonical zone identifiers, not labels or inferred
  movement patterns.
- **Depends on:** C's S0-C3 injury-zone proposal and product-owner decision; S5 props.
- **Done when:** zone selection and severity entry work on mobile, and the component can render
  existing profile data in both modes.

**RB-06: Routine generation API (L, safety-critical)**

- Implement `POST /api/routines/generate`:
  1. Require the authenticated user through S1 and validate the request with Zod.
  2. Load the user's profile server-side; treat it as authoritative.
  3. Load catalog candidates from C's `getCandidateExercises`, filtered by equipment/injuries.
  4. Build the prompt using approved constants and the routine prompt section.
  5. Generate a typed plan through S0-B1 with the 30-second timeout.
  6. Run every RB-03 validator. On violations, retry once with the violations included; if still
     unavailable or invalid, use RB-07 and run the same validators.
  7. Persist through `create_plan_with_sessions` only after validation.
  8. Return the plan and user-visible rationale; never expose raw model output.
- Set the calibration-week flag when no reliable 1RM/best-set input is available.
- Map auth, validation, no-candidate, AI/fallback, and persistence failures to the agreed typed
  error contract. Do not return success-shaped responses when persistence fails.
- **Depends on:** RB-01–RB-03, RB-07, S1–S3, S0-B1, and CAT-04 (or agreed stand-in before CAT-04).
- **Done when:** valid requests persist a safe plan; invalid or unsafe outputs are rejected or
  replaced by a validated fallback; user/profile context cannot be supplied by another user.

**RB-07: Deterministic rule-based fallback (M, safety-critical)**

- Implement `lib/training/fallback-generator.ts` using the same candidate exercises and constants
  as AI generation.
- Produce a plan deterministically with a plain-language rationale. Do not port the prototype
  generator if it can bypass safety checks.
- Run all RB-03 validators before returning the fallback; fail explicitly if no safe plan can be
  formed.
- **Depends on:** RB-01–RB-03 and S2 catalog candidates.
- **Done when:** with the AI key absent, the generator returns a schema-valid, validator-approved
  plan when candidates permit one, and returns a clear error otherwise.

**RB-08: Generating screen (S)**

- Add staged progress copy for generation, retry feedback, and a safe error/retry state (screen 13).
- Preserve the wizard submission on failure; never display raw AI output or imply a plan was saved
  if persistence failed.
- **Depends on:** RB-01, RB-06, and onboarding/program translations.
- **Done when:** success navigates to the saved plan; errors allow a retry without re-entering data.

**RB-09: Program UI and shared volume chart (L)**

- Build `/routines` and `/routines/[id]` with plan overview, microcycle/week view, day chips and
  split labels, session detail, and the “Why this plan?” rationale accordion (screens 14–18).
- Build `components/training/VolumeVsCapChart` with Tailwind bars, cap markers, and deload-week
  styling; no chart-library dependency. Freeze the S5 props for A's Progress screen.
- Session details show planned exercises and prescriptions. Hide plan-level substitution in MVP.
- **Depends on:** RB-02, S3/S5, and program messages.
- **Done when:** saved plans render with rationale, schedule, and volume versus caps, including
  empty/loading/error states.

**RB-10: Refine and regenerate (M, safety-critical)**

- Accept free-text refinement, then send the request through the same candidate selection,
  generation, validator, retry, and fallback pipeline as RB-06.
- Show a concise diff between current and proposed plan; persist only after explicit confirmation.
- Preserve the existing plan if generation, validation, or saving fails; offer cancel and retry.
- **Depends on:** RB-06, RB-09, and confirmed plan update/replace semantics.
- **Done when:** no unvalidated plan can replace a saved plan and cancel leaves the saved plan
  unchanged. If B is behind at M2, team-plan lever L3 allows C to take this card.

**RB-11: Verification and spec close-out (S)**

- Complete the feature-spec §13 checklist, pure-function §14.1 tables, and generation AI-path
  checks in §14.2.
- Update the feature spec status, implementation feedback, and resolved open questions in the same
  change as any decisions that diverged from it (PROP-06).
- **Done when:** the acceptance criteria in §7 are evidenced and the status reflects actual work;
  do not mark browser checks complete unless performed.

## 4. Milestones and dependencies

| Milestone | Dev B deliverables |
|---|---|
| **G0 / Sprint 0** | AI wrapper/config, fixed volume functions, sectioned shared files, i18n config and namespaces; S3/S5/S6 contracts agreed |
| **M1: real users and catalog** | Onboarding contract/storage groundwork and safety validators; pass validator examples in §5 |
| **M2: plan to session** | Nine-step onboarding, generation API and fallback; generated plan respects caps, injury restrictions, and equipment; Dev A starts a session from that plan |
| **M3: full E2E** | Program view, rationale, volume chart, refinement/regeneration, and cross-feature safety review |
| **M4: hardening** | Audit `DOMAIN-RULES.md` §6 invariants across routine generation, substitution, and predict-load; close or defer docs/QA items |

**Dependencies:** Dev A provides S1 auth and S4 session contracts; Dev C provides S2 catalog,
candidate queries, and canonical injury/equipment vocabularies. Use agreed stand-ins rather than
blocking on another feature. The full integration path and milestone checklist live in team-plan
§§5 and 11.

## 5. Verification

There is no approved automated test runner or CI yet (team-plan NA-01–NA-03). Until that changes:

### Pure-function cases

| Function | Input | Expected |
|---|---|---|
| `countWeeklySetsByMuscle` | Set logs for several exercises/muscles | Counts sets by primary muscle; does not use tonnage |
| `validateWeeklyVolume` | Beginner with 13 chest sets | Violation |
| `validateWeeklyVolume` | Intermediate at 18 sets; fat-loss goal within the same cap | Accepted at cap; fat-loss uses hypertrophy cap |
| `validateRecovery` | Same muscle trained again in under 48 hours | Violation |
| `validateInjuryExclusion` | Plan contains a pattern restricted by the approved injury-zone mapping | Violation; no restricted exercise appears in accepted plans |
| `validateEquipment` | Candidate requires unavailable equipment | Violation |
| `resolveSplit` | 3 days with PPL preference | Accepted according to the agreed resolver contract |
| `resolveSplit` | 2 days with PPL preference | Conflict with a feasible alternative |
| `fallback-generator` | Same profile/candidates twice | Same deterministic plan; schema-valid and all validators pass |

Record input, expected output, and actual output in the PR as required by team-plan §14.1. Use a
scratch script or browser console; do not commit a throwaway test script.

### AI and persistence paths

- Valid AI output → schema validation → all safety validators → persisted plan with rationale.
- Missing/invalid AI key → safe rule-based fallback; never fabricate candidate IDs or profile data.
- Invalid AI schema output → one clarified retry, then validated fallback.
- Safety-violating AI output → retry then fallback; never persist the violating output.
- No safe candidate set → explicit error; no unsafe or partial plan is saved.
- Duplicate generation submission or persistence error → no false success; plan state remains
  recoverable.
- Unauthorized request and cross-user plan read/update → rejected.

### UI and integration

- Run `npm run lint` and `npm run build`.
- Manually verify onboarding, review/split conflict, generation loading/error/success, Program
  empty/loading/error states, and refine/cancel at 390×844 and 1440 px, in EN and ES.
- Verify persisted wizard progress after reload and each integration milestone using local
  Supabase and the dev seed; do not mock the database.
- Record exactly what was tested and explicitly list anything not tested. Browser testing is
  required for the UI; type checking/build alone is not feature verification.

## 6. Decisions and blockers to resolve

| Question | Blocks | Default in the team plan |
|---|---|---|
| Approve the injury-zone → restricted-pattern map? (Q1) | RB-03, RB-05 | C proposes it; exclude conservatively when uncertain |
| How are isolation exercises classified? (Q2) | Candidate filtering and safety review | Explicit isolation classification; do not cross into compound movement patterns |
| Final caps for fat-loss/endurance? (Q3) | RB-03 | Use hypertrophy caps as hard ceilings |
| Is `strength` selectable in the MVP? (Q12) | RB-01 | Omit from the UI; retain it in the type |
| How are plan edits represented and saved? | RB-10 | Confirm update semantics before implementation; preserve the saved plan until confirmed |
| Are `next-intl` and form dependencies available? | S0-B4, RB-04 | Coordinate with team; use npm and announce dependency changes |

Product-owner sign-off is required where the team plan says so. Do not silently turn proposed
vocabularies into approved safety rules.

## 7. Feature completion criteria

- All RB-01–RB-11 cards are complete or explicitly deferred by the team.
- For each experience level, generated plans pass the volume, recovery, injury, equipment, and
  split validators; no accepted plan exceeds a hard cap or uses an excluded pattern.
- With the AI key removed, a safe deterministic fallback is generated with visible rationale, or
  an explicit no-safe-plan error is returned.
- Onboarding, persistence, generation, Program view, and refinement behave correctly with real
  local Supabase data.
- UI states are manually checked in EN/ES at the required screen sizes; any untested state is
  recorded plainly.
- Safety-critical PRs include the `DOMAIN-RULES.md` §6 checklist and receive both other
  developers' approvals. The feature spec reflects implementation decisions and status.
