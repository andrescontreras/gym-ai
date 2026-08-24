<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

> Operating rules for AI agents and new developers working in the Gym AI repository.
> **Companion docs:** [`docs/DOMAIN-RULES.md`](docs/DOMAIN-RULES.md) (training science &
> AI logic) · [`docs/WIREFRAME-BRIEF.md`](docs/WIREFRAME-BRIEF.md) (design decisions & screens)

---

## Project Overview

Gym AI is an intelligent strength-training and hypertrophy app — a **personal trainer in
your pocket**. Unlike static workout templates, it uses generative and algorithmic AI to:

1. **Generate personalized routines** adapted to goals, injuries, schedule, equipment
2. **Enable real-time substitutions** with biomechanically equivalent alternatives
3. **Optimize training volume** to maximize gains without overtraining
4. **Minimize tracking friction** via voice input for sets/reps/weight
5. **Secure user authentication** with registration, login, logout, and session management to protect personal fitness data

Five main features:

| # | Feature | AI model |
|---|---------|----------|
| 1 | Onboarding → Routine Builder | Claude 3.5 Sonnet |
| 2 | Real-time Exercise Substitution | Claude 3.5 Sonnet |
| 3 | Volume Tracking, Progressive Overload & Voice Logging | Claude 3.5 Haiku (parsing) |
| 4 | User Authentication & Management | N/A (Supabase Auth) |

**Any change to training logic, volume math, or exercise selection must be checked against
`docs/DOMAIN-RULES.md`.** Those rules are safety-critical, not stylistic.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS 4 + Shadcn UI (Radix primitives)
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:** Vercel AI SDK + Anthropic Claude 3.5 Sonnet / Haiku
- **Auth:** Supabase Auth (Phase 1 core feature — see [docs/features/user-authentication.md](docs/features/user-authentication.md))
- **Package manager:** npm — do not introduce pnpm/yarn commands

---

## Setup Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server → localhost:3000
```

Create `.env.local` at the repo root before running (see **Security & Secrets**).
No Docker or local database is required — Supabase is hosted.

---

## Development Workflow

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build — run before deploying
npm run start        # start production server
npm run lint         # ESLint — fix issues before committing
```

### Before starting any task

1. Read the existing `types/`, `lib/`, and `components/` before creating new files
2. Cross-reference the SQL schema in `README.md` when touching database queries
3. Import types from `types/index.ts` — never redefine them locally

### Quick reference

| Task | Pattern |
|------|---------|
| Add a type | Edit `types/index.ts` |
| Add an API route | `app/api/[name]/route.ts` |
| Add a page | `app/[name]/page.tsx` |
| Add a Shadcn component | `npx shadcn@latest add [component]` |
| Add a database query | New function in `lib/supabase/` |
| Add an AI prompt | Add to `lib/ai/prompts.ts` |
| Add a utility | Add to `lib/utils/` |
| Import alias | `@/` → project root |

---

## Repository Structure

```
gym-ai/
├── app/                    # App Router pages & API routes
│   ├── api/
│   │   ├── ai/            # AI substitution endpoints
│   │   └── exercises/     # Exercise CRUD endpoints
│   ├── session/           # Active workout session pages
│   └── layout.tsx         # Root layout: fonts & global styles
├── components/
│   ├── ui/                # Shadcn primitives — NEVER modify directly
│   ├── session/           # Session management components
│   ├── exercise/          # Exercise card/detail components
│   └── ai/                # AI suggestion display components
├── lib/
│   ├── supabase/          # Supabase client & database queries
│   ├── ai/                # Prompts, context builders, validation
│   └── utils/             # cn(), formatters
├── types/                 # TypeScript & database types
├── hooks/                 # Custom React hooks
└── docs/                  # DOMAIN-RULES.md, WIREFRAME-BRIEF.md
```

### Naming conventions

- **kebab-case** for file names: `exercise-card.tsx`, `ai-substitution.ts`
- **PascalCase** when the file exports a default component: `ExerciseCard.tsx`
- **lowercase** for utility/helper files: `client.ts`, `prompts.ts`
- Colocate tests with source: `exercise-card.test.tsx`

---

## Code Style

### TypeScript

- **No `any`.** No `@ts-ignore`, no `as any`.
- All types live in `types/index.ts` — single source of truth
- `interface` for object shapes, `type` for unions/intersections
- `import type { Exercise } from '@/types'` where possible
- Rely on inference when obvious: `const name = "test"`, not `const name: string = "test"`

### React & Next.js

- **Server Components by default** — add `"use client"` only for interactivity, hooks, or browser APIs
- Prefer composition over prop drilling
- App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`
- **Next.js 16 has breaking changes vs. 14.** Do not rely on training data for Next.js
  patterns — read `node_modules/next/dist/docs/` and check for deprecation warnings

### Styling

- Tailwind utility classes, mobile-first (`md:`, `lg:` prefixes)
- `cn()` from `lib/utils/cn.ts` for conditional classes:
  ```tsx
  <div className={cn("base-class", isActive && "active-class")} />
  ```
- `globals.css` only for true globals — prefer Tailwind over custom CSS

### AI integration

- Prompts live in `lib/ai/prompts.ts` — **never inline in components**
- Prompt structure: **Context → Task → Constraints → Output Format**; include examples
- **Every AI response is validated with a Zod schema** via `generateObject`
- On validation failure: log → retry once with a clarified prompt → fall back to manual mode
- Never expose raw AI output — always wrap in typed interfaces
- **Every AI decision carries a `rationale` / `justification` field shown to the user.**
  Explainability is a product requirement, not a nice-to-have
- Substitution prompts must always receive user profile + injury history

### Database

- All queries go through `lib/supabase/` — no inline Supabase client code in components
- Use typed queries with the `Database` type from `types/index.ts`
- Design for multi-tenancy now — RLS will be enabled before production
- pgvector similarity uses **cosine distance**
- camelCase in TS (`muscleGroup`) vs snake_case in DB (`muscle_group`) — the client converts,
  but watch this in raw SQL

---

## Testing Instructions

- **Manual browser testing is REQUIRED for every UI/frontend change:**
  1. `npm run dev`
  2. Navigate to the affected screens
  3. Exercise the interactions
  4. Check empty, loading, and error states
- Type checking and linting verify **code correctness, not feature correctness**
- **If you could not test the UI, say so explicitly in your response.** Do not imply
  verification that did not happen
- **Do not mock the database** — integration tests hit Supabase (or local Supabase)

**Not confirmed:** no automated test runner is configured yet — no `npm test` script exists.
Confirm the intended framework (Vitest / Jest / Playwright) before adding tests.

---

## Git & Pull Requests

- **Branches:** `feature/ai-substitution`, `fix/session-update`, `refactor/types`
- **Commits:** imperative mood, concise
  - ✅ "Add AI substitution endpoint"
  - ✅ "Fix session exercise update logic"
  - ❌ "Added some changes to the API"

### Definition of Done

1. `npm run lint` passes
2. `npm run build` succeeds
3. Feature manually tested in the browser, including edge states
4. No `.env.local` or secrets staged
5. No new types outside `types/index.ts`
6. Any AI-driven decision surfaces a user-visible rationale
7. Training-logic changes verified against `docs/DOMAIN-RULES.md`

---

## Security & Secrets

Required in `.env.local` (**never committed**):

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # server-only — NEVER expose to client
ANTHROPIC_API_KEY=                 # server-only — NEVER expose to client
NEXT_PUBLIC_APP_URL=               # localhost:3000 in dev
```

Rules:
- Use the `NEXT_PUBLIC_` prefix **only** for values safe to ship to the browser
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are server-side only
- Never paste real secret values into chat, issues, PRs, or logs — redact as `REDACTED`
- RLS is not yet enabled; treat all data access as if it were

### Actions requiring explicit human approval

Agents must **stop and ask** before:
- Running or generating database migrations against a shared/hosted Supabase project
- Deleting or truncating any table or user data
- Rotating or regenerating API keys
- Deploying to any hosted environment
- Enabling or altering RLS policies
- Force-pushing, rewriting history, or deleting branches

---

## What NOT to Do

❌ Mock the database in integration tests
❌ Bypass TypeScript (`@ts-ignore`, `as any`)
❌ Inline AI prompts in components
❌ Create duplicate types outside `types/index.ts`
❌ Add comments explaining WHAT code does — code should be self-documenting
❌ Add features beyond the task — no premature abstractions, no "nice to haves"
❌ Commit without browser testing
❌ Modify `components/ui/` Shadcn primitives directly
❌ Show an AI decision without a rationale
❌ Exceed the weekly volume caps in `docs/DOMAIN-RULES.md` — they are hard limits, not defaults
❌ Cross movement patterns in substitutions unless the original is injury-restricted
❌ Rely on training data for Next.js 16 APIs — read `node_modules/next/dist/docs/`

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Next.js API behaves unlike documented online examples | Next.js 16 breaking changes | Read `node_modules/next/dist/docs/`; ignore Next 14 patterns |
| Supabase query returns `null` fields unexpectedly | camelCase vs snake_case mismatch | Check raw SQL / column names; the JS client converts, raw queries do not |
| AI response fails Zod validation | Model drift or an under-specified prompt | Log the raw output, retry once with a clarified prompt, then fall back to manual mode |
| Claude calls fail intermittently | Rate limit ≈ 50 req/min (tier dependent) | Back off and retry; batch where possible |
| Voice input does nothing | Web Speech API unsupported (some iOS/Safari contexts) | Show the manual-entry fallback state |
| Streaming UI stuck in loading | Vercel AI SDK streaming is async | Verify loading-state handling and stream termination |
| RLS-related permission errors | RLS not yet enabled but policies referenced | Confirm intended policy with the owner before changing anything |

---

## Roadmap Context

**Current phase:** Phase 1 — MVP Foundation.
Done: project setup, schema, type definitions, AI service structure, file structure,
wireframe alignment.
In progress: onboarding UI, routine-generation endpoint, active session UI, substitution
endpoint, voice input, volume tracking UI, exercise seeding (100+ with embeddings), User Authentication & Management (signup, login, logout, password reset, session handling, protected routes).

**Next milestone:** working end-to-end flow — onboarding → routine generation → active
session → substitution → tracking.

Phase 2 and 3 items (fatigue algorithms, video library, advanced analytics, semantic search)
are **out of scope** — do not build ahead of the roadmap.

---

## Reference Links

- Next.js 16 (local, authoritative): `node_modules/next/dist/docs/`
- Supabase JS: https://supabase.com/docs/reference/javascript
- Anthropic API: https://docs.anthropic.com
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Shadcn UI: https://ui.shadcn.com/docs/components

---

## Not Confirmed

Items lacking repository evidence — confirm before relying on them:

- [ ] Node version — no `.nvmrc` or `engines` field verified
- [ ] Test runner and `npm test` script — none configured
- [ ] CI/CD system and which checks must be green to merge — no workflow files verified
- [ ] Deployment target — Vercel assumed but unconfirmed
- [ ] Whether a local Supabase (`supabase start`) setup is used for integration tests
- [ ] i18n library for the planned EN/ES support — `next-intl` vs. alternatives
- [ ] Chart library for the Progress hero chart — Recharts vs. Visx vs. hand-rolled SVG

<!-- END:nextjs-agent-rules -->
