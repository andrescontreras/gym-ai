# Team Implementation Plan

> How a team of three developers, each working with AI coding agents, takes Gym AI from its
> current foundation to the Phase 1 end-to-end milestone:
> **sign up → onboarding → routine generation → active session → substitution → tracking**.
>
> The team works **by feature**. Each developer owns whole features, end to end (UI, API, data,
> AI prompts), and works on one feature at a time.
>
> **Read first, in this order:** `AGENTS.md` (operating rules) → this document (§3–§6, then your
> own brief in §8, §9 or §10) → `docs/DOMAIN-RULES.md` (safety-critical training rules) →
> `docs/WIREFRAME-BRIEF.md` (screens) → your feature spec in `docs/features/`.
>
> When this plan conflicts with `AGENTS.md` or `DOMAIN-RULES.md`, those documents win. Raise the
> conflict with the team. Don't resolve it on your own.

| Field | Value |
|---|---|
| Status | Active. Replaces the phase-based plan from 2026-11-20 |
| Updated | 2026-11-25 |
| Team | 3 developers: **Dev A**, **Dev B**, **Dev C** |
| Delivery model | Feature ownership. One feature per developer at a time, after a short joint Sprint 0 |
| Cadence | Milestone-gated. No fixed dates. A milestone ends when its checklist passes on `main` |
| Database model | Local Supabase per developer, with a shared dev seed. The hosted project is only migrated after human approval |

---

## Table of Contents

1. [What changed from the previous plan](#1-what-changed-from-the-previous-plan)
2. [Current state of the repository](#2-current-state-of-the-repository)
3. [Decisions register](#3-decisions-register)
4. [Feature ownership](#4-feature-ownership)
5. [Seams between features](#5-seams-between-features)
6. [Collaboration rules](#6-collaboration-rules)
7. [Sprint 0: joint foundation](#7-sprint-0-joint-foundation)
8. [Dev A brief: User Authentication, then Progress Tracking](#8-dev-a-brief-user-authentication-then-progress-tracking)
9. [Dev B brief: Personalized Routine Builder](#9-dev-b-brief-personalized-routine-builder)
10. [Dev C brief: Exercise Catalog, then Intelligent Exercise Substitution](#10-dev-c-brief-exercise-catalog-then-intelligent-exercise-substitution)
11. [Integration milestones](#11-integration-milestones)
12. [Timeline, critical path and workload](#12-timeline-critical-path-and-workload)
13. [Local development setup](#13-local-development-setup)
14. [Verification without an automated test runner](#14-verification-without-an-automated-test-runner)
15. [Handing a card to an AI agent](#15-handing-a-card-to-an-ai-agent)
16. [Risks and mitigations](#16-risks-and-mitigations)
17. [Open questions for the product owner](#17-open-questions-for-the-product-owner)

---

## 1. What changed from the previous plan

The previous version split the work by **layer**: Dev A did identity and UI shell, Dev B did
training science and onboarding, Dev C did the data layer and the workout screen. Every feature
needed all three people, so every feature waited on someone else's queue.

This version splits the work by **feature**:

| | Previous plan | This plan |
|---|---|---|
| Unit of ownership | A layer (data, AI, UI shell) | A feature, end to end |
| Who writes migrations | Only Dev C | The owner of the table, per §4.3 |
| Who writes queries | Only Dev C | Each feature owner, in its own `lib/supabase/<area>.ts` file |
| Who writes prompts | Dev B for all of them | Each feature owner writes their own prompt function. Safety review is cross-team |
| Structure | 5 phases, all three people in every phase | Sprint 0 together, then 3 independent feature tracks that meet at integration milestones |
| How parallel work stays unblocked | TypeScript fixtures | A shared **dev seed** in local Supabase (real rows), plus a few typed seam contracts frozen in Sprint 0 |

What carries over unchanged: the defect list, the confirmed decisions, the safety rules, local
Supabase per developer, and the human-approval gates.

---

## 2. Current state of the repository

Verified on 2026-11-25 by reading the code and running `npx tsc --noEmit` (11 errors).
`npm run build`, `npm run lint` and browser checks were **not** run.

### Built

- **Auth API:** `app/api/auth/login`, `logout`, `signup`. **Profile:** `app/api/profile`.
- **Substitution:** `app/api/ai/substitute` with Zod validation, calling
  `generateExerciseSubstitution`.
- **AI layer:** `lib/ai/service.ts` (four functions), `lib/ai/prompts.ts`, `lib/ai/schemas.ts`.
- **Supabase clients:** `lib/supabase/client.ts`, `server.ts` (including an admin client).
- **Auth state:** `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `hooks/useProfile.ts`.
- **Shared components** in `components/shared/`: Button, Input, Card, Alert, Modal, StatusChip,
  MetricTile, RecommendationCard. No page uses them yet.
- **Design tokens:** `lib/design-tokens.ts` (Material-3 "Kinetic Precision" dark palette) and
  `tailwind.config.ts`.
- **Migrations:** 3 files in `supabase/migrations/`: initial schema, RLS, and a seed of about 56
  exercises.
- **Session page:** `app/session/page.tsx` runs on mock data with the substitution modal
  `components/session/exercise-substitution.tsx`.

### Stubs (return 501 or throw "Not implemented")

- Routes: `exercises/*`, `routines/*`, `sessions/*`, `tracking/*`, `ai/predict-load`,
  `ai/voice-parse`.
- Hooks: `useSession`, `useExercises`.
- `lib/supabase/queries.ts` (everything except `getUserProfile`) and `lib/supabase/mutations.ts`.
- Placeholder pages: `/onboarding`, `/routines`, `/routines/[id]`, `/progress`, `/history`,
  `/session/[id]`. `/` is still the create-next-app boilerplate.

### Missing

Login, signup and password-reset pages · onboarding wizard · Program UI · i18n · charts · local
Supabase config (`supabase/config.jsonc`) · dev seed · CI.

### Known defects

Each defect now has one owner and one card that fixes it.

| # | Defect | Location | Fixed in |
|---|---|---|---|
| D1 | 11 TypeScript errors, so `npm run build` is expected to fail | `components/shared/Card.tsx`, `Modal.tsx`, `lib/design-tokens.ts`, `lib/utils/load-translation.ts`, `lib/utils/volume.ts` | S0-A1, S0-B2, S0-C6 |
| D2 | `volume.ts` reads `set.weight` / `set.reps`, but `SetLog` has `weightUsed` / `repsCompleted`. Tonnage is always 0, and it counts tonnage rather than the **sets** that the volume caps measure | `lib/utils/volume.ts` | S0-B2, RB-03 |
| D3 | `load-translation.ts` reads a constant key that doesn't exist, so the result is NaN | `lib/utils/load-translation.ts` | S0-C6, SUB-02 |
| D4 | Tailwind v4 probably does not load `tailwind.config.ts` (no `@config`), so design-token classes likely emit no CSS | `app/globals.css`, `tailwind.config.ts` | S0-A2 |
| D5 | `middleware.ts` is deprecated in Next 16 in favor of `proxy.ts`. It redirects to `/`, which has no login | `middleware.ts` | AUTH-04 |
| D6 | The `Database` type is camelCase but the SQL is snake_case, and supabase-js does **not** convert case. `workout_plans` and `set_logs` are missing from the type | `types/index.ts`, `lib/supabase/queries.ts` | S0-C2 |
| D7 | The model IDs `claude-3-5-*-20241022` are no longer in the `@ai-sdk/anthropic` v4 model list | `lib/ai/service.ts` | S0-B1 |
| D8 | `predictNextLoad` regex-parses prose instead of using `generateObject` with Zod | `lib/ai/service.ts` | PT-06 |
| D9 | `/api/ai/substitute` has no auth and never passes the user profile or injuries | `app/api/ai/substitute/route.ts` | SUB-03 |
| D10 | Signup inserts the profile with the anon client (fails under RLS when email confirmation is on), the profile is inserted twice, and debug `console.log` calls remain | `app/api/auth/signup`, `contexts/AuthContext.tsx` | AUTH-03, AUTH-06, AUTH-07 |
| D11 | Seed data: wrong movement patterns on isolation exercises, equipment names that don't match `EquipmentType`, invalid `resistance_profile`, no unique name, not idempotent | `supabase/migrations/20260823000000_seed_exercises.sql` | CAT-02 |
| D12 | The `exercises` table has a SELECT policy but RLS is not enabled on it | `supabase/migrations/20260822000000_enable_rls.sql` | CAT-02 |
| D13 | The substitution UI falls back to hard-coded bench-press alternatives for every exercise | `components/session/exercise-substitution.tsx` | SUB-05 |
| D14 | `ANTHROPIC_API_KEY` in `.env.local` is only 20 characters, which suggests a placeholder | `.env.local` (never commit it) | S0-C5 |

---

## 3. Decisions register

### Confirmed

| ID | Decision | Notes |
|---|---|---|
| DEC-02 | Onboarding uses the **9-step wizard** in `WIREFRAME-BRIEF.md` §3.1 | The Kinetic 5-step prototype in `personalized-routine-builder.md` is visual reference only. Dev B updates that spec (RB-01) |
| DEC-03 | Claude model IDs live in one file, `lib/ai/config.ts`. Defaults: `claude-sonnet-4-5` for reasoning tasks, `claude-haiku-4-5` for parsing and prediction | Update the "Claude 3.5" wording in `AGENTS.md` / `CLAUDE.md` |
| DEC-04 | Charts use **Recharts** | Untrained weeks render as gaps (`connectNulls={false}`). The projection is a dashed line |
| DEC-05 | i18n uses **`next-intl`** from the start. EN is the default, with full ES parity | Strings are never hard-coded in components |
| DEC-06 | Forms use **react-hook-form** with Zod resolvers | Auth and onboarding forms |
| DEC-07 | Fat-loss and endurance goals use the **hypertrophy caps as a hard ceiling** until the product owner decides otherwise | `WEEKLY_VOLUME_CAPS` in `lib/constants.ts` |
| DEC-09 | **Local Supabase per developer.** Hosted migrations are applied only after human approval, by Dev C | §13 |
| DEC-10 | Milestone-gated delivery, no calendar dates | §11 |
| DEC-11 | **Feature ownership.** Dev A: User Authentication, then Progress Tracking. Dev B: Personalized Routine Builder. Dev C: Exercise Catalog, then Intelligent Exercise Substitution | §4. Replaces the layer-based DEC-08 |
| DEC-12 | **Dev A owns the active session screen** (`/session/[id]`): the player, set logging, rest timer and summary. Dev B creates planned sessions. Dev C plugs a substitution panel into a slot that Dev A exposes | Matches the scope of `progress-tracking.md` §4 |
| DEC-13 | **A short joint Sprint 0** before feature work. Each developer fixes the foundation pieces their feature needs first | §7 |
| DEC-14 | **Dev C owns the exercise catalog**: the `exercises` table, seed, equipment and movement-pattern vocabularies, the injury-to-pattern mapping, and candidate-exercise queries | Balances Dev C's load. Substitution depends on it most, and Routine Builder consumes it |
| DEC-15 | Each developer works **one feature at a time**. Dev A finishes Authentication before starting Progress Tracking, and Dev C finishes the Catalog before starting Substitution | See §12 for the one allowed exception |

### Proposed defaults (adopt unless someone objects at the Sprint 0 kickoff)

| ID | Proposal | Reason |
|---|---|---|
| PROP-01 | Keep the auth route names `/api/auth/login`, `/logout`, `/signup`. Add `/api/auth/reset-password` and `/api/auth/reset-password/confirm` | The code already works. Detail in `docs/features/user-authentication-plan.md` §2 |
| PROP-02 | `next-intl` **without** a locale URL prefix. The locale comes from a cookie, then the profile preference, then the browser | Authenticated app with no SEO need, and simpler routing |
| PROP-03 | i18n messages are split per feature namespace: `messages/{en,es}/{common,auth,onboarding,program,session,progress,substitution}.json` | Each owner edits only their own files, so there are no conflicts |
| PROP-04 | Training-safety logic lives in `lib/training/` as pure, framework-free functions, split into files by owner (§4.2) | One home for the code that must match `DOMAIN-RULES.md` |
| PROP-05 | Multi-table writes (create plan with sessions, log set, substitute) are Postgres functions called through `supabase.rpc()` | `progress-tracking.md` §6 and the substitution spec require atomic writes |
| PROP-06 | Feature specs are updated in the same PR whenever an implementation decision diverges from them | Keeps AI agents from following stale specs |
| PROP-07 | A **dev seed** (`supabase/seed.sql`, local only) provides a demo user, a plan, planned sessions and a few weeks of set history | Lets every feature be built and tested against real rows before the upstream feature is finished. Never applied to hosted |
| PROP-08 | `lib/supabase/queries.ts` and `mutations.ts` are replaced by one file per area (§4.2), each holding its own queries, mutations and row ↔ domain mappers | Removes the biggest merge hot spot |

### Not approved (revisit at milestone M2)

| ID | Item | What this means for the plan |
|---|---|---|
| NA-01 | Vitest | Pure-function correctness relies on the manual tables in §14. **Strongly recommended:** `lib/training/` is safety-critical math and the cheapest code to unit test |
| NA-02 | CI (GitHub Actions) | Every author runs `npm run lint` and `npm run build` locally before opening a PR and pastes the result in the description |
| NA-03 | Playwright E2E | The end-to-end flow is checked by hand at each milestone with the scripts in §11 |

---

## 4. Feature ownership

### 4.1 Who owns what

| Developer | Features, in order | Spec | Main routes and screens |
|---|---|---|---|
| **Dev A** | **1. User Authentication** → **2. Progress Tracking** | `user-authentication.md` plus its plan `user-authentication-plan.md`, then `progress-tracking.md` | `/login`, `/signup`, `/reset-password*`, `/profile`, app shell and bottom tabs, `/` (Today), `/session`, `/session/[id]`, `/progress`, `/history` |
| **Dev B** | **Personalized Routine Builder** | `personalized-routine-builder.md` (9-step flow per DEC-02) | `/onboarding` (wizard, review, generating), `/routines`, `/routines/[id]` (Program views, Refine) |
| **Dev C** | **1. Exercise Catalog** → **2. Intelligent Exercise Substitution** | Catalog: this plan, §10. Substitution: `intelligent-exercise-substitution.md` | `/api/exercises/**`, substitution panel inside the session screen, `/api/ai/substitute`, `/api/substitutions/**` |

Out of scope for every track (roadmap Phase 2–3): semantic pgvector search, embeddings, fatigue
algorithms, video library, advanced analytics. Voice logging (roadmap item 9) is a stretch item
with no owner yet (see §12.4).

### 4.2 File ownership

The owner must approve any PR that touches these paths.

| Path | Owner |
|---|---|
| **Shared design system:** `app/globals.css`, `tailwind.config.ts`, `lib/design-tokens.ts`, `components/shared/**` | A |
| **App frame:** `app/layout.tsx`, `proxy.ts`, `messages/*/common.json`, `components/navigation/**` | A |
| **i18n config:** `i18n/**` (set up by B in Sprint 0 to take load off A) | B |
| **Authentication:** `app/(auth)/**`, `app/auth/**`, `app/api/auth/**`, `app/api/profile/**`, `app/profile/**`, `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `hooks/useProfile.ts`, `components/auth/**`, `lib/auth/**`, `lib/supabase/auth.ts`, `lib/supabase/profile.ts`, `lib/validation/auth.ts`, `messages/*/auth.json` | A |
| **Progress Tracking:** `app/page.tsx` (Today), `app/session/**`, `app/progress/**`, `app/history/**`, `app/api/sessions/**`, `app/api/tracking/**`, `app/api/ai/predict-load/**`, `components/session/**`, `components/progress/**`, `hooks/useSession.ts`, `lib/supabase/sessions.ts`, `lib/supabase/tracking.ts`, `lib/training/{e1rm,progression,units}.ts`, `messages/*/{session,progress}.json` | A |
| **Routine Builder:** `app/onboarding/**`, `app/routines/**`, `app/api/routines/**`, `components/onboarding/**`, `components/program/**`, `components/body-map/**`, `components/training/**`, `lib/supabase/{onboarding,plans}.ts`, `lib/training/{volume,split,plan-validation,fallback-generator}.ts`, `lib/validation/onboarding.ts`, `messages/*/{onboarding,program}.json` | B |
| **AI plumbing:** `lib/ai/config.ts` and the shared validated-generation wrapper | B |
| **Exercise Catalog:** `app/api/exercises/**`, `components/exercise/**`, `hooks/useExercises.ts`, `lib/supabase/exercises.ts` | C |
| **Substitution:** `app/api/ai/substitute/**`, `app/api/substitutions/**`, `components/substitution/**`, `lib/supabase/substitution.ts`, `lib/training/{load-translation,substitution-filters}.ts`, `messages/*/substitution.json` | C |
| **Database plumbing:** `supabase/config.jsonc`, `supabase/seed.sql`, the `Database` section of `types/index.ts`, `lib/supabase/{client,server}.ts` | C |
| **Shared, sectioned files** (§6.3): `types/index.ts`, `lib/constants.ts`, `lib/ai/prompts.ts`, `lib/ai/schemas.ts`, `lib/ai/service.ts`, `package.json` | Each owner edits only their section |
| `AGENTS.md`, `CLAUDE.md`, `docs/**` | Shared. Your own feature spec is yours |

Two existing files change owner when they move:

- `components/session/exercise-substitution.tsx` → `components/substitution/` (Dev C, SUB-05).
- `lib/utils/volume.ts` → `lib/training/volume.ts` (Dev B, S0-B2). `lib/utils/load-translation.ts`
  → `lib/training/load-translation.ts` (Dev C, S0-C6).

### 4.3 Database ownership

The table owner writes the migrations for that table and approves anyone else's changes to it.

| Object | Owner | Who else writes rows |
|---|---|---|
| `exercises` | C | Nobody. Read-only for A and B |
| `user_profiles`: `id`, `email`, `name`, `created_at`, `updated_at`, `units`, and the profile-creation trigger | A | |
| `user_profiles`: `experience_level`, `injuries`, `preferences`, `onboarding` | B | |
| `workout_plans` | B | |
| `workout_sessions`, `session_exercises`: schema, status lifecycle, the one-active-session rule | A | B inserts planned rows through its RPC. C swaps exercises through its RPC |
| `set_logs` | A | |
| RPC `create_plan_with_sessions` | B (A reviews) | |
| RPCs `start_session`, `log_set`, `complete_session` | A | |
| RPCs `substitute_session_exercise`, `undo_substitution` | C (A reviews) | |
| `supabase/seed.sql` (dev seed) | C maintains the file. Each owner writes their own section | |

### 4.4 Safety review

`DOMAIN-RULES.md` is safety-critical. Each owner is the expert for the rules their feature
implements:

| Rules | Expert |
|---|---|
| §2 Routine builder (volume caps, recovery, injuries, split, periodization) | Dev B |
| §1 Movement patterns, §3 Substitution (pattern lock, load translation, confidence) | Dev C |
| §4 Volume tracking, progressive overload, e1RM · §5 Session state | Dev A |

Every safety-critical PR needs **two approvals: both other developers**. The author pastes the
`DOMAIN-RULES.md` §6 invariants checklist into the PR, filled in.

---

## 5. Seams between features

Features are independent except at these seams. Each seam has a **provider**, a **contract** that
is frozen in Sprint 0, and a **stand-in** that consumers use until the real thing is merged. No one
waits on another feature: you build against the stand-in and switch at the milestone.

| Seam | Provider → consumers | Contract (frozen at G0) | Stand-in until merged | Real version lands in |
|---|---|---|---|---|
| **S1 Authenticated user** | A → B, C | `getCurrentUser()` (route handlers: `null` → 401) and `requireUser()` (pages: redirects to login) in `lib/supabase/auth.ts`, the `AuthUser` type, the protected-route list in `proxy.ts`, the route map (§5.1) | The demo user from the dev seed, signed in through Supabase Studio or a temporary script | Auth session A4 (M1) |
| **S2 Exercise catalog** | C → B, A | `Exercise` type, canonical vocabularies (equipment, movement patterns including the isolation classification, injury zone → restricted patterns), and the `getCandidateExercises(filters)` / `getExerciseById(id)` signatures | The current 53-exercise seed, with the queries implemented in S0-C2 against current data | CAT-04 (M1) |
| **S3 Plan → planned sessions** | B → A | `WorkoutPlan` / `Microcycle` / planned-session Zod schema, and how a plan becomes `workout_sessions` + `session_exercises` rows (`create_plan_with_sessions`). `getCurrentMicrocycle(planId, date)` signature, so deload weeks can be detected | Plan and planned sessions in the dev seed | RB-02, RB-06 (M2) |
| **S4 Session runtime** | A → C, B | Session-table schema (S0-J1), the `SessionExercise` domain type, the `SubstitutionSlot` props (below), and the `409 EXERCISE_MISMATCH` rule in `log_set` | Active session in the dev seed. C develops the panel on a scratch page (not committed), against that session | PT-04 (M2) |
| **S5 Shared UI assets** | B → A | `<BodyMap>` (front and back silhouette, about 10 zones) and `<VolumeVsCapChart>` component props | Placeholder boxes | RB-05, RB-09 |
| **S6 Onboarding status** | B → A | `isOnboardingComplete(profile)`. Today redirects to `/onboarding` when it's false | Returns `true` for the demo user | RB-04 |

### 5.1 Route map

| Route | Owner | Protected |
|---|---|---|
| `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`, `/auth/confirm` | A | No |
| `/` (Today) | A | Yes. Redirects to `/onboarding` when onboarding is incomplete (S6) |
| `/profile` | A | Yes |
| `/onboarding` | B | Yes |
| `/routines`, `/routines/[id]` (Program) | B | Yes |
| `/session`, `/session/[id]` | A | Yes |
| `/progress`, `/history` | A | Yes |

### 5.2 Substitution slot (S4)

Dev A's session player renders Dev C's panel. Dev A owns the button and the sheet. Dev C owns
everything inside the sheet.

```ts
// Exported by components/substitution/ (Dev C). Props type lives in types/index.ts.
interface SubstitutionSlotProps {
  sessionId: string
  sessionExercise: SessionExercise
  onSubstituted: (updated: SessionExercise) => void  // A refreshes the player state
  onSkipExercise: () => void                          // "Skip exercise" from the no-match state
  onClose: () => void
}
```

Rules:

- Until SUB-06 is merged, the "Substitute" button is visible but disabled.
- After a substitution, any `log_set` call for the old exercise gets `409 EXERCISE_MISMATCH`, and
  the player refetches the session.
- Undo (5 s) is handled inside the panel, and calls `onSubstituted` again with the restored
  exercise.

### 5.3 Plan, shared UI and onboarding contracts (S0-J3)

`WorkoutPlanSchema` validates generated plan content; the server supplies the plan ID, user ID,
goals and timestamps. Its exported `MicrocycleSchema`, `PlannedSessionSchema` and
`PlannedExerciseSchema` describe the nested content. Each level has a non-empty explanation:
`aiRationale` for the plan and `rationale` for every week, session and exercise. Exercise IDs
must identify existing catalog entries. Array order is the prescribed order, not a row ID.
`weight: null` means the starting load is unknown, not zero. The schema checks shape and calendar
consistency, **not** injury, equipment, volume or recovery safety; RB-03/RB-06 must validate
those rules before persistence or presentation.

Dates are calendar dates (`YYYY-MM-DD`), not timestamps. Weeks start at `startDate` and end
before the date seven days later; week numbers begin at 1 and dates are consecutive. Session
dates must fall within their week. `getCurrentMicrocycle(planId, date): Promise<Microcycle | null>`
will return the matching week, or `null` outside the plan. Authentication and query errors must
not be treated as a missing week. Its current body throws until RB-02.
`isOnboardingComplete(profile: UserProfile): boolean` also throws until RB-04; RB-01 must settle
completion and persistence semantics first. No demo-user exception is implemented here.

**Provisional seed and RB-02 mapping, pending S0-J1 review:**

| Source | Destination |
|---|---|
| Plan identity, name, duration, goals, volume profile, rationale, timestamps | `workout_plans` corresponding snake_case columns; `microcycles` contains the complete nested plan content |
| Each planned session | One `workout_sessions` row: generated `id`, plan's `user_id` and `plan_id`, session `date` and `name`, `status = 'planned'` |
| Each planned exercise | One `session_exercises` row: generated `id`, new `session_id`, `exercise_id`, `sets`, `reps`, `weight`, `rir`, `rest_seconds`, `completed = false`, `substituted_from = null` |

Use fixed row UUIDs in the local seed. Keep week, session and exercise rationales and the
prescribed order in `workout_plans.microcycles`; current session tables have no columns for them
or a stable link back to nested entries. Do not rely on insertion order to recover exercise
order. The current `session_exercises.weight` is non-null, so an unknown load cannot be
materialized without an agreed schema change; never substitute zero. S0-J1 must settle ordering,
prescription versus logged load, nullable unknown load, and a durable association between the
plan entries and session rows (including access to rationales). The unit of prescribed weight
also needs agreement with the profile/units contract. RB-02 owns the transactional
`create_plan_with_sessions` RPC and must reconcile this mapping with S0-J1 before implementing it.
Until then S0-C4 can seed a two-week plan with known loads and fixed IDs, but consumers cannot
assume session rows alone preserve order or rationales. The schema permits a short demo plan;
the recommended hypertrophy duration remains 8–12 weeks.

S5 props live in `types/index.ts`: `BodyMapProps` uses selection mode with selected zone IDs and
a toggle callback, or heatmap mode with values keyed by zone ID. Zone names remain subject to
S0-C3 approval; heatmap units and color scale are consumer presentation decisions.
`VolumeVsCapChartProps` takes `WeeklyVolume`, the experience cap range, and `isDeloadWeek`;
the bars and caps count sets, not tonnage. Components arrive in RB-05/RB-09.

---

## 6. Collaboration rules

### 6.1 Git workflow

- Trunk-based: `main` is always green. Short-lived branches, merged within 1–3 days. **No
  long-lived feature branches.** A feature lands as a series of small PRs. Unfinished screens are
  fine on `main`, as long as they build and aren't linked from the nav yet.
- Branch names follow `AGENTS.md`, prefixed with the card ID: `feature/AUTH-09-login-page`,
  `feature/RB-06-generation-api`, `fix/SUB-03-substitute-auth`.
- Commits use the imperative mood ("Add routine generation endpoint").
- Squash-merge PRs. Rebase on `main` at least daily.
- One card per PR. Split large cards into several PRs, each green on its own.
- Never force-push to `main`. Never rewrite shared history. Never commit `.env.local`.
- The stale remote branch `origin/BranchTest` should be reviewed and deleted by its creator.
  Deleting it requires human approval.

### 6.2 Pull requests

The PR description contains:

1. The card ID and a link to it in this document.
2. What changed and why. Keep it short.
3. A **Verification** section with:
   - local `npm run lint` and `npm run build` output (pass/fail)
   - the browser screens and states checked: default, loading, empty, error
   - an explicit "not tested" statement for anything not verified
4. Spec updates, if behavior diverged from a spec (PROP-06).
5. For safety-critical changes: the `DOMAIN-RULES.md` §6 invariants checklist, filled in.

| Change type | Required approvals |
|---|---|
| Inside your own feature | 1 reviewer, any teammate |
| Touches a file another person owns (§4.2) | That owner |
| Seam contract change after G0 (§5) | Announced to all three **before** merging. Every consumer of the seam approves |
| Safety-critical (`lib/training/**`, `lib/constants.ts`, AI prompts and validators, generation, substitution filtering, volume calculation) | Both other developers (§4.4) |
| Migration | The table owner (§4.3), plus 1 other reviewer. Applying to hosted needs human approval |

Reviews happen within one working day. Reviewing is part of the job, not an interruption: check
open PRs before starting your next card.

### 6.3 Shared, sectioned files

These files are touched by more than one feature. Each one is split into labelled sections, one
per feature, and each owner edits only their section.

| File | Sections and rule |
|---|---|
| `types/index.ts` | Shared · Auth/Profile (A) · Session/Tracking (A) · Catalog (C) · Substitution (C) · Onboarding/Plan (B) · AI (each owner's own types) · Database (C). Keep PRs that touch it small and merge them quickly. Never redefine a type elsewhere (`AGENTS.md`) |
| `lib/constants.ts` | Volume caps and recovery (B) · RIR and load increments (A) · Movement patterns, equipment, injury map, load translation (C). Every change is safety-critical (§6.2) |
| `lib/ai/prompts.ts`, `lib/ai/schemas.ts`, `lib/ai/service.ts` | One section per feature: routine (B), substitution (C), predict-load and voice (A). Shared wrapper and config (B) |
| `messages/**` | Edit only your own namespace files (PROP-03). Keys sorted alphabetically. EN and ES in the same PR |
| `supabase/migrations/**` | Name files `YYYYMMDDHHMMSS_<feature>_<topic>.sql`, for example `20261201090000_auth_profile_trigger.sql`. If someone merges a migration with a later timestamp before you, rename yours so it's the latest, then rebase. Never edit a migration that is already on `main` |
| `supabase/seed.sql` | One section per feature, in this order: users (A) · catalog references (C) · plans and planned sessions (B) · active session and set history (A). Use fixed UUIDs so everyone's seed data agrees |
| `app/layout.tsx`, `proxy.ts` | Dev A only. Others ask for changes, such as a new protected route |
| `package.json`, `package-lock.json` | Announce a new dependency before installing it. `npm` only, one dependency change per PR. A modified `package-lock.json` is currently uncommitted on one machine: commit it deliberately or discard it, don't leave it lingering |

### 6.4 Communication

- **Sprint 0 kickoff (45 min):** confirm the proposals in §3, the seam owners, and the Sprint 0
  cards.
- **Daily async update:** done, next, blocked, and **seam status** (has anything you provide
  changed?).
- **Seam changes:** announced before merging, never after.
- **Milestone demo (45 min):** walk the milestone checklist together in a browser, on one machine.

---

## 7. Sprint 0: joint foundation

**Goal:** `main` builds and lints, the design system renders, all three developers run the app
against local Supabase with the dev seed, and the seam contracts in §5 are merged. Each developer
fixes the foundation pieces their own feature needs first. The tracks touch different files, so
they run fully in parallel.

Keep it short: a few working days. Everything that isn't needed by at least two features waits
for its feature track.

### Dev A: design system and app frame

**S0-A1: Fix shared component typing (S)**
- Fix the compound sub-components (`Card.Header/Body/Footer`, `Modal.Body/Footer`) on
  `forwardRef` components, and `lib/design-tokens.ts` (`.default` on a string).
- Done when: the `tsc` errors in these files are gone and the component API is unchanged.

**S0-A2: Wire Tailwind v4 design tokens (M)**
- Load the tokens (`@config` in `globals.css`, or move them into `@theme`). Make the dark
  "Kinetic Precision" theme the default, and fix the `content` globs.
- Done when: `bg-surface-container`, `text-on-surface` and `bg-primary` render the palette colors
  in the browser on an existing page.

**S0-A3: App shell and route skeleton (S)**
- Bottom tabs (Today · Program · Progress · Profile) and placeholder pages for every route in
  §5.1.
- Done when: every route renders its placeholder with the shell.

**S0-J1, S0-J4, S0-J5: seam contracts S1 and S4 (S each)** — see below.

### Dev B: AI plumbing, training math and i18n

**S0-B1: AI configuration and resilience (M, safety-critical)**
- Create `lib/ai/config.ts` with the model IDs (DEC-03) and timeouts: 30 s for Sonnet, 5 s for
  predict-load.
- Create the Anthropic provider lazily (not at module load) and fail with a typed error when the
  key is missing.
- Check the `ai@7` types for deprecated call options (for example `system` vs `instructions`) and
  migrate.
- Add one shared wrapper that all three features use: validate with Zod → on failure, log, then
  retry once with a clarified prompt → return a typed `fallback` result (`AGENTS.md` AI rules).
- Done when: the existing substitution call works through the wrapper with the new model ID.

**S0-B2: Move and fix the volume math (S, safety-critical)**
- Move `lib/utils/volume.ts` to `lib/training/volume.ts` and update the imports.
- Fix the field names (`weightUsed`, `repsCompleted`). Provide `calculateTonnage(setLogs)` and
  `countWeeklySetsByMuscle(...)`. The caps count **sets** (`DOMAIN-RULES.md` §2).
- Done when: the D2 type errors are gone and the §14.1 rows for these functions pass.

**S0-B3: Split the shared files into sections (S)**
- Add the section headers in §6.3 to `types/index.ts`, `lib/constants.ts` and `lib/ai/*`, moving
  existing code into the right section. No behavior changes.
- Merge this first in Sprint 0, because everyone else's work lands inside these sections.

**S0-B4: Install and configure `next-intl` (M)**
- Read the `next-intl` docs for the App Router without locale prefixes (PROP-02).
- Create the `i18n/` config and **empty EN and ES files for every namespace** in PROP-03, so other
  owners never have to touch config.
- Set `<html lang>` dynamically (coordinate with A, who owns `app/layout.tsx`).
- Done when: switching the locale cookie swaps an EN/ES test string.

**S0-J3: seam contracts S3, S5 and S6 (S)** — see below.

### Dev C: database and catalog groundwork

**S0-C1: Set up local Supabase (M)**
- `npx supabase init` (creates `supabase/config.jsonc` with CLI 3.x), `npx supabase start`,
  `npx supabase db reset`. All three existing migrations must apply cleanly.
- Requires Docker. Update the "No Docker required" line in `AGENTS.md`.
- Write the exact steps into §13 if they differ.

**S0-C2: Align database types and split the data layer (M)**
- Rewrite the `Database` section of `types/index.ts` to match the SQL exactly: snake_case rows,
  add `workout_plans` and `set_logs`, remove non-column fields.
- Replace `queries.ts` / `mutations.ts` with the per-area files in §4.2 (PROP-08). Each file gets
  its row ↔ domain mappers. Move `getUserProfile` (with a working mapper) to
  `lib/supabase/profile.ts` and the exercise reads to `lib/supabase/exercises.ts`. Leave the other
  stubs as typed stubs in their new owner's file.
- Fix the wrong claim in `AGENTS.md` that "the client converts" case.
- Done when: the dashboard shows the experience level from a real profile.

**S0-C3: Draft the catalog vocabularies (S, needs product-owner sign-off)**
- The canonical equipment vocabulary matching `EquipmentType`.
- The injury zone → restricted movement patterns table (`DOMAIN-RULES.md` §7 open question). Dev B
  reviews it, because the onboarding body map uses the same zones.
- A proposal for classifying isolation exercises (curls, raises, leg extension, calf raise) that
  currently borrow compound patterns.
- Deliver as a PR to the catalog section of `lib/constants.ts`, plus a short "Proposed" section in
  `DOMAIN-RULES.md`. See Q1–Q2 in §17.

**S0-C4: Dev seed (M)**
- Create `supabase/seed.sql` (PROP-07) with sections per §6.3: a demo user
  (`demo@gym-ai.local`, fixed UUID) and profile, one plan with two weeks of planned sessions, one
  `active` session, and three weeks of completed sessions with set logs (including one untrained
  week, so the progress chart's gap state can be built).
- If inserting into `auth.users` from SQL proves brittle, create the user with a small
  `supabase.auth.admin.createUser` script instead and document it in §13.
- The plan and session rows follow the S0-J1 and S0-J3 contracts. Owners update their sections as
  their schema evolves.
- Done when: `npx supabase db reset` gives all three developers the same demo data.

**S0-C5: Environment check (S)**
- Confirm with the human owner that `ANTHROPIC_API_KEY` is a real key (D14). Never print it.
- Add local-Supabase example values to `.env.example`. Document or remove the unused
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Status (2026-11-25):** `.env.example` points at local Supabase and the publishable key is no
  longer referenced. Dev C has **no Anthropic key**: a team key from the human owner (or a
  personal one) is needed before the G0 AI-call check. Everything else proceeds without it.

**S0-C6: Move and type-fix load translation (S)**
- Move `lib/utils/load-translation.ts` to `lib/training/load-translation.ts` and fix the missing
  constant key so it type-checks. The full `DOMAIN-RULES.md` §3.2 implementation comes in SUB-02.

**S0-J2: seam contract S2 (S)** — see below.

### Joint: seam contracts

All contract PRs are reviewed by **all three** developers. They contain types, Zod schemas and
function signatures with stub bodies. No UI.

| Card | Author | Seam | Deliverable |
|---|---|---|---|
| **S0-J1** | A | S4 | Session-table baseline migration: the columns all three features need (exercise ordering, prescribed vs. logged load, substitution fields, status timestamps) and a partial unique index enforcing one `active` session per user (`DOMAIN-RULES.md` §5). B and C review |
| **S0-J2** | C | S2 | `Exercise` type (Catalog section), vocabularies from S0-C3 (marked "Proposed" if not yet signed off), and `getCandidateExercises(filters)` / `getExerciseById(id)` signatures. The filters cover equipment, movement patterns, excluded patterns and muscle group |
| **S0-J3** | B | S3, S5, S6 | Strict `WorkoutPlanSchema` with no `z.any()`: plan → microcycles → planned sessions → planned exercises, each with a `rationale`. How it maps to session rows. Signatures for `getCurrentMicrocycle` and `isOnboardingComplete`. Props for `BodyMap` and `VolumeVsCapChart` |
| **S0-J4** | A | S1 | `AuthUser`, `requireUser()` / `getCurrentUser()` signatures, the route map in §5.1 |
| **S0-J5** | A | S4 | `SessionExercise` domain type, `SubstitutionSlotProps` (§5.2), and the `LogSetRequest` / `LogSetResponse` shapes with the `409 EXERCISE_MISMATCH` code |

### Gate G0

- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass on `main`
- [ ] Shared components render with the dark palette in the browser
- [ ] EN/ES switch works on a test string
- [ ] All three developers run the app against local Supabase. `db reset` is clean and loads the dev
      seed
- [ ] An AI substitution call succeeds through the S0-B1 wrapper with the new model ID (real key
      confirmed)
- [ ] S0-J1 to S0-J5 are merged. Contracts are frozen; changes follow §6.2
- [ ] The S0-C3 vocabularies are approved, or explicitly deferred, by the product owner

---

## 8. Dev A brief: User Authentication, then Progress Tracking

**Your mission:** a user can create an account, stay signed in safely, run a workout set by set,
and see their strength progress. You own the screen users spend the most time in (the active
session), so your work is on the critical path twice (§12.2).

**Read:** `docs/features/user-authentication.md`, `docs/features/user-authentication-plan.md`,
`docs/features/progress-tracking.md`, `WIREFRAME-BRIEF.md` §3.3 and §3.5, `DOMAIN-RULES.md` §4–§5.

**You provide:** S1 (authenticated user), S4 (session runtime and the substitution slot).
**You consume:** S2 (catalog, read only), S3 (plans and planned sessions), S5 (body map, volume
chart), S6 (onboarding status).

### Feature 1: User Authentication

The work is in `docs/features/user-authentication-plan.md`, written as **13 AI sessions (A1–A13)**
with a model, a file allowlist and ready-made checks for each one. It's not repeated here. Run the
sessions in order:

| Group | Sessions | Why this order |
|---|---|---|
| **Auth core** (unblocks S1 and M1) | A1 contracts (also S0-J4) · A2 dependencies and local auth config · A3 profile trigger migration · A4 `proxy.ts` and `getCurrentUser()` / `requireUser()` · A5 core API routes · A6 `AuthContext` fix · A7 UI building blocks · A8 login and signup pages | Others switch from the seed user to real accounts as soon as this lands |
| **Auth complete** | A9 password reset · A10 profile and logout · A11 edge cases · A12 verification · A13 docs | Not on anyone else's path |

**Feature 1 done when:** session A12's checks all pass (the spec §13 checklist in EN and ES,
including the open-redirect checks), and B and C have been told that seam S1 is live.

### Feature 2: Progress Tracking

**PT-01: Session runtime RPCs (M, safety-critical)**
- Migration with `start_session(planned_session_id)` (rejects a second active session),
  `log_set` (inserts into `set_logs`, updates `completed` flags, completes the session after the
  last set, rejects duplicates and returns `EXERCISE_MISMATCH` for a swapped exercise) and
  `complete_session`.
- Store weights canonically in kg, using `lib/training/units.ts`.
- Spec: `progress-tracking.md` §5–§7.

**PT-02: Session and logging APIs (M)**
- `lib/supabase/sessions.ts` and `tracking.ts`, then `GET /api/sessions/active`,
  `POST /api/sessions` (start), `GET /api/sessions/[id]`, `POST /api/sessions/complete`,
  `POST /api/tracking/log`. Every error code from `progress-tracking.md` §5.
- Wire `hooks/useSession.ts`.

**PT-03: Today screen (M)**
- `WIREFRAME-BRIEF.md` screens 20, 34 and 35:
  - no plan: "Create your routine" (links to `/onboarding`)
  - today's planned session: "Start workout"
  - rest day
  - active session in progress: "Resume"
  - deload alert card, using `getCurrentMicrocycle` (S3)
- Redirects to `/onboarding` when `isOnboardingComplete` is false (S6).
- Build it against the seed plan. It switches to real plans at M2 with no code change.

**PT-04: Active session player (L)**
- Replace the mock data on `/session/[id]`:
  - exercise focus view (screen 21)
  - `SetLogRow` with steppers, and RIR required on the last set
  - `RestTimer` that auto-starts and survives backgrounding (absolute end timestamp, screen 25)
  - calibration-week variant (screen 22)
  - the substitution slot (§5.2), with the button disabled until SUB-06
- Primary actions stay in the bottom-third thumb zone at 390×844.

**PT-05: Session summary (S)**
- Tonnage, sets, duration, PRs, per-muscle volume added and a next-session teaser (screen 26).

**PT-06: Load prediction (M, safety-critical)**
- Rewrite `predictNextLoad` with `generateObject`, a `PredictiveLoadSchema` and a prompt in
  `lib/ai/prompts.ts` (Context → Task → Constraints → Output Format, with an example). Fixes D8.
- Progressive-overload rules in `lib/training/progression.ts` (`DOMAIN-RULES.md` §4.2), including
  the deload suggestion after 2+ weeks at RIR 0–1. `epley(weight, reps)` in
  `lib/training/e1rm.ts` (§4.4).
- `POST /api/ai/predict-load`, and an `OverloadBadge` that shows the rationale.
- After the 5 s timeout, fall back silently to the last logged set, then to calibration. Never a
  made-up number.

**PT-07: Tracking read APIs (M)**
- `GET /api/tracking/history` (cursor pagination) and `GET /api/tracking/volume`:
  - weekly e1RM series with `trained: false` / `e1rm: null` gaps, never interpolated
  - personal records
  - weekly **sets** per muscle vs. the caps, using B's `countWeeklySetsByMuscle`
  - deload weeks flagged through `getCurrentMicrocycle`, so a planned deload isn't shown as a
    problem

**PT-08: Progress dashboard (L)**
- Install Recharts (announce the dependency).
- `ProgressHeroChart`: e1RM lines, a `% / kg / volume` toggle, a tap-to-inspect tooltip with the
  raw set notation, a dashed projection, and an empty state (screen 27).
- Volume vs. cap with B's `VolumeVsCapChart`, and the body heatmap toggle with B's `BodyMap`
  (screen 28).

**PT-09: History list and session recap (M)**
- `HistoryList` and the per-session recap (screen 29).

**PT-10: Verification (S)**
- `progress-tracking.md` §13 checklist, the §14.1 rows for `epley` and the progression rules, and
  the §14.2 AI path checks for predict-load.

**Feature 2 done when:** the M2 and M3 checklist items you own pass, and the spec's status and
open questions are updated.

---

## 9. Dev B brief: Personalized Routine Builder

**Your mission:** a new user answers the onboarding questions and gets a safe, explained,
periodized plan that never exceeds the volume caps, never trains an injured pattern, and only uses
equipment they have. This is the most safety-critical feature in the app.

**Read:** `docs/features/personalized-routine-builder.md`, `WIREFRAME-BRIEF.md` §3.1–§3.2 and
screens 3–19, `DOMAIN-RULES.md` §1–§2 and §6. Reference designs: `docs/features/routine builder/`.

**You provide:** S3 (plans and planned sessions), S5 (`BodyMap`, `VolumeVsCapChart`), S6
(onboarding status), and AI plumbing (S0-B1).
**You consume:** S1 (authenticated user), S2 (catalog and candidate exercises).

**RB-01: Spec alignment and onboarding contract (S)**
- Update `personalized-routine-builder.md` for DEC-02 (9 steps, not 5), and mark export and coach
  chat as out of MVP scope.
- `OnboardingData` v2 type and `OnboardingSchema` in `lib/validation/onboarding.ts` for all 9 steps
  (`WIREFRAME-BRIEF.md` §3.1): goal, experience, biometrics, injuries `{zone, severity, notes?}[]`,
  availability `{days 2–6, minutes 30–90}`, equipment preset or list, preferred split, and optional
  1RM or best-set entries.
- Decide which `user_profiles` columns hold each answer (spec §16 open question), using your
  section of the table (§4.3).

**RB-02: Plan persistence (M)**
- Migration with the `create_plan_with_sessions` RPC: inserts `workout_plans`, then planned
  `workout_sessions` and `session_exercises` that follow A's S0-J1 schema. A reviews.
- `lib/supabase/plans.ts` (`createPlanWithSessions`, `getPlans`, `getPlan`,
  `getCurrentMicrocycle`) and `lib/supabase/onboarding.ts` (`updateOnboarding`).
- `GET /api/routines/list` and `GET /api/routines/[id]`.
- Update your section of the dev seed so the seed plan matches the final schema.

**RB-03: Safety validators (L, safety-critical)**
- Implement against `DOMAIN-RULES.md` §2, each returning `{ ok, violations[] }`:
  - `validateWeeklyVolume`: hard caps by experience level (DEC-07 for fat-loss and endurance)
  - `validateRecovery`: 48–72 h between sessions hitting the same muscle
  - `validateInjuryExclusion`: uses C's injury zone → pattern table (S2)
  - `validateEquipment`
  - `resolveSplit`: includes the split-conflict result
- Complete the §14.1 tables.

**RB-04: Onboarding wizard (L)**
- The 9 steps, the review step and the split-conflict card (screens 3–12). Shared components only.
- Wizard state lives in a client provider and is saved through `updateOnboarding`, so answers
  survive a reload or a retry.
- Export `isOnboardingComplete(profile)` (S6).

**RB-05: Body map (M)**
- `components/body-map/BodyMap`: front and back SVG silhouette, about 10 zones (the S0-C3 zones),
  and the severity sheet (screen 7b). A reuses it for the Progress heatmap, so keep it
  display-agnostic (selection mode and heatmap mode).

**RB-06: Routine generation API (L, safety-critical)**
- `POST /api/routines/generate`. The handler:
  1. checks auth (`getCurrentUser()`, S1) and validates the input with Zod
  2. loads the profile server-side as the authoritative context
  3. gets candidate exercises from C's `getCandidateExercises`, filtered by equipment and
     injuries
  4. builds the prompt from `lib/constants.ts` values
  5. calls the S0-B1 wrapper (`generateObject`, 30 s timeout)
  6. runs the RB-03 validators. On a violation, it retries once with the violations listed, then
     falls back to RB-07, which is validated the same way
  7. persists with `create_plan_with_sessions`
  8. returns the plan with its rationale
- Sets the calibration-week flag when no 1RM is given.

**RB-07: Rule-based fallback generator (M, safety-critical)**
- `lib/training/fallback-generator.ts`: a deterministic plan from the same candidates and
  constants, with a plain rationale. Used when the AI is unavailable or fails validation twice.
  Never bypasses the validators. (The spec rejected porting the prototype generator for this
  reason.)

**RB-08: Generating screen (S)**
- Staged progress copy, a retry state, and a safe error state that never shows raw output
  (screen 13).

**RB-09: Program UI (L)**
- Plan overview, week view (day chips with split labels), session detail, the "Why this plan?"
  accordion and weekly volume vs. cap (screens 14–18).
- Build `components/training/VolumeVsCapChart` here (S5): bars with cap markers and deload-week
  styling, plain Tailwind, no chart library. A reuses it.
- Session detail shows the exercise list. The plan-level "substitute" affordance is hidden in the
  MVP (Q6).

**RB-10: Refine and regenerate (M, safety-critical)**
- Free-text refinement → regenerate through the same validated pipeline → show a diff summary →
  confirm or cancel (screen 19).

**RB-11: Verification (S)**
- `personalized-routine-builder.md` §13 checklist, the §14.1 tables, and the §14.2 AI path checks
  for generation.

**Feature done when:** a plan generated for each experience level passes every validator, the
fallback produces a valid plan with the AI key removed, and the spec's status and open questions
are updated.

---

## 10. Dev C brief: Exercise Catalog, then Intelligent Exercise Substitution

**Your mission:** first, a trustworthy exercise catalog that both the routine builder and
substitution can rely on. Then, mid-workout swaps that keep the same movement pattern, translate
the load, and respect injuries.

**Read:** `docs/features/intelligent-exercise-substitution.md`, `WIREFRAME-BRIEF.md` §3.4 and
screens 30–33, `DOMAIN-RULES.md` §1, §3 and §6.

**You provide:** S2 (catalog), database plumbing (local Supabase, seed, `Database` types) and
hosted-migration execution after approval.
**You consume:** S1 (authenticated user), S4 (session runtime and the substitution slot).

### Feature 1: Exercise Catalog

The catalog has no separate spec. These cards and the vocabularies from S0-C3 define it. If it
grows, write `docs/features/exercise-catalog.md` from `FEATURE_TEMPLATE.md`.

**CAT-01: Finalize vocabularies (S)**
- Apply the product owner's decisions on S0-C3 (Q1, Q2) to `lib/constants.ts` and
  `DOMAIN-RULES.md`. Remove the "Proposed" markers.

**CAT-02: Catalog data-fix migration (M)**
- A new migration that:
  - adds a unique constraint on `exercises.name`
  - makes the exercise seed idempotent (`ON CONFLICT`)
  - corrects movement patterns, equipment names and `resistance_profile` per CAT-01 (D11)
  - enables RLS on `exercises` (D12). Locally is fine. Hosted waits for human approval
- The exercise data is reference data needed in production, so it stays in migrations, not in
  `seed.sql`.

**CAT-03: Expand the catalog to 100+ exercises (M, roadmap item 11)**
- At least 3 exercises per movement pattern for each equipment preset (gym, home dumbbells,
  bodyweight), so both the generator and substitution always have same-pattern candidates.
- Embeddings and semantic search are Phase 2. Leave `embedding` null.

**CAT-04: Catalog queries and APIs (M)**
- Implement `getExerciseById` and `getCandidateExercises(filters)` in `lib/supabase/exercises.ts`
  with every filter in S0-J2.
- `GET /api/exercises`, `GET /api/exercises/[id]` and `GET /api/exercises/search` (text search
  only, no pgvector), plus `hooks/useExercises.ts`.
- Tell B the day this merges: it's the input to RB-06.

**CAT-05: Verification (S)**
- For each equipment preset and each injury zone, `getCandidateExercises` returns only allowed
  exercises and at least one per pattern the split needs. Record the table in the PR.

### Feature 2: Intelligent Exercise Substitution

**SUB-01: Spec alignment and contracts (S)**
- Update `intelligent-exercise-substitution.md`: auth through cookies (no Bearer header), the
  confirm and undo endpoints below, and the answers to its §16 open questions.
- Add `POST /api/substitutions/confirm` and `POST /api/substitutions/undo` request and response
  types, with their error codes.

**SUB-02: Load translation (M, safety-critical)**
- Implement `DOMAIN-RULES.md` §3.2 in `lib/training/load-translation.ts` with the
  `LOAD_TRANSLATION` constants. No hard-coded factors. Round to the available increments (Q8).
- Complete the §14.1 rows.

**SUB-03: Substitution backend hardening (L, safety-critical)**
- `/api/ai/substitute`: `getCurrentUser()` (S1, fixes D9), loads the profile and injuries
  server-side.
- Candidates come from `getCandidateExercises`, so suggestions carry canonical exercise IDs, never
  AI-generated ones.
- Deterministic filters in `lib/training/substitution-filters.ts`: confidence ≥ 0.5, the pattern
  lock with the injury exception, equipment, muscle overlap.
- Load from SUB-02. Pain-warning detection. Error codes 401, 404, 422, 429 and 502. A server-side
  pattern-filtered fallback when the AI fails.

**SUB-04: Persistence (M, safety-critical)**
- Migration with `substitute_session_exercise` and `undo_substitution` RPCs: keep
  `substituted_from`, keep the sets and RIR, recalculate the load. A reviews (you're writing to A's
  tables).
- `lib/supabase/substitution.ts` and the confirm and undo routes.

**SUB-05: Substitution UI (L)**
- Move `components/session/exercise-substitution.tsx` to `components/substitution/` and split it
  into `SubstitutionReasonPicker`, `SubstitutionSuggestionCard`, `SubstitutionDetail` (load
  translation, rationale, scope toggle with "Just today" only per Q6),
  `SubstitutionFallback` and `SubstitutionConfirmation` with the 5 s undo (screens 30–33).
- Delete the hard-coded bench-press fallback (D13).
- Build against the seed's active session on a scratch page until PT-04 lands. Don't commit the
  scratch page.

**SUB-06: Player integration (S)**
- Export the panel as the `SubstitutionSlot` (§5.2). Ask A to enable the button in the player.
  Test the `409 EXERCISE_MISMATCH` refetch together.

**SUB-07: Verification (S)**
- `intelligent-exercise-substitution.md` §13 checklist, the §14.2 AI path checks, and the
  `DOMAIN-RULES.md` §6 invariants.

**Feature 2 done when:** the M3 substitution items pass, and the spec's status is updated.

---

## 11. Integration milestones

Milestones replace phase gates. Each one is a demo on one machine, against local Supabase, in EN
and ES. Work keeps flowing between milestones. A milestone only confirms that the seams joined up.

```
Sprint 0 (A ║ B ║ C) ─► G0 ─┬─ A: Auth ───────────────► Progress Tracking ──────────┐
                            ├─ B: Routine Builder ──────────────────────────────────┼─► M3 ─► M4
                            └─ C: Catalog ──► Substitution ───────────(waits on PT-04)┘
                                  M1 (real users, real catalog)   M2 (plan → session)
```

### M1: Real users, real catalog

- [ ] Sign up → the profile row exists (trigger) → land on `/onboarding`. Log out, then a protected
      route redirects to `/login`, and logging in returns to it
- [ ] `/api/exercises` returns 100+ exercises. The CAT-05 table passes
- [ ] B's validators pass the §14.1 tables
- [ ] Each feature's work so far runs against the dev seed

### M2: Plan to session

- [ ] Complete all 9 onboarding steps with one injury → the review shows a split conflict when
      expected
- [ ] Generate a plan → it respects the volume caps for the experience level, excludes the injured
      pattern, and uses only available equipment (§14 checklist)
- [ ] With the AI key removed, generation falls back to a validated rule-based plan with a visible
      rationale
- [ ] Today shows "Start workout" for the **generated** plan (no seed data) → the session starts →
      sets are logged → the rest timer auto-starts → the last set requires RIR → the summary shows
      tonnage
- [ ] Double-tapping "Log set" creates exactly one `set_logs` row
- [ ] The substitution panel works on the scratch page against a seed session
- [ ] `lint` and `build` green. Revisit NA-01 to NA-03 (Vitest, CI, Playwright)

### M3: Full end-to-end milestone

- [ ] The M2 script passes again
- [ ] Program view shows the plan, its rationale and the volume vs. cap
- [ ] Mid-session substitution, for example a barbell bench with the rack busy:
      - 1–3 same-pattern suggestions with translated load, preserved sets and RIR
      - confirm, then undo
      - pain text triggers the stop-and-assess warning
- [ ] The overload badge appears on the second session of an exercise and shows the calibration
      copy on the first
- [ ] Progress shows the e1RM trend with a gap for an untrained week, the volume vs. cap and the
      history recap
- [ ] Password reset works end to end through Mailpit
- [ ] All screens checked at 390×844 and 1440 px, in EN and ES

### M4: Hardening and release preparation

| Card | Owner | Work |
|---|---|---|
| M4-1 | All | **Cross-QA swap:** A tests B's feature, B tests C's, C tests A's, using each spec's §13 checklist. File issues. The owner fixes them |
| M4-2 | A | ES parity and copy review across every namespace. Run the +35% label-width check from `WIREFRAME-BRIEF.md` |
| M4-3 | A | Accessibility pass on the shared components and shell: keyboard order, focus rings, screen-reader labels, 48 px targets. Each owner fixes their own screens |
| M4-4 | C | Per-user rate limiting on `/api/ai/*` (about 50 req/min upstream) |
| M4-5 | C | RLS policy review across all tables, with each table owner. Hosted migration plan. **Stop for human approval** before applying |
| M4-6 | B | `DOMAIN-RULES.md` §6 invariants audit across every AI path (routine, substitution, predict-load) |
| M4-7 | All | Doc refresh: `AGENTS.md` (models, `proxy.ts`, Docker and local Supabase, case mapping), `docs/README.md`, feature spec statuses, the `README.md` schema pointer (the migrations are the source of truth) |
| M4-8 | Human | Deployment target decision and deploy. **Requires approval** |

Gate: every M4 card is closed or explicitly deferred, zero known safety-invariant violations, and
approvals are recorded for RLS, hosted migrations and the deploy.

---

## 12. Timeline, critical path and workload

### 12.1 Relative effort

Sizes: S ≈ ½ day, M ≈ 1½ days, L ≈ 3 days of focused work with an AI agent, including
verification. AUTH card sizes come from `user-authentication-plan.md`. These are planning aids for
comparing tracks, not commitments.

| | Dev A | Dev B | Dev C |
|---|---|---|---|
| Sprint 0 | 2 S + 1 M + 3 contracts ≈ 4 d | 2 S + 2 M + 1 contract ≈ 4½ d | 3 S + 3 M + 1 contract ≈ 6½ d |
| Feature 1 | Authentication, 13 cards ≈ 16 d | Routine Builder, 11 cards ≈ 19½ d | Catalog, 5 cards ≈ 5½ d |
| Feature 2 | Progress Tracking, 10 cards ≈ 16 d | — | Substitution, 7 cards ≈ 10½ d |
| **Total** | **≈ 36 d** | **≈ 24 d** | **≈ 22½ d** |

**The split you chose leaves Dev A with about 50% more work than B or C**, because Progress
Tracking includes the whole active-session screen. Dev C's heavy Sprint 0 and Dev B taking i18n
setup already help. §12.4 lists the levers that close the rest of the gap.

### 12.2 Critical path

Approximate working day each track finishes, with no levers applied:

| Track | Ends around |
|---|---|
| A: Sprint 0 → Auth core → Auth complete | day 4 → day 14 → day 20 |
| A: PT-01 to PT-05 (needed for M2) → PT-06 to PT-10 | day 28 → day 36 |
| B: RB-01 to RB-08 (needed for M2) → RB-09 to RB-11 | day 19 → day 24 |
| C: Catalog (CAT-04, which B needs, around day 11) → Substitution | day 12 → day 22½ |

```
G0 ─► A: Auth core ─► A: Auth complete ─► A: PT-01 … PT-05 ─► M2 (≈ day 28) ─► PT-06 … PT-10 ─► M3 (≈ day 36)
G0 ─► C: CAT-04 ─► B: RB-06 generation ─► RB-08 ─────────────► M2
                         C: SUB-05 ─► SUB-06 (needs PT-04) ───────────────────────────────────► M3
```

**Dev A is the critical path for both M2 and M3.** B is ready for M2 around day 19 and C finishes
around day 22, while M2 waits on A until about day 28. Protect A's time:

- Dev A reviews within the day but takes no other work until PT-04 is merged.
- B and C never wait on auth: they use the seed user until auth session A4 lands.
- C builds the whole substitution UI on a scratch page, so SUB-06 is a small wiring job.
- B owns the shared assets A needs later (S5), so PT-08 is assembly, not new component work.

### 12.3 The one exception to "one feature at a time"

When Auth core is merged, Dev A may **park "Auth complete"** (sessions A9–A13: password reset,
profile page, edge cases, verification, docs) and start Progress Tracking, then return to it
before M3. Nobody else depends on those sessions.

On the estimates above this moves M2 from about day 28 to about day 22, so the plan-to-session
integration is tested a week earlier. It doesn't change A's total, so M3 doesn't move. Decide at
the end of Auth core, and record the decision here.

### 12.4 Rebalancing levers

Each lever moves a card to someone with spare capacity. The card keeps its spec, and the feature
owner stays the required reviewer. Record any move in this document.

| # | Lever | When | Effect on the estimates |
|---|---|---|---|
| L1 | **Dev C takes PT-07** (tracking read APIs) **and PT-09** (history list and recap) after SUB-07. Both are data reads, close to C's catalog work | Decide at G0, so C plans for it | A −3 d, C +3 d. M3 ≈ day 33 |
| L2 | **Dev B takes PT-08** (progress dashboard) after RB-11. B already builds `VolumeVsCapChart` and `BodyMap`, which make up half of it | Decide at M2 | A −3 d, B +3 d. With L1, M3 ≈ day 30 and the totals are A 30, B 27, C 25½ |
| L3 | **Dev C takes RB-10** (refine and regenerate) | Only if B is behind at M2 | B −1½ d |
| L4 | **Voice logging** (roadmap item 9: `/api/ai/voice-parse`, mic UI, manual fallback) goes to whoever finishes first. It writes through A's `log_set` contract, so A only reviews | After M3, if there's time | Not in any total above |

Recommendation: adopt L1 at G0, and decide on L2 at M2 when real progress replaces the estimates.

---

## 13. Local development setup

Prerequisites: Node (version not yet pinned, see `AGENTS.md` "Not Confirmed"), npm, and Docker
Desktop (for local Supabase).

```bash
git clone https://github.com/andrescontreras/gym-ai.git && cd gym-ai
npm install
npx supabase start            # first run pulls Docker images; prints local URL and keys
npx supabase db reset         # applies all migrations + the dev seed
cp .env.example .env.local    # then fill in the local Supabase URL/keys and your Anthropic key
npm run dev                   # http://localhost:3000
```

- Sign in as the demo user (`demo@gym-ai.local`, password in `supabase/seed.sql`) until Auth core
  is merged. After that, sign up your own local users as needed.
- After pulling a new migration or seed change, run `npx supabase db reset`. Local data is
  disposable.
- Local emails (password reset, confirmation) appear in Mailpit, at `http://localhost:54324` by
  default.
- Each developer uses their own Anthropic key or a shared team key. Never paste keys in chat, PRs
  or logs.
- Only Dev C points a local checkout at the **hosted** project, and only to apply approved
  migrations.
- Verified in S0-C1 with Supabase CLI 3.4.0 and Docker 29.9: all three migrations apply on
  `db reset` and the catalog seed loads 53 exercises across all 8 patterns. Studio runs at
  `http://127.0.0.1:54323`.
- Dev seed (S0-C4): login `demo@gym-ai.local` / `DemoLifter123!` (local only). Dates are relative
  to the day of `db reset`: a two-week upper/lower plan starts that day, with today's Upper A
  `active` and two bench sets logged. Three weeks of history precede it, and the middle week is
  untrained. Re-run `db reset` on another day to move "today". Session rows are provisional
  until S0-J1 (§5.3).
- Open Docker Desktop once after installing it. Until its first launch completes, the `docker`
  CLI isn't on `PATH` and `supabase start` fails.
- `supabase start` prints local-only demo keys. Copy `API_URL` and `ANON_KEY` into `.env.local`.
  They aren't secrets, but keep hosted keys out of chat, PRs and logs.

---

## 14. Verification without an automated test runner

NA-01 to NA-03 mean there's no test runner and no CI yet. Until those are revisited:

### 14.1 Pure functions (`lib/training/`)

Each function's PR includes a table of input, expected output and actual output, checked by
running the function in a scratch script or the browser console. The script is not committed.
Minimum cases:

| Function | Owner | Cases |
|---|---|---|
| `epley` | A | `(100, 1) → 103.3`, `(75, 9) → 97.5`, `(0, 10) → 0` |
| Progression rules | A | Last RIR ≤ 2 → +2.5 kg upper / +5 kg lower. RIR ≥ 4 → hold. RIR 0–1 for 2+ weeks → deload suggestion |
| `countWeeklySetsByMuscle` | B | Sets are counted per primary muscle. Tonnage is not used |
| `validateWeeklyVolume` | B | Beginner at 13 chest sets → violation. Intermediate at 18 → ok. Under-cap volume → ok. Aggregate sets across every session in each microcycle and count primary muscles only. Fat-loss and endurance reuse the experience-based hypertrophy caps (DEC-07). Missing catalog ID → explicit violation |
| `validateRecovery` | B | Same muscle trained on the same day or within 48 h → violation. Exactly 48 h → ok. More than 72 h → ok (48–72 h is preferred, not a hard maximum). Check chronological spacing across microcycle boundaries; unrelated muscles do not conflict. Missing catalog ID → explicit violation |
| `validateInjuryExclusion` | B | A shoulder injury excludes every pattern mapped to that zone in CAT-01 |
| `resolveSplit` | B | 3 days + "PPL" → ok. 2 days + "PPL" → conflict with a suggested alternative |
| `translateLoad` barbell → dumbbell | C | 80 kg barbell bench → about 34 kg per hand (80 ÷ 2 × 0.85), rounded to the available increment |
| `translateLoad` squat → leg press | C | 100 kg → about 170 kg |
| Substitution filters | C | A `push_horizontal` original never yields another pattern, unless the original is injury-restricted |

### 14.2 AI paths

For each AI endpoint (generation: B, substitution: C, predict-load: A), run and record:

1. the happy path
2. a missing or invalid API key → fallback
3. an injected invalid output (temporarily) → retry, then fallback
4. a safety violation in the output → caught by the validators

### 14.3 UI

The `AGENTS.md` browser checklist applies: default, loading, empty and error states, at 390×844
and 1440 px, in EN and ES. **State explicitly in the PR anything that was not tested.**

---

## 15. Handing a card to an AI agent

Every card above is written to be self-contained. To give one to an AI coding agent in a new
session, paste this prompt and fill in the brackets:

```text
You are working in the Gym AI repository (Next.js 16, TypeScript, Tailwind 4, Supabase,
Vercel AI SDK v7, Zod v4).

You are acting as [Dev A / Dev B / Dev C], owner of the [feature name] feature.

Before writing any code, read in this order:
1. AGENTS.md (mandatory operating rules)
2. docs/TEAM-IMPLEMENTATION-PLAN.md: §3 (decisions), §4 (ownership), §5 (seams), §6 (rules),
   and card [CARD-ID] in your brief
3. docs/DOMAIN-RULES.md (safety-critical, if the card touches training logic or AI)
4. [Feature spec path, e.g. docs/features/progress-tracking.md], sections [x-y]
5. The existing files the card names

Your task: [CARD-ID] [title].
Only modify files your feature owns (plan §4.2), or your own section of a shared file (§6.3).
If you need a change in another owner's file or a seam contract (§5), stop and describe the
change instead of making it.
If another feature isn't ready yet, build against the seam's stand-in (§5), not a local copy.

Constraints:
- No `any`, no `@ts-ignore`. Types only in types/index.ts. Prompts only in lib/ai/prompts.ts.
- Every AI decision carries a user-visible rationale, and every AI output is Zod-validated.
- Never hard-code UI strings. Use next-intl messages in your namespace (EN and ES).
- Next.js 16: read node_modules/next/dist/docs/ instead of relying on memory.
- Do not run migrations against the hosted Supabase project, change RLS on hosted, deploy, or
  delete data. Stop and ask.

Definition of done:
- npm run lint and npm run build pass (paste the result)
- The card's acceptance criteria are met
- The UI is verified in the browser (or you say explicitly that you could not test it)
- If behavior diverges from a spec, update that spec in the same change
Finish with a short summary: files changed, verification done, open questions.
```

Tips:

- `docs/features/user-authentication-plan.md` §0–§1 is the reference format for running a feature
  as a series of cheap, self-contained sessions: model and effort per session, a file allowlist,
  verified facts written down once, ready-made checks, a two-strike stop rule and a short session
  log. B and C can copy that structure for their features.
- One card per session. Start a new session for the next card. Context from earlier cards should
  live in the repo (code and docs), not in chat history.
- On L-sized cards, ask the agent for a short plan before it edits anything.
- Have a different session, or a teammate, review safety-critical PRs, using `DOMAIN-RULES.md` §6
  as the checklist.
- Keep a feature-level agent context file only if it adds something the spec doesn't. The spec is
  the source of truth.

---

## 16. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Dev A is overloaded and sits on the critical path twice | High | Delays M2 and M3 | §12.2 protections, the §12.3 exception, and the §12.4 levers |
| R2 | Seam contracts turn out wrong once the real feature is built | Medium | Rework for consumers | Contracts are small and frozen at G0. Changes are announced first and approved by every consumer (§6.2) |
| R3 | Feature owners drift apart on shared rules (units, rounding, vocabularies) | Medium | Inconsistent numbers across screens | One owner per constant section (§6.3), safety review by both other developers (§4.4) |
| R4 | Migration timestamp or schema collisions now that three people write migrations | Medium | Broken `db reset` | Table ownership (§4.3), the naming and rename rule (§6.3), `db reset` before every PR |
| R5 | The dev seed goes stale as schemas evolve | Medium | Features pass on the seed but fail on real data | Owners update their seed section in the same PR as the schema change. M2 and M3 run on generated data, not the seed |
| R6 | Product-owner decisions (§17) arrive late | Medium | Blocks CAT-01 and RB-03 | Build to the proposed defaults, marked "Proposed", kept in one constants table so a later change is cheap |
| R7 | The AI produces unsafe plans that pass the schema | Medium | Safety | Deterministic validators after every AI call, retry with the violations, then a validated fallback. Two-reviewer rule |
| R8 | No automated tests lets math regress | Medium | Wrong volume or loads | §14 tables in PRs. Revisit Vitest at M2 (NA-01) |
| R9 | No CI lets a broken `main` through | Medium | Blocks the team | Mandatory local lint and build output in PRs. Revisit CI at M2 (NA-02) |
| R10 | Rate limits and cost from 3 developers plus agents calling Claude | Medium | Throttling or cost | Haiku for cheap paths, the seed for UI work, per-user rate limit in M4-4 |
| R11 | Docker or local Supabase problems on one machine | Low | One developer blocked | Pair on S0-C1. Temporary fallback: a personal hosted Supabase project for that developer, never the shared one |
| R12 | Specs drift from code again | Medium | Agents follow stale specs | PROP-06: spec updates travel in the same PR |

---

## 17. Open questions for the product owner

| # | Question | Blocks | Default until answered |
|---|---|---|---|
| Q1 | Approve the injury zone → restricted pattern table (S0-C3)? | CAT-01, RB-03, RB-05, SUB-03 | Dev C's proposal, conservative (exclude when in doubt) |
| Q2 | How should isolation exercises be classified (a new pattern vs. the nearest compound)? | CAT-01, CAT-02, substitution pattern lock | Add an explicit isolation classification. Never cross into compound patterns |
| Q3 | Final volume caps for fat-loss and endurance goals? | RB-03 | Hypertrophy caps (DEC-07) |
| Q4 | Is email verification required before using the app? | AUTH-02, AUTH-09 | Not required in MVP. Show a banner |
| Q5 | Should RPE be shown in MVP, or stay hidden (`WIREFRAME-BRIEF.md` §3.3)? | PT-04 | Hidden. RIR only |
| Q6 | Substitution scope "All future sessions" in MVP? | SUB-05, RB-09 | "Just today" only |
| Q7 | Mid-program substitution: does e1RM history continue under the original exercise or start fresh? | PT-07 | Separate series, with a substitution badge |
| Q8 | Plate and dumbbell rounding increments? | SUB-02, PT-06 | 2.5 kg barbell, 2 kg dumbbell (configurable constant) |
| Q9 | Pain-warning copy: does it need medical or legal review? | SUB-03 | Use the spec copy, flagged for review before a hosted release |
| Q10 | Revisit Vitest, CI and Playwright? | Quality from M2 on | Revisit at the M2 demo |
| Q11 | Deployment target (Vercel assumed)? | M4-8 | No deployment until decided |
| Q12 | Is `strength` a selectable goal (`DOMAIN-RULES.md` §7)? | RB-01 | Not in the MVP UI. The type keeps it |

---

**Maintained by:** the Gym AI team. When a card changes owner, a decision is made or a milestone
passes, update this document in the same PR.
