# Team Implementation Plan

> How a team of three full-stack developers (human or AI agents) takes Gym AI from its current
> foundation to the Phase 1 end-to-end milestone:
> **sign up → onboarding → routine generation → active session → substitution → tracking**.
>
> **Read first, in this order:** `AGENTS.md` (operating rules) → this document →
> `docs/DOMAIN-RULES.md` (safety-critical training rules) → `docs/WIREFRAME-BRIEF.md` (screens)
> → the feature spec for your task in `docs/features/`.
>
> When this plan conflicts with `AGENTS.md` or `DOMAIN-RULES.md`, those documents win. Raise the
> conflict with the team; don't resolve it on your own.

| Field | Value |
|---|---|
| Status | Active |
| Created | 2026-11-20 |
| Team | 3 full-stack developers of similar level: **Dev A**, **Dev B**, **Dev C** |
| Cadence | Phase-gated. No fixed dates. A phase ends when its gate checklist passes. |
| Database model | Local Supabase per developer, plus one shared hosted project (only migrated after human approval) |

---

## Table of Contents

1. [Review of the previous plan](#1-review-of-the-previous-plan)
2. [Current state of the repository](#2-current-state-of-the-repository)
3. [Decisions register](#3-decisions-register)
4. [Team structure and ownership](#4-team-structure-and-ownership)
5. [Collaboration rules](#5-collaboration-rules)
6. [Phase overview and gates](#6-phase-overview-and-gates)
7. [Phase 0: Stabilize](#7-phase-0-stabilize)
8. [Phase 1: Contracts](#8-phase-1-contracts)
9. [Phase 2: First vertical slice](#9-phase-2-first-vertical-slice)
10. [Phase 3: Complete the end-to-end milestone](#10-phase-3-complete-the-end-to-end-milestone)
11. [Phase 4: Hardening and release preparation](#11-phase-4-hardening-and-release-preparation)
12. [Dependency map and critical path](#12-dependency-map-and-critical-path)
13. [Workload balance](#13-workload-balance)
14. [Local development setup](#14-local-development-setup)
15. [Verification without an automated test runner](#15-verification-without-an-automated-test-runner)
16. [Handing a task to an AI agent](#16-handing-a-task-to-an-ai-agent)
17. [Risks and mitigations](#17-risks-and-mitigations)
18. [Open questions for the product owner](#18-open-questions-for-the-product-owner)

---

## 1. Review of the previous plan

The first plan (single developer, Phases 0–5, written in a planning session and never saved to
the repo) got the order right: foundation fixes, then auth, onboarding and routine generation. It
fell short when handed to three people.

### What it got right

- Making the repo green (`lint`, `build`) before any feature work.
- Moving safety rules (volume caps, injury exclusion, recovery) into deterministic code that
  validates AI output, so the prompt is not the only safeguard.
- Choosing the 9-step onboarding wizard, updated Claude model IDs, Recharts and `next-intl`.
- Recognizing the human-approval gates for migrations and RLS.

### Gaps, and how this plan addresses them

| # | Gap in the previous plan | Impact on a team of 3 | Fix in this plan |
|---|---|---|---|
| 1 | Written as one sequential stream of work | Two of three people are idle or blocked during Phase 0 | Phase 0 is split into three independent tracks by file area (§7) |
| 2 | No ownership model | Duplicate work, unclear reviewers, nobody accountable for safety logic | Vertical domain ownership plus file ownership (§4) |
| 3 | No contract-first step | Each developer invents their own payloads, then integration breaks | A short Phase 1 freezes types, Zod schemas, API shapes and fixtures (§8) |
| 4 | Shared hot-spot files not managed (`types/index.ts`, `lib/constants.ts`, i18n messages, migrations) | Constant merge conflicts | Hot-spot rules and single owners (§5.3) |
| 5 | Migration authorship undefined | Timestamp collisions and conflicting schema changes | Only Dev C writes migrations. Others file requests (§5.4) |
| 6 | Session, substitution and tracking left as vague "later phases" | The E2E milestone was not actually planned | Phases 2–3 schedule them in parallel with explicit tasks (§9–§10) |
| 7 | No way to build UI before the backend is done | Frontend work blocks on APIs | Typed fixtures in Phase 1 let UI and API work proceed in parallel (§8) |
| 8 | Time estimates without a dependency graph | Misleading schedule | Phase gates plus a critical path (§6, §12) |
| 9 | No guidance for AI agents | Each new session re-discovers context or violates rules | Self-contained task cards plus a hand-off prompt template (§16) |
| 10 | Review process undefined | Safety-critical code merged with one glance | Two-reviewer rule for safety-critical paths (§5.2) |
| 11 | Shared hosted database implied | Three developers corrupting each other's data | Local Supabase per developer (§14) |
| 12 | No testing strategy beyond "manual" | Regressions in pure math go unnoticed | Structured manual verification plus a strong recommendation to adopt Vitest (§15) |
| 13 | Domain open questions mixed with tasks | Blocked work discovered too late | A product-owner question list with the task each one blocks (§18) |
| 14 | Spec vs. code drift ignored (for example auth route names) | Agents implement the spec and break working code | A rule that specs are updated to match the decided contract (§3) |

---

## 2. Current state of the repository

Verified on 2026-11-20 by reading the code and running `npx tsc --noEmit`. `npm run build`,
`npm run lint` and browser checks were **not** run.

### Built

- **Auth API:** `app/api/auth/login`, `logout`, `signup`.
- **Profile:** `app/api/profile`.
- **Substitution:** `app/api/ai/substitute`, with Zod validation and calls to
  `generateExerciseSubstitution`.
- **AI layer:** `lib/ai/service.ts` (four functions), `lib/ai/prompts.ts`, `lib/ai/schemas.ts`.
- **Supabase clients:** `lib/supabase/client.ts`, `server.ts` (including an admin client).
- **Auth state:** `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `hooks/useProfile.ts`.
- **Shared components** in `components/shared/`: Button, Input, Card, Alert, Modal, StatusChip,
  MetricTile, RecommendationCard. They are not used by any page yet.
- **Design tokens:** `lib/design-tokens.ts` (Material-3 "Kinetic Precision" dark palette) and
  `tailwind.config.ts`.
- **Migrations:** `supabase/migrations/` has 3 files: the initial schema, RLS, and a seed of
  about 56 exercises.
- **Session page:** `app/session/page.tsx` runs on mock data with the substitution modal
  `components/session/exercise-substitution.tsx`.

### Stubs (return 501 or throw "Not implemented")

- **Routes:** `exercises/*`, `routines/*`, `sessions/*`, `tracking/*`, `ai/predict-load`,
  `ai/voice-parse`.
- **Hooks:** `useSession`, `useExercises`.
- **Supabase:** `lib/supabase/queries.ts` (everything except `getUserProfile`) and
  `lib/supabase/mutations.ts`.
- **Placeholder pages:** `/onboarding`, `/routines`, `/routines/[id]`, `/progress`, `/history`,
  `/session/[id]`. `/` is still the create-next-app boilerplate.

### Missing

- Login, signup and password-reset pages
- Onboarding wizard
- Program UI
- i18n
- Charts
- Local Supabase config (`supabase/config.toml`)
- CI

### Known defects

| # | Defect | Location |
|---|---|---|
| D1 | 10 TypeScript errors, so `npm run build` is expected to fail | `components/shared/Card.tsx`, `Modal.tsx` (compound sub-components on `forwardRef`), `lib/design-tokens.ts:317`, `lib/utils/load-translation.ts:28`, `lib/utils/volume.ts:21-22` |
| D2 | `volume.ts` reads `set.weight` / `set.reps`, but `SetLog` has `weightUsed` / `repsCompleted`. Tonnage is always 0, and it counts tonnage rather than the **sets** that the volume caps measure | `lib/utils/volume.ts` |
| D3 | `load-translation.ts` reads a constant key that doesn't exist, so the result is NaN | `lib/utils/load-translation.ts` |
| D4 | Tailwind v4 probably does not load `tailwind.config.ts` (no `@config`). Design-token classes likely emit no CSS | `app/globals.css`, `tailwind.config.ts` |
| D5 | `middleware.ts` is deprecated in Next 16 in favor of `proxy.ts`. It redirects to `/`, which has no login | `middleware.ts` |
| D6 | The `Database` type is camelCase but the SQL is snake_case, and supabase-js does **not** convert case. `workout_plans` and `set_logs` are missing from the type | `types/index.ts`, `lib/supabase/queries.ts` |
| D7 | The model IDs `claude-3-5-*-20241022` are no longer in the `@ai-sdk/anthropic` v4 model list. The current IDs `claude-sonnet-4-5` and `claude-haiku-4-5` are listed | `lib/ai/service.ts` |
| D8 | `predictNextLoad` regex-parses prose instead of using `generateObject` with Zod | `lib/ai/service.ts` |
| D9 | `/api/ai/substitute` has no auth and never passes the user profile or injuries | `app/api/ai/substitute/route.ts` |
| D10 | Signup inserts the profile with the anon client, which fails under RLS when email confirmation is on. The profile is also inserted twice (route and `AuthContext`). Debug `console.log` calls remain | `app/api/auth/signup`, `contexts/AuthContext.tsx` |
| D11 | Seed data: wrong movement patterns on isolation exercises, equipment names that don't match `EquipmentType`, invalid `resistance_profile`, no unique name, not idempotent | `supabase/migrations/20260823000000_seed_exercises.sql` |
| D12 | The `exercises` table has a SELECT policy but RLS is not enabled on it | `supabase/migrations/20260822000000_enable_rls.sql` |
| D13 | The substitution UI falls back to hard-coded bench-press alternatives for every exercise | `components/session/exercise-substitution.tsx` |
| D14 | `ANTHROPIC_API_KEY` in `.env.local` is only 20 characters, which suggests a placeholder | `.env.local` (never commit it) |

---

## 3. Decisions register

### Confirmed

| ID | Decision | Notes |
|---|---|---|
| DEC-01 | Build order: stabilize → contracts → auth, onboarding and routine generation → session, substitution and tracking → hardening | CLAUDE.md milestone order |
| DEC-02 | Onboarding uses the **9-step wizard** in `WIREFRAME-BRIEF.md` §3.1 | The Kinetic 5-step prototype is visual reference only |
| DEC-03 | Claude model IDs live in one file, `lib/ai/config.ts`. Defaults: `claude-sonnet-4-5` for reasoning tasks, `claude-haiku-4-5` for parsing and prediction | Update the "Claude 3.5" wording in `AGENTS.md` / `CLAUDE.md` |
| DEC-04 | Charts use **Recharts** | Untrained weeks render as gaps (`connectNulls={false}`). The projection is a dashed line |
| DEC-05 | i18n uses **`next-intl`** from the start. EN is the default, with full ES parity | Strings are never hard-coded in components |
| DEC-06 | Forms use **react-hook-form** with Zod resolvers | Auth and onboarding forms |
| DEC-07 | Fat-loss and endurance goals use the **hypertrophy caps as a hard ceiling** until the product owner decides otherwise | `WEEKLY_VOLUME_CAPS` in `lib/constants.ts` |
| DEC-08 | Team of three full-stack developers with **vertical domain ownership** | §4 |
| DEC-09 | **Local Supabase per developer.** Only Dev C applies migrations to the hosted project, and only after human approval | §14 |
| DEC-10 | Phase-gated delivery, no calendar dates | §6 |

### Proposed defaults (adopt unless someone objects in the Phase 1 kickoff)

| ID | Proposal | Reason |
|---|---|---|
| PROP-01 | Keep the existing auth route names (`/api/auth/login`, `/logout`, `/signup`). Add `/api/auth/reset-password` and `/api/auth/reset-password/confirm`. Update `docs/features/user-authentication.md` to match | The code already works. The spec's `signin`/`signout` names are just naming |
| PROP-02 | `next-intl` **without** a locale URL prefix. The locale comes from a cookie, then the profile preference, then the browser | Authenticated app, no SEO need, simpler routing |
| PROP-03 | i18n messages are split per namespace: `messages/{en,es}/{common,auth,onboarding,program,session,progress}.json` | Each owner edits only their own files, so no conflicts |
| PROP-04 | Training-safety logic moves to `lib/training/` as pure, framework-free functions | Single home for the code that must match `DOMAIN-RULES.md` |
| PROP-05 | Multi-table writes (create plan with sessions, log set, substitute) are Postgres functions called via `supabase.rpc()` | `progress-tracking.md` §6 and the substitution spec require atomic writes |
| PROP-06 | Feature specs are updated in the same PR whenever an implementation decision diverges from them | Prevents AI agents from following stale specs |

### Not approved (revisit at the Phase 2 gate)

| ID | Item | What this means for the plan |
|---|---|---|
| NA-01 | Vitest | Pure-function correctness relies on the manual verification tables in §15. **Strongly recommended:** `lib/training/` is safety-critical math and is the cheapest code to unit test |
| NA-02 | CI (GitHub Actions) | Every author must run `npm run lint` and `npm run build` locally before opening a PR, and paste the result in the PR description |
| NA-03 | Playwright E2E | The end-to-end flow is verified manually at each gate using the scripts in §15 |

---

## 4. Team structure and ownership

### 4.1 Domains

Each developer owns one **vertical domain**: UI, API routes and business logic for that domain.
Owners are accountable for their domain and review changes others make to it.

| Developer | Domain | Owns end to end |
|---|---|---|
| **Dev A** | **Identity, Shell and Insights** | Design-system wiring, `proxy.ts`, i18n setup, auth pages and flows, app shell and bottom tabs, Today screen, profile, Progress dashboard, History, voice logging (Phase 4) |
| **Dev B** | **Planning and Training Science** | `lib/training/` safety library, `lib/constants.ts`, AI configuration and prompts for routines, onboarding wizard, routine generation API, Program UI, Refine |
| **Dev C** | **Data and Workout** | Local Supabase, migrations, `Database` types and mappers, `lib/supabase/` queries and mutations, sessions API, set logging, rest timer, session summary, substitution hardening, predict-load wiring |

### 4.2 File ownership

The owner must approve any PR that touches these paths.

| Path | Owner | Notes |
|---|---|---|
| `app/globals.css`, `tailwind.config.ts`, `lib/design-tokens.ts`, `components/shared/` | A | |
| `proxy.ts` (replaces `middleware.ts`), `app/layout.tsx` | A | |
| `app/(auth)/**`, `app/api/auth/**`, `app/api/profile`, `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `hooks/useProfile.ts`, `components/auth/**`, `components/navigation/**` | A | |
| `i18n/**` (config), `messages/*/common.json`, `messages/*/auth.json`, `messages/*/progress.json` | A | |
| `app/progress/**`, `app/history/**`, `app/api/tracking/history`, `app/api/tracking/volume`, `components/progress/**` | A | |
| `lib/training/**`, `lib/constants.ts` | B | **Safety-critical** |
| `lib/ai/**` (config, prompts, schemas, service) | B | **Safety-critical.** C edits the substitution and predict-load functions with B's review |
| `lib/validation/**` | B | Zod input schemas |
| `app/onboarding/**`, `components/onboarding/**`, `messages/*/onboarding.json` | B | |
| `app/routines/**`, `app/api/routines/**`, `components/program/**`, `messages/*/program.json` | B | |
| `supabase/**` (config, migrations, seed) | C | **Only C creates migration files** |
| `types/index.ts`: the `Database` section | C | Other sections: see §5.3 |
| `lib/supabase/**` (queries, mutations, mappers) | C | |
| `app/session/**`, `app/api/sessions/**`, `app/api/tracking/log`, `app/api/ai/substitute`, `app/api/ai/predict-load`, `app/api/exercises/**` | C | |
| `components/session/**`, `components/exercise/**`, `hooks/useSession.ts`, `hooks/useExercises.ts`, `messages/*/session.json` | C | |
| `AGENTS.md`, `CLAUDE.md`, `docs/**` | Shared | Any developer, one reviewer |

### 4.3 Safety reviewer

`DOMAIN-RULES.md` is safety-critical. Dev B is the **training-science reviewer** and must review
any change to volume, load, injury, recovery or movement-pattern logic, wherever it lives. Dev C
is the second reviewer for Dev B's own safety-critical PRs.

---

## 5. Collaboration rules

### 5.1 Git workflow

- Trunk-based: `main` is always releasable. Use short-lived branches, ideally merged within 1–3
  days.
- Branch names follow `AGENTS.md`: `feature/<area>-<topic>`, `fix/<topic>`, `refactor/<topic>`.
  Prefix them with the task ID, for example `feature/P2-B2-onboarding-wizard`.
- Commits use the imperative mood ("Add routine generation endpoint").
- Squash-merge PRs. Rebase on `main` at least daily.
- One task card per PR. Split large tasks into several PRs, each green on its own.
- Never force-push to `main`. Never rewrite shared history. Never commit `.env.local`.
- The stale remote branch `origin/BranchTest` should be reviewed and deleted by its creator.
  Deleting it requires human approval.

### 5.2 Pull requests

The PR description must contain:

1. The task ID and a link to its card in this document.
2. What changed and why. Keep it short.
3. A **Verification** section with:
   - local `npm run lint` and `npm run build` output (pass/fail)
   - the browser screens and states checked: default, loading, empty, error
   - an explicit "not tested" statement for anything not verified
4. Spec updates made, if behavior diverged from a spec (PROP-06).
5. For safety-critical changes: the `DOMAIN-RULES.md` §6 invariants checklist, completed.

Reviews:

| Change type | Required approvals |
|---|---|
| Standard | 1 reviewer, preferably the owner of the touched domain |
| Safety-critical (`lib/training/**`, `lib/ai/prompts.ts`, `lib/ai/service.ts`, routine generation, substitution filtering, volume calculation) | 2 reviewers, including Dev B |
| Migrations (`supabase/migrations/**`) | Dev C authors, plus 1 reviewer. Applying to the hosted project also needs human approval |
| Contract changes after Phase 1 (`types/index.ts`, Zod schemas, API shapes) | All three must be notified, plus 1 reviewer from each affected domain |

Reviews should be done within one working day. A blocked reviewer hands off explicitly.

### 5.3 Hot-spot files

| File | Rule |
|---|---|
| `types/index.ts` | Organized in domain sections in this order: Shared, Auth/Profile, Onboarding, Training, Plan, Session, Tracking, AI, Database. Each owner edits only their sections. Keep PRs touching it small and merge them quickly. Never redefine a type elsewhere (`AGENTS.md`) |
| `lib/constants.ts` | Dev B only. Others request additions |
| `lib/ai/prompts.ts`, `lib/ai/schemas.ts` | One function per feature. The owner of the feature edits its function, and B reviews |
| `messages/**` | Edit only your own namespace files (PROP-03). Keep keys alphabetically sorted. Add EN and ES in the same PR |
| `supabase/migrations/**` | Dev C only (§5.4) |
| `app/layout.tsx`, `proxy.ts` | Dev A only. Others request changes such as new protected routes |
| `package.json`, `package-lock.json` | Announce new dependencies before installing. Use `npm` only, one dependency change per PR. A modified `package-lock.json` is currently uncommitted on one machine: commit it deliberately or discard it, don't leave it lingering |

### 5.4 Database change requests

1. The requester describes the change (table, columns, constraints, RLS impact) in the task
   thread or PR.
2. Dev C writes the migration as a **new timestamped file**. Applied migrations are never edited.
3. Everyone runs `npx supabase db reset` locally after pulling.
4. Dev C updates the `Database` section of `types/index.ts` and the mappers in the same PR.
5. Applying to the hosted project is batched at phase gates, after human approval (`AGENTS.md`).

### 5.5 Communication

- **Kickoff for each phase (30 min):** confirm task cards, owners and the gate checklist.
- **Daily async update:** each person posts done, next and blocked.
- **Contract changes:** announce before merging, never after.
- **Gate review (45 min):** walk the gate checklist together in a browser on one machine.

---

## 6. Phase overview and gates

```
Phase 0  Stabilize            A ║ B ║ C   (three independent tracks)
   │ G0: repo green, themed UI, local DB works for all three
Phase 1  Contracts            A + B + C   (short, joint, contract-first)
   │ G1: types, schemas, API shapes and fixtures merged and frozen
Phase 2  First vertical slice A ║ B ║ C
   │ G2: sign up → onboard → generate plan → start session → log sets
Phase 3  Complete E2E         A ║ B ║ C
   │ G3: + program view, substitution, progress dashboard
Phase 4  Hardening            A + B + C
     G4: release-ready (pending approvals for RLS, hosted migration, deploy)
```

A gate passes only when **every** item on its checklist is verified on `main`. Work for the next
phase may start in branches before a gate passes, but it is not merged until the gate passes.

---

## 7. Phase 0: Stabilize

**Goal:** `main` builds, lints, renders the design system and runs against local Supabase on all
three machines. The three tracks touch different files, so they run fully in parallel.

### Dev A: UI foundation and routing

**P0-A1: Fix shared component typing (S)**
- Fix compound sub-components (`Card.Header/Body/Footer`, `Modal.Body/Footer`) on `forwardRef`
  components.
- Fix `lib/design-tokens.ts:317` (`.default` on a string).
- Files: `components/shared/Card.tsx`, `Modal.tsx`, `lib/design-tokens.ts`.
- Done when: the `tsc` errors in these files are gone and the component API is unchanged.

**P0-A2: Wire Tailwind v4 design tokens (M)**
- Load the tokens (`@config` in `globals.css`, or move them into `@theme`). Set the dark
  "Kinetic Precision" theme as primary, and fix the `content` globs.
- Files: `app/globals.css`, `tailwind.config.ts`.
- Done when: `bg-surface-container`, `text-on-surface` and `bg-primary` render the palette
  colors in the browser, verified on an existing page.

**P0-A3: Migrate `middleware.ts` to `proxy.ts` (M)**
- Read `node_modules/next/dist/docs/` for the `proxy` convention first.
- Call `getUser()` once. Redirect unauthenticated users to `/login?next=<path>`.
- Remove unused variables and non-null `!` assertions on env vars.
- Keep protecting `/dashboard`, `/session`, `/progress`, `/routines`, `/history`,
  `/onboarding`.
- Done when: no deprecation warning, and protected pages redirect to `/login`. `/login` can be a
  placeholder until P2-A1.

**P0-A4: Clean up the auth API (S)**
- Remove the debug `console.log` calls.
- Add Zod input validation to the login and signup routes.
- Map Supabase errors to the codes in `user-authentication.md` §10. Never return raw Supabase
  messages.
- Remove the duplicate client-side profile insert in `AuthContext.signUp` **after** P0-C3 adds
  the DB trigger.
- Files: `app/api/auth/**`, `contexts/AuthContext.tsx`.

**P0-A5: Install and configure `next-intl` (M)**
- Read the `next-intl` docs for the App Router without locale prefixes (PROP-02).
- Create `i18n/` config and namespace files (PROP-03).
- Move the hard-coded strings in `app/session/page.tsx` and
  `components/session/exercise-substitution.tsx` into `messages/*/session.json`, coordinating
  with C.
- Set `<html lang>` dynamically.
- Done when: switching the locale cookie swaps EN and ES on the session page.

### Dev B: training logic and AI layer

**P0-B1: Create `lib/training/` and fix the math (M, safety-critical)**
- Move `lib/utils/volume.ts` and `lib/utils/load-translation.ts` into `lib/training/` and update
  their imports.
- Volume: fix the field names (`weightUsed`, `repsCompleted`). Provide
  `calculateTonnage(setLogs)` and `countWeeklySetsByMuscle(...)`. The caps count **sets**
  (`DOMAIN-RULES.md` §2).
- Load translation: implement `DOMAIN-RULES.md` §3.2 using `LOAD_TRANSLATION` constants. Never
  hard-code factors. Round to available increments.
- Add `epley(weight, reps)` (`DOMAIN-RULES.md` §4.4).
- Done when: the D2 and D3 type errors are gone and the §15 verification table for these
  functions passes.

**P0-B2: AI configuration and resilience (M, safety-critical)**
- Create `lib/ai/config.ts` with the model IDs (DEC-03) and timeouts: 30 s for Sonnet calls,
  5 s for predict-load.
- Create the Anthropic provider lazily (not at module load) and fail with a typed error when the
  key is missing.
- Check the `ai@7` types for deprecated call options (for example `system` vs `instructions`)
  and migrate.
- Add a shared wrapper: validate with Zod → on failure, log, then retry once with a clarified
  prompt → return a typed `fallback` result (`AGENTS.md` AI rules).
- Files: `lib/ai/config.ts`, `lib/ai/service.ts`.

**P0-B3: Rewrite `predictNextLoad` with `generateObject` (S, safety-critical)**
- Add `PredictiveLoadSchema` (`progress-tracking.md` §8). Move the prompt into
  `lib/ai/prompts.ts` using Context → Task → Constraints → Output Format, with an example.
- Fallback: most recent logged set, otherwise calibration (no fabricated number).

**P0-B4: Draft domain vocabularies for review (S, needs product-owner sign-off)**
- Canonical equipment vocabulary matching `EquipmentType`.
- The injury zone → restricted movement patterns table (`DOMAIN-RULES.md` §7 open question).
- A proposal for classifying isolation exercises (curls, raises, leg extension, calf raise) that
  currently borrow compound patterns.
- Deliver these as a PR to `lib/constants.ts` plus a short section in `DOMAIN-RULES.md`, marked
  "Proposed".
- **Blocks:** P0-C3 (seed fixes) and P2-B1 (injury validator). See Q1–Q2 in §18.

### Dev C: data layer

**P0-C1: Set up local Supabase (M)**
- `npx supabase init` (creates `supabase/config.toml`), `npx supabase start`,
  `npx supabase db reset`. All three existing migrations must apply cleanly.
- Write the exact steps into §14 of this document if they differ.
- Requires Docker. Update the "No Docker required" line in `AGENTS.md`.
- Done when: A and B have both followed §14 and run the app against local Supabase.

**P0-C2: Align database types and add mappers (M)**
- Rewrite the `Database` section of `types/index.ts` to match the SQL exactly: snake_case rows,
  add `workout_plans` and `set_logs`, remove non-column fields.
- Create `lib/supabase/mappers.ts` for row ↔ domain conversion (snake_case to camelCase).
- Fix `getUserProfile` so `experienceLevel` and `createdAt` resolve.
- Update the wrong claim in `AGENTS.md` that "the client converts".
- Done when: the dashboard shows the experience level from a real profile.

**P0-C3: Data fixes migration (M, needs P0-B4)**
- One new migration that:
  - adds a profile-creation trigger on `auth.users` (fixes D10)
  - adds `user_profiles.units` (`kg`/`lb`, default `kg`)
  - adds a unique constraint on `exercises.name`
  - makes the seed idempotent (`ON CONFLICT`)
  - corrects movement patterns, equipment names and `resistance_profile` per P0-B4
  - enables RLS on `exercises` (D12)
- Applying it locally is fine. The RLS change and the hosted apply wait for human approval.

**P0-C4: Environment check (S)**
- Confirm with the human owner that `ANTHROPIC_API_KEY` is a real key (D14). Never print it.
- Add local-Supabase example values to `.env.example`.
- Document or remove the unused `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### Gate G0

- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass on `main`
- [ ] Shared components render with the dark palette in the browser
- [ ] `proxy.ts` is in place, with no middleware deprecation warning. Protected routes redirect
      to `/login`
- [ ] EN/ES switch works on the session page
- [ ] All three developers run the app against local Supabase, and `db reset` is clean
- [ ] An AI substitution call succeeds with the new model ID (real key confirmed)
- [ ] The P0-B4 vocabularies are approved or explicitly deferred by the product owner

---

## 8. Phase 1: Contracts

**Goal:** freeze the interfaces between the three domains, so Phase 2 can be built in parallel
without integration surprises. Keep it short. Most cards are types plus Zod schemas plus
fixtures, with no UI.

All contract PRs are reviewed by **all three** developers.

| Card | Owner | Deliverable |
|---|---|---|
| **P1-B1** | B | `OnboardingData` v2 type and `OnboardingSchema` (`lib/validation/onboarding.ts`) for all 9 steps (`WIREFRAME-BRIEF.md` §3.1): goal, experience, biometrics, injuries `{zone, severity, notes?}[]`, availability `{days 2–6, minutes 30–90}`, equipment preset or list, preferred split, optional 1RM or best-set entries |
| **P1-B2** | B | A strict `WorkoutPlanSchema` with no `z.any()`, covering plan → microcycles → planned sessions → planned exercises, each with a `rationale`. Types `GenerateRoutineRequest` / `GenerateRoutineResponse`, plus the error codes from `personalized-routine-builder.md` |
| **P1-B3** | B | `lib/training/` function signatures: `validateWeeklyVolume`, `validateRecovery`, `validateInjuryExclusion`, `validateEquipment`, `resolveSplit`. Each returns `{ ok, violations[] }`. Bodies can still be stubs |
| **P1-C1** | C | Session and tracking contracts: `StartSessionRequest`/`Response`, `ActiveSessionResponse`, `LogSetRequest`/`Response` (`progress-tracking.md` §5), substitution confirm/undo shapes, and the error codes |
| **P1-C2** | C | Signatures for the RPC functions (PROP-05): `create_plan_with_sessions`, `log_set`, `substitute_session_exercise`, `undo_substitution`. Write the SQL now or in P2-C1 |
| **P1-C3** | C | Typed fixtures in `lib/fixtures/` (profile, onboarding data, plan, active session, set history), used only for UI development until real APIs land. Never imported by API routes |
| **P1-A1** | A | Auth contracts (PROP-01 decided), `HistoryResponse` and `VolumeResponse` (`progress-tracking.md` §5), and the route map below |
| **P1-A2** | A | The i18n namespace skeleton (empty files for every namespace, EN and ES), plus an app-shell route skeleton with the bottom tabs Today, Program, Progress, Profile, on placeholder pages |

**Route map** (owned by A, final in P1-A1):

| Route | Owner | Protected |
|---|---|---|
| `/login`, `/signup`, `/reset-password`, `/reset-password/confirm` | A | No |
| `/` (Today) | A | Yes. Redirects to `/onboarding` if onboarding is incomplete |
| `/profile` | A | Yes |
| `/onboarding` | B | Yes |
| `/routines`, `/routines/[id]` (Program) | B | Yes |
| `/session`, `/session/[id]` | C | Yes |
| `/progress`, `/history` | A | Yes |

### Gate G1

- [ ] All P1 cards merged, and `tsc`, `lint` and `build` are green
- [ ] Each developer confirms they can build their Phase 2 UI against the fixtures alone
- [ ] Contracts are frozen. Changes from here on follow the §5.2 contract-change rule

---

## 9. Phase 2: First vertical slice

**Goal:** a new user can sign up, complete onboarding, get a validated AI-generated plan, start
the first session from that plan and log sets, all persisted in local Supabase.

### Dev A: auth and shell

**P2-A1: Auth pages (L)**
- `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`, built with react-hook-form
  and Zod (DEC-06).
- `PasswordStrengthIndicator`. All component states from `user-authentication.md` §4.
- Redirect back to `next` after login. Signup lands on `/onboarding`.
- Reset requests always report success, to prevent email enumeration.
- Spec: `docs/features/user-authentication.md`.

**P2-A2: Auth edge cases (M)**
- Session-expired message.
- Multi-tab sign-out via `onAuthStateChange`.
- A profile-missing recovery path.
- A friendly error for rate-limit responses.

**P2-A3: App shell and Today screen (M)**
- Bottom tabs.
- The Today states (`WIREFRAME-BRIEF.md`):
  - no plan: "Create your routine"
  - plan with today's session: "Start workout"
  - rest day
  - active session in progress: "Resume"
- Uses C's sessions API, or the fixtures until P2-C2 lands.

**P2-A4: Profile view (S)**
- Email, name, join date, units preference, language switch, and log out (`UserMenu`).

### Dev B: onboarding and generation

**P2-B1: Implement the safety validators (L, safety-critical)**
- Implement the P1-B3 signatures against `DOMAIN-RULES.md`:
  - hard volume caps (DEC-07 for fat-loss and endurance)
  - 48–72 h recovery
  - injury exclusion via the P0-B4 table
  - equipment availability
  - split resolution, including the split-conflict result
- Complete the §15 verification tables.

**P2-B2: Onboarding wizard (L)**
- The 9 steps, a review step and the split-conflict card. Use the shared components only.
- Injury map: a front/back SVG silhouette with about 10 zones and a severity sheet. The asset is
  reused later by Progress.
- Wizard state is held in a client provider and saved to the profile via C's
  `updateOnboarding`, so answers survive a reload or retry.
- Specs: `WIREFRAME-BRIEF.md` §3.1, `personalized-routine-builder.md` (except its 5-step
  layout).

**P2-B3: Routine generation API (L, safety-critical)**
- `POST /api/routines/generate`. The handler:
  1. checks auth and validates the input with Zod
  2. loads the profile server-side as the authoritative context
  3. selects candidate exercises filtered by equipment and injuries
  4. builds the prompt from `lib/constants.ts` values
  5. calls `generateObject` with a 30 s timeout
  6. runs the P2-B1 validators. On violation, it retries once with the violations listed, then
     falls back to the rule-based generator, which is validated the same way
  7. persists via C's `create_plan_with_sessions`
  8. returns the plan with its rationale
- Add the calibration-week flag when no 1RM is given.

**P2-B4: Generating screen (S)**
- Staged progress copy, a retry state, and a safe error state that never shows raw output.

### Dev C: data and workout

**P2-C1: Queries, mutations and RPCs (L)**
- In `lib/supabase/`:
  - `updateOnboarding`, `getCandidateExercises(filters)`
  - `createPlanWithSessions` (RPC), `getPlans`, `getPlan`
  - `getActiveSession`, enforcing the one-active-session invariant from `DOMAIN-RULES.md` §5
  - `startSession(plannedSessionId)`, `getSession`
  - `logSet` (RPC: insert into `set_logs`, update `completed` flags, complete the session on the
    last set, reject duplicates)
  - `completeSession` and the summary payload
- All functions are typed and go through the mappers.

**P2-C2: Session and routine read APIs (M)**
- `GET /api/routines/list`, `GET /api/routines/[id]`, `GET /api/sessions/active`,
  `POST /api/sessions` (start), `GET /api/sessions/[id]`, and `POST /api/tracking/log` with
  every error code from `progress-tracking.md` §5.
- Store weights canonically in kg, using `lib/training/units.ts` (coordinate with B).

**P2-C3: Active session screen (L)**
- Replace the mock data on `/session/[id]` with real data:
  - exercise focus view
  - `SetLogRow` with steppers, and RIR required on the last set
  - `RestTimer` (absolute end timestamp, survives backgrounding)
  - calibration-week variant
  - session summary
- Keep the primary actions in the bottom-third thumb zone at 390×844.
- Spec: `progress-tracking.md` §3–§4.

### Gate G2: E2E part 1

Run in a browser against local Supabase, in EN and in ES:

- [ ] Sign up → verify the profile row exists (trigger) → land on `/onboarding`
- [ ] Complete all 9 steps with one injury → the review shows a split conflict when expected
- [ ] Generate a plan → the plan respects the volume caps for the experience level, excludes the
      injured pattern, and uses only available equipment. Checked against the §15 checklist
- [ ] With the AI key removed, generation falls back to a validated rule-based plan with a
      visible rationale
- [ ] Today shows "Start workout" → the session starts → sets are logged → the rest timer
      auto-starts → the last set requires RIR → the summary shows tonnage
- [ ] Double-tapping "Log set" creates exactly one `set_logs` row
- [ ] Logout, then a protected route redirects to `/login`, and logging in returns to it
- [ ] `lint` and `build` are green. Revisit NA-01 to NA-03 (Vitest, CI, Playwright)

---

## 10. Phase 3: Complete the end-to-end milestone

**Goal:** add the Program view, production-grade substitution, load prediction and the Progress
dashboard.

### Dev A: insights

**P3-A1: Tracking read APIs (M)**
- `GET /api/tracking/history` (cursor pagination) and `GET /api/tracking/volume`:
  - weekly e1RM series with `trained: false` / `e1rm: null` gaps, never interpolated
  - personal records
  - weekly **sets** per muscle compared against the caps
- Uses B's `lib/training/` functions and C's queries. A requests any new queries from C.

**P3-A2: `VolumeVsCapChart` component (M)**
- Built first in this phase, because B's Program view reuses it.
- Bars with cap markers, and deload-week styling so a planned deload isn't shown as a problem.

**P3-A3: Progress dashboard and History (L)**
- Install Recharts (announce the dependency).
- `ProgressHeroChart`: e1RM lines, a `% / kg / volume` toggle, a tap-to-inspect tooltip with the
  raw set notation, a dashed projection, and an empty state.
- `HistoryList` and a per-session recap.
- Spec: `progress-tracking.md`, `WIREFRAME-BRIEF.md` §3.5.

### Dev B: program

**P3-B1: Program UI (L)**
- Plan overview, week view (day chips with split labels), session detail, the "Why this plan?"
  accordion (AI rationale), and weekly volume vs. cap using A's `VolumeVsCapChart`.

**P3-B2: Refine and regenerate (M, safety-critical)**
- Free-text refinement → regenerate through the same validated pipeline → show a diff summary →
  confirm or cancel.

**P3-B3: Microcycle context for tracking (S)**
- Expose the current week's `Microcycle.focus` (deload or not) so A's dashboard can suppress
  false warnings (`progress-tracking.md` §7).

**P3-B4: Substitution safety review (S)**
- Review C's substitution filters and prompt against `DOMAIN-RULES.md` §3, the pattern lock and
  the injury exception.

### Dev C: substitution and prediction

**P3-C1: Substitution backend hardening (L, safety-critical)**
- Add auth to `/api/ai/substitute`.
- Load the profile and injuries server-side.
- Fetch candidates from the DB, so suggestions carry canonical exercise IDs and no AI-generated
  UUIDs.
- Apply deterministic filters: confidence ≥ 0.5, pattern lock with the injury exception,
  equipment, muscle overlap.
- Translate load with `lib/training/`.
- Add pain-warning detection, the error codes 401/404/422/429/502, and a server-side
  pattern-filtered fallback.
- Spec: `intelligent-exercise-substitution.md`.

**P3-C2: Substitution UI and persistence (L)**
- Split the panel into `SubstitutionReasonPicker`, `SubstitutionSuggestionCard`,
  `SubstitutionResult` and `SubstitutionConfirmation`.
- Delete the hard-coded bench-press fallback (D13).
- Persist via the `substitute_session_exercise` RPC, keeping `substitutedFrom`, sets and RIR
  unchanged.
- 5 s undo. A `409 EXERCISE_MISMATCH` response triggers a refetch in logging.

**P3-C3: Predict-load wiring (M)**
- `POST /api/ai/predict-load` uses B's rewritten `predictNextLoad`.
- `OverloadBadge` shows the rationale.
- After the 5 s timeout, fall back silently to the last set, then to calibration.

### Gate G3: full E2E milestone

- [ ] The full G2 script passes again
- [ ] Program view shows the plan, its rationale and the volume vs. cap
- [ ] Mid-session substitution, for example a barbell bench with the rack busy:
      - 1–3 same-pattern suggestions with translated load, preserved sets and RIR
      - confirm, then undo
      - pain text triggers the stop-and-assess warning
- [ ] The overload badge appears on the second session of an exercise and shows the calibration
      copy on the first
- [ ] Progress shows the e1RM trend with a gap for an untrained week, the volume vs. cap and the
      history recap
- [ ] All screens checked at 390×844 and 1440 px, in EN and ES

---

## 11. Phase 4: Hardening and release preparation

| Card | Owner | Work |
|---|---|---|
| P4-1 | All | **Cross-QA swap:** A tests B's slice, B tests C's, C tests A's, using each spec's §13 testing checklist. File issues, and the owner fixes them |
| P4-2 | A | ES parity and copy review. Run the +35% label-width check from `WIREFRAME-BRIEF.md` |
| P4-3 | A | Accessibility pass: keyboard order, focus rings, screen-reader labels, 48 px targets |
| P4-4 | C | Rate limiting on `/api/ai/*` (roughly 50 req/min upstream, so add a per-user limit) |
| P4-5 | C | RLS policy review and hosted migration plan. **Stop for human approval** before applying |
| P4-6 | A | Voice logging (stretch, roadmap item): `/api/ai/voice-parse` with Haiku and Zod, a mic UI and the manual fallback. It writes through C's `onLog` contract |
| P4-7 | B | Refresh the `DOMAIN-RULES.md` §6 invariants audit across all AI paths |
| P4-8 | All | Doc refresh: `AGENTS.md` (models, `proxy.ts`, Docker/local Supabase, case mapping), `docs/README.md` index, feature spec statuses, `README.md` schema pointer (the migrations are the source of truth) |
| P4-9 | Human | Deployment target decision and deploy. **Requires approval** |

### Gate G4

- [ ] Every P4 card is closed or explicitly deferred
- [ ] Zero known safety-invariant violations
- [ ] Approvals recorded for RLS, the hosted migrations and the deploy

---

## 12. Dependency map and critical path

```
P0-B4 vocabularies ──► P0-C3 seed/trigger migration ──► P2-B1 injury validator
P0-C1 local DB ──► P0-C2 DB types/mappers ──► P1-C1/C2 contracts ──► P2-C1 queries+RPCs
P0-B1 training lib ──► P1-B3 validator signatures ──► P2-B1 validators ──► P2-B3 generation
P1-B2 plan schema ──► P2-C1 create_plan RPC ──► P2-B3 generation persists ──► P2-C3 session from plan
P0-A3 proxy.ts ──► P2-A1 auth pages
P0-A5 i18n ──► every UI card
P3-A2 VolumeVsCapChart ──► P3-B1 Program volume section
P0-B3 predictNextLoad ──► P3-C3 predict-load wiring
P0-B1 load translation ──► P3-C1 substitution
```

**Critical path:** P0-C1 → P0-C2 → P1 contracts → P2-C1 → P2-B3 → P2-C3 → G2.
Dev C's data layer is on it twice. Protect C's time:

- C does not take ad-hoc requests during Phase 2 until P2-C1 is merged.
- A and B build against the fixtures (P1-C3) instead of waiting.
- If C slips, A (who has the lightest Phase 2) picks up the read-only queries from P2-C2.

---

## 13. Workload balance

Relative effort per phase (S = small, M = medium, L = large):

| Phase | Dev A | Dev B | Dev C |
|---|---|---|---|
| 0 | S + M + M + S + M | M + M + S + S | M + M + M + S |
| 1 | 2 cards | 3 cards | 3 cards |
| 2 | L + M + M + S | L + L + L + S | L + M + L |
| 3 | M + M + L | L + M + S + S | L + L + M |
| 4 | Parity, a11y, voice | Invariants audit | Rate limit, RLS |

Dev B and Dev C carry the heaviest Phase 2 loads. Rebalancing levers, in order of preference:

1. **A takes P2-B4** (the generating screen) and the review-step UI of the wizard.
2. **A takes the read-only APIs in P2-C2** (`routines/list`, `routines/[id]`, `sessions/[id]`
   GET).
3. **A takes P3-C3** (predict-load wiring), since it sits next to the dashboard data.

Check the balance at every phase kickoff and move cards explicitly. Record the move in this
document.

---

## 14. Local development setup

Prerequisites: Node (version not yet pinned, see `AGENTS.md` "Not Confirmed"), npm, and Docker
Desktop (for local Supabase).

```bash
git clone https://github.com/andrescontreras/gym-ai.git && cd gym-ai
npm install
npx supabase start            # first run pulls Docker images; prints local URL and keys
npx supabase db reset         # applies all migrations + seed
cp .env.example .env.local    # then fill in the local Supabase URL/keys and your Anthropic key
npm run dev                   # http://localhost:3000
```

- After pulling a new migration, run `npx supabase db reset`. Local data is disposable.
- Each developer uses their own Anthropic key or a shared team key. Never paste keys in chat,
  PRs or logs.
- Only Dev C points a local checkout at the **hosted** project, and only to apply approved
  migrations.
- Dev C confirms these commands in P0-C1 and corrects this section if they differ.

---

## 15. Verification without an automated test runner

NA-01 to NA-03 mean no test runner and no CI yet. Until those are revisited:

### 15.1 Pure functions (`lib/training/`)

Each function's PR includes a table of input, expected output and actual output, checked by
running the function in a scratch script or the browser console. The script is not committed.
Minimum cases:

| Function | Cases |
|---|---|
| `epley` | `(100, 1) → 103.3`, `(75, 9) → 97.5`, `(0, 10) → 0` |
| `translateLoad` barbell → dumbbell | 80 kg barbell bench → about 34 kg per hand (80 ÷ 2 × 0.85), rounded to the available increment (`intelligent-exercise-substitution.md` §7) |
| `countWeeklySetsByMuscle` | Sets are counted per primary muscle. Tonnage is not used |
| `validateWeeklyVolume` | Beginner at 13 chest sets → violation. Intermediate at 18 → ok. Fat-loss uses the hypertrophy caps (DEC-07) |
| `validateRecovery` | The same muscle trained within 48 h → violation |
| `validateInjuryExclusion` | A shoulder injury excludes every pattern mapped to that zone in P0-B4 |
| `resolveSplit` | 3 days + "PPL" → ok. 2 days + "PPL" → conflict with a suggested alternative |

### 15.2 AI paths

For each AI endpoint, run and record:

1. the happy path
2. a missing or invalid API key → fallback
3. an injected invalid output (temporarily) → retry, then fallback
4. a safety violation in the output → caught by the validators

### 15.3 UI

The `AGENTS.md` browser checklist applies: default, loading, empty and error states, at
390×844 and 1440 px, in EN and ES. **State explicitly in the PR anything that was not tested.**

---

## 16. Handing a task to an AI agent

Every task card above is written to be self-contained. To give one to an AI coding agent in a new
session, paste this prompt and fill in the brackets:

```text
You are working in the Gym AI repository (Next.js 16, TypeScript, Tailwind 4, Supabase,
Vercel AI SDK v7, Zod v4).

Before writing any code, read in this order:
1. AGENTS.md (mandatory operating rules)
2. docs/TEAM-IMPLEMENTATION-PLAN.md: sections 3 (decisions), 4 (ownership), 5 (rules), and the
   card [TASK-ID]
3. docs/DOMAIN-RULES.md (safety-critical, if the task touches training logic or AI)
4. [Feature spec path, e.g. docs/features/progress-tracking.md], sections [x-y]
5. The existing files listed in the task card

Your task: [TASK-ID] [title]. You are acting as [Dev A/B/C].
Only modify files owned by your domain (plan §4.2). If you need a change in another owner's
file, stop and describe the required change instead of making it.

Constraints:
- No `any`, no `@ts-ignore`. Types only in types/index.ts. Prompts only in lib/ai/prompts.ts.
- Every AI decision carries a user-visible rationale, and every AI output is Zod-validated.
- Never hard-code UI strings. Use next-intl messages in your namespace (EN and ES).
- Next.js 16: read node_modules/next/dist/docs/ instead of relying on memory.
- Do not run migrations against the hosted Supabase project, change RLS on hosted, deploy, or
  delete data. Stop and ask.

Definition of done:
- npm run lint and npm run build pass (paste the result)
- Acceptance criteria from the task card are met
- The UI is verified in the browser (or you say explicitly that you could not test it)
- If behavior diverges from a spec, update that spec in the same change
Finish with a short summary: files changed, verification done, open questions.
```

Tips for agent sessions:

- One card per session. Start a new session for the next card. Context from earlier cards should
  live in the repo (code and docs), not in chat history.
- Ask the agent to read the card's input files before planning. Ask for a short plan before it
  edits anything on L-sized cards.
- Have a different agent session (or a teammate) review safety-critical PRs, using
  `DOMAIN-RULES.md` §6 as the checklist.

---

## 17. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Phase 0 uncovers further build errors hidden behind the current 10 | Medium | Delays G0 | Each track fixes only its own files. If a hidden error appears, the first person to see it posts it and the file owner fixes it |
| R2 | Product-owner decisions (§18) arrive late | Medium | Blocks P0-C3 and P2-B1 | Build to the proposed defaults, marked "Proposed", and keep the mapping in one constants table so a later change is cheap |
| R3 | `types/index.ts` merge conflicts | High | Slows everyone | §5.3 sections, small PRs, contract freeze after G1 |
| R4 | The AI produces unsafe plans that pass the schema | Medium | Safety | Deterministic validators after every AI call, retry with the violations, then a validated fallback. Two-reviewer rule |
| R5 | No automated tests lets math regress | Medium | Wrong volume or loads | §15 tables in PRs. Revisit Vitest at G2 (NA-01) |
| R6 | No CI lets broken `main` merges through | Medium | Blocks the team | Mandatory local lint/build output in PRs. Revisit CI at G2 (NA-02) |
| R7 | Rate limits and cost from 3 developers plus agents calling Claude | Medium | Throttling or cost | Haiku for cheap paths, fixtures for UI work, a per-user rate limit in P4-4 |
| R8 | Docker or local Supabase setup issues on one machine | Low | One developer blocked | Pair on P0-C1. Temporary fallback: a personal hosted Supabase project for that developer, never the shared one |
| R9 | Specs drift from code again | Medium | Agents follow stale specs | PROP-06: spec updates travel in the same PR |
| R10 | Dev C overload on the critical path | Medium | Delays G2 | The §13 rebalancing levers, and fixtures-first UI work |

---

## 18. Open questions for the product owner

| # | Question | Blocks | Default until answered |
|---|---|---|---|
| Q1 | Approve the injury zone → restricted pattern table (P0-B4)? | P0-C3, P2-B1, P3-C1 | Dev B's proposal, conservative (exclude when in doubt) |
| Q2 | How should isolation exercises be classified (a new pattern vs. the nearest compound)? | P0-C3, substitution pattern lock | Add an explicit isolation classification. Never cross into compound patterns |
| Q3 | Final volume caps for fat-loss and endurance goals? | P2-B1 | Hypertrophy caps (DEC-07) |
| Q4 | Is email verification required before using the app? | P2-A1 | Not required in MVP. Show a banner |
| Q5 | Should RPE be shown in MVP, or stay hidden (`WIREFRAME-BRIEF.md` §3.3)? | P2-C3 | Hidden. RIR only |
| Q6 | Substitution scope "All future sessions" in MVP? | P3-C2 | "Just today" only |
| Q7 | Mid-program substitution: does e1RM history continue under the original exercise or start fresh? | P3-A1 | Separate series, with a substitution badge |
| Q8 | Plate and dumbbell rounding increments? | P0-B1, P3-C1 | 2.5 kg barbell, 2 kg dumbbell (configurable constant) |
| Q9 | Pain-warning copy: does it need medical or legal review? | P3-C1 | Use the spec copy, flagged for review before a hosted release |
| Q10 | Revisit Vitest, CI and Playwright? | Quality from G2 on | Revisit at the G2 gate review |
| Q11 | Deployment target (Vercel assumed)? | P4-9 | No deployment until decided |

---

**Maintained by:** the Gym AI team. When a card's owner changes, a decision is made or a gate
passes, update this document in the same PR.
