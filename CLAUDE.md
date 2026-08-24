# Gym AI - Project Instructions

## Project Overview

Gym AI is an intelligent strength training and hypertrophy app that acts as a **personal trainer in your pocket**. Unlike static workout templates, Gym AI uses generative and algorithmic AI to:

1. **Generate Personalized Routines** - Creates custom workout plans adapted to goals, injuries, schedule, and equipment
2. **Enable Real-Time Substitutions** - Provides biomechanically equivalent exercise alternatives on-the-fly
3. **Optimize Training Volume** - Calculates optimal volume to maximize gains without overtraining
4. **Minimize Tracking Friction** - Voice input support for logging sets/reps/weight
5. **User Authentication & Management** - Secure user identity management with registration, login, logout, and session handling to protect personal fitness data

**Core Value Proposition**: A fully personalized, adaptive training system that respects injury limitations, prevents overtraining, and maintains biomechanical integrity—all powered by AI reasoning about movement patterns, muscle activation, periodization, and progressive overload.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **UI**: Tailwind CSS 4 + Shadcn UI (Radix primitives)
- **Database**: Supabase (PostgreSQL + pgvector for semantic search)
- **AI**: Vercel AI SDK + Anthropic Claude 3.5 Sonnet
- **Auth**: Supabase Auth (Phase 1 core feature — see [docs/features/user-authentication.md](docs/features/user-authentication.md))
- **Package Manager**: npm

## Architecture & File Organization

```
gym-ai/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # API routes
│   │   ├── ai/           # AI substitution endpoints
│   │   └── exercises/    # Exercise CRUD endpoints
│   ├── session/          # Active workout session pages
│   └── layout.tsx        # Root layout with fonts & global styles
├── components/
│   ├── ui/               # Shadcn UI primitives (Button, Card, etc.)
│   ├── session/          # Session management components
│   ├── exercise/         # Exercise card/detail components
│   └── ai/               # AI suggestion display components
├── lib/
│   ├── supabase/         # Supabase client & database queries
│   ├── ai/               # AI prompts, context builders, validation
│   └── utils/            # Utility functions (cn, formatters)
├── types/                # TypeScript type definitions & database types
└── hooks/                # Custom React hooks
```

### File Naming Conventions

- **kebab-case** for all file names: `exercise-card.tsx`, `ai-substitution.ts`
- **PascalCase** for component files when exported as default: `ExerciseCard.tsx`
- **lowercase** for utility/helper files: `client.ts`, `prompts.ts`
- Colocate tests with source files: `exercise-card.test.tsx`

### Component Structure

- Keep server components as the default (Next.js App Router)
- Use `"use client"` directive ONLY when needed (interactivity, hooks, browser APIs)
- Prefer composition over prop drilling
- Extract Shadcn UI components to `components/ui/` (never modify directly)

## Development Workflow

### Before Starting Work

1. **Check existing structure**: Read relevant files in `types/`, `lib/`, and `components/` before creating new ones
2. **Verify database schema**: Cross-reference with README.md SQL schema when working with database queries
3. **Use TypeScript strictly**: All types are in `types/index.ts` — import from there, don't redefine

### Scripts & Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (run before deploying)
npm run start        # Start production server
npm run lint         # ESLint (fix issues before committing)
```

### Git Workflow

- **Branch naming**: `feature/ai-substitution`, `fix/session-update`, `refactor/types`
- **Commit messages**: Imperative mood, concise
  - ✅ "Add AI substitution endpoint"
  - ✅ "Fix session exercise update logic"
  - ❌ "Added some changes to the API"
- **Before committing**:
  1. Run `npm run lint` to catch errors
  2. Test the feature in the browser (not just type checking)
  3. Check no `.env.local` or secrets are staged

### Testing Strategy

- **Manual testing is REQUIRED** for UI/frontend changes
  - Start dev server: `npm run dev`
  - Navigate to affected pages and test interactions
  - Test edge cases (empty states, errors, loading states)
- Type checking and linting verify code correctness, NOT feature correctness
- If you can't test the UI, explicitly state that in your response

## Code Style & Conventions

### TypeScript

- **No `any` types** — use proper types from `types/index.ts` or define new ones there
- Use type inference where obvious: `const name = "test"` not `const name: string = "test"`
- Prefer `interface` for object shapes, `type` for unions/intersections
- Import types with `import type` when possible: `import type { Exercise } from '@/types'`

### React & Next.js

- **Server Components by default** — only add `"use client"` when necessary
- Use Next.js App Router conventions:
  - `page.tsx` for routes
  - `layout.tsx` for shared layouts
  - `route.ts` for API endpoints
  - `loading.tsx` for loading states
  - `error.tsx` for error boundaries
- **IMPORTANT**: Next.js 16 has breaking changes — always check `node_modules/next/dist/docs/` for current API patterns before implementing features

### Styling

- Use **Tailwind CSS** utility classes
- Follow mobile-first responsive design: `md:`, `lg:` prefixes
- Use `cn()` utility (from `lib/utils/cn.ts`) for conditional classes:
  ```tsx
  <div className={cn("base-class", isActive && "active-class")} />
  ```
- Prefer Tailwind over custom CSS — only use `globals.css` for true globals

### AI Integration

**Model Selection**:
- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`):
  - Use for: Routine builder, exercise substitution
  - Why: Complex reasoning, safety-critical decisions, biomechanical analysis
  - Latency: ~2-5 seconds (acceptable for these use cases)
  
- **Claude 3.5 Haiku** (`claude-3-5-haiku-20241022`):
  - Use for: Voice parsing, predictive load calculations
  - Why: Speed-optimized, simple NLP tasks
  - Latency: <1 second (critical for voice UX)

**Prompt Engineering Best Practices**:
- Keep prompts in `lib/ai/prompts.ts` — NEVER inline in components
- Structure prompts with clear sections: Context → Task → Constraints → Output Format
- Use **Zod schemas** for structured output validation (via `generateObject`)
- Include examples in prompts for consistent formatting
- For substitution: Always pass user profile + injury history for safety

**Response Validation**:
- ALL AI responses MUST be validated with Zod schemas before reaching the client
- If validation fails: Log error, retry once with clarified prompt, then fallback to manual mode
- Never expose raw AI responses—always wrap in typed interfaces

**Transparency & Justification**:
- Every AI decision MUST include a `rationale` or `justification` field
- Users see WHY the AI made a choice (e.g., "Chose dumbbell press because barbell bench is unavailable")
- Build trust through explainability

### Database (Supabase)

- All queries go through `lib/supabase/` — never inline Supabase client code in components
- Use typed queries with `Database` type from `types/index.ts`
- Row Level Security (RLS) will be enabled — design queries with multi-tenancy in mind
- **pgvector semantic search** for exercise similarity — use cosine distance

## Domain-Specific Guidelines

### 1. Routine Builder Logic (Onboarding → AI Generation)

When building the routine generation features:

**Injury-Aware Programming (Priority #1)**:
- **Veto restricted patterns**: If user has knee pain with `restrictedPatterns: ['squat']`, completely exclude deep squats
- **Replace with safe alternatives**: Deep squat → hip thrust, leg press, or split squat (depending on equipment)
- **Document rationale**: In `aiRationale`, explain: "Avoided deep squats due to knee pain; replaced with hip thrusts for glute development"

**Anti-Overtraining Volume**:
Calculate optimal weekly volume per muscle group based on experience level:
- **Beginner**: 10-12 sets per muscle group per week
- **Intermediate**: 12-18 sets per muscle group per week
- **Advanced**: 16-22 sets per muscle group per week

These are **HARD CAPS**—exceeding them increases injury risk without additional benefit.

**Intelligent Split Design**:
- **Recovery rule**: 48-72 hours between training the same muscle group
- **Split examples**:
  - 3 days/week → Full Body (Mon/Wed/Fri)
  - 4 days/week → Upper/Lower (Mon/Tue/Thu/Fri)
  - 5-6 days/week → Push/Pull/Legs (rotating)
- **Session duration**: Fit exercises within user's specified time (e.g., 60 minutes → 8-10 exercises max)

**Periodization**:
- Structure plans in **microcycles** (weekly blocks):
  - **Accumulation**: Higher volume, moderate intensity (e.g., 4 sets × 10 reps)
  - **Intensification**: Lower volume, higher intensity (e.g., 3 sets × 6 reps)
  - **Deload**: 40-50% volume reduction every 4-6 weeks
- Default mesocycle length: **8-12 weeks** for hypertrophy goals

**Exercise Selection Hierarchy**:
1. Match user's available equipment
2. Avoid injury-restricted patterns
3. Prioritize compound movements (squat, deadlift, bench, row, overhead press)
4. Add isolation exercises for lagging muscle groups
5. Include 1-2 core/stabilization exercises per session

---

### 2. Exercise Substitution Logic

When building AI substitution features:

**Biomechanical Equivalence (Priority #1)**:
- **Match movement pattern FIRST**: If original is `push_horizontal`, replacement MUST be `push_horizontal`
- **Match muscle group SECOND**: Primary + synergist muscles should overlap ≥80%
- **Equipment is negotiable**: Barbell → dumbbell → machine → bodyweight (in order of preference)

**Load Translation (Critical)**:
- **Don't just swap exercises**—calculate adjusted weight/reps to maintain stimulus
- **Factors to consider**:
  - **ROM differences**: Dumbbell bench press has ~20% more ROM than barbell → reduce weight by 10-15%
  - **Stability demands**: Free weights → machine (increase weight by 10-20%)
  - **Unilateral vs bilateral**: Barbell bench 80kg → dumbbell bench 32.5kg per hand (not 40kg)
  - **Resistance profile**: Cable exercises maintain tension at peak contraction → may feel harder at same weight

**Load Translation Formula Examples**:
```
Barbell Bench Press 80kg → Dumbbell Bench Press:
  80kg / 2 = 40kg per hand
  Adjust for ROM: 40kg × 0.85 = 34kg per hand

Barbell Back Squat 100kg → Leg Press:
  Leg Press ~= 1.5-1.8× squat weight (due to machine advantage)
  100kg × 1.7 = 170kg leg press

Pull-ups BW → Lat Pulldown:
  User BW = 80kg
  Lat Pulldown ~= 70-75% BW for equivalent difficulty
  80kg × 0.7 = 56kg lat pulldown
```

**Context Awareness**:
- **User experience level**: Beginners get simpler alternatives (machine over free weight)
- **Known injuries**: Never suggest exercises targeting injured areas
- **Equipment availability**: Only suggest what user has access to
- **Space constraints**: "Home workout" → prioritize dumbbell/bodyweight alternatives

**Confidence Scoring**:
- **0.9-1.0**: Near-perfect (same pattern, same muscles, minimal load adjustment)
  - Example: Barbell bench → dumbbell bench
- **0.7-0.8**: Good (same pattern, similar muscles, moderate load adjustment)
  - Example: Barbell row → cable row
- **0.5-0.6**: Acceptable (related pattern, muscle overlap ≥60%)
  - Example: Pull-ups → lat pulldown (vertical pull, but different stability)
- **Below 0.5**: Questionable—warn user or reject

---

### 3. Volume Tracking & Progressive Overload

**RIR (Reps in Reserve) System**:
- **RIR 0**: Absolute failure (couldn't do 1 more rep)
- **RIR 1**: Could've done 1 more rep (very hard)
- **RIR 2**: Could've done 2 more reps (optimal training zone)
- **RIR 3-4**: Could've done 3-4 more reps (too easy, not enough stimulus)

**Progressive Overload Rules**:
- **If last session RIR ≤ 2**: Increase load
  - Upper body: +2.5kg
  - Lower body: +5kg
  - OR add +1 rep if maintaining weight
- **If last session RIR ≥ 4**: Maintain or reduce load (user went too easy or was fatigued)
- **If last session RIR = 0-1 for 2+ weeks**: User might be overreaching—suggest deload

**Volume Calculation**:
- **Total Volume (Tonnage)**: Weight × Reps × Sets
  - Example: 80kg × 10 reps × 3 sets = 2,400kg total volume
- **Weekly Volume per Muscle Group**: Sum all sets targeting that muscle
  - Example: Chest: 3 sets bench + 3 sets incline + 3 sets fly = 9 sets/week

**Voice Input Parsing Rules**:
- Extract: `reps`, `weight`, `weightUnit`, `rir`, `rpe`
- Handle natural language:
  - "Hice 12 repeticiones con 40 kilos" → `{reps: 12, weight: 40, weightUnit: 'kg'}`
  - "Did 10 reps at 80 pounds, RIR 2" → `{reps: 10, weight: 80, weightUnit: 'lb', rir: 2}`
  - "8 reps, could've done 2 more" → `{reps: 8, rir: 2}`
- If confidence < 0.7: Prompt user to confirm parsed data before saving

### 4. Movement Patterns (Biomechanical Taxonomy)

**Primary patterns used throughout the app**:

```typescript
'push_horizontal'  // Bench press, push-ups, chest press machine
                   // Primary: Pectoralis major, anterior deltoid, triceps

'push_vertical'    // Overhead press, pike push-ups, shoulder press machine
                   // Primary: Anterior/medial deltoid, triceps, upper chest

'pull_horizontal'  // Barbell row, dumbbell row, cable row, inverted row
                   // Primary: Latissimus dorsi, rhomboids, rear deltoid, biceps

'pull_vertical'    // Pull-ups, chin-ups, lat pulldown
                   // Primary: Latissimus dorsi, teres major, biceps

'squat'           // Back squat, front squat, goblet squat, leg press
                   // Primary: Quadriceps, glutes, adductors

'hinge'           // Deadlift, Romanian deadlift, good morning, hip thrust
                   // Primary: Hamstrings, glutes, erector spinae

'lunge'           // Walking lunge, reverse lunge, Bulgarian split squat
                   // Primary: Quadriceps, glutes (unilateral emphasis)

'carry'           // Farmer's walk, suitcase carry, overhead carry
                   // Primary: Core stabilizers, traps, grip strength
```

**Pattern Substitution Rules**:
- **NEVER** cross patterns (e.g., don't replace `squat` with `hinge`)
- Within-pattern swaps are preferred (e.g., barbell row → dumbbell row)
- Cross-pattern ONLY if original pattern is injured/restricted (e.g., `squat` → `lunge` if knee pain prevents bilateral squatting)

### Session State Management

- A `WorkoutSession` can have status: `'planned' | 'active' | 'completed'`
- Only ONE session can be `'active'` per user at a time
- When substituting an exercise:
  1. Keep the original exercise ID in `substitutedFrom` field
  2. Update session with new exercise
  3. Preserve sets/reps structure (adjust weight if needed)

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (NEVER expose to client)
ANTHROPIC_API_KEY=                 # Claude API key (server-side only)
NEXT_PUBLIC_APP_URL=               # App URL (localhost:3000 in dev)
```

**Security rules**:
- NEVER commit `.env.local` to git
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client
- NEVER expose `ANTHROPIC_API_KEY` to client
- Use `NEXT_PUBLIC_` prefix ONLY for truly public values

## Known Issues & Gotchas

### Next.js 16 Changes

- **BREAKING CHANGES from Next.js 14** — don't rely on training data for Next.js patterns
- Always read `node_modules/next/dist/docs/` for current APIs before implementing
- The App Router has evolved — check for deprecation warnings

### Supabase Gotchas

- camelCase in TypeScript types (`muscleGroup`) vs snake_case in database (`muscle_group`)
- Automatic conversion handled by Supabase client, but be aware when writing raw SQL
- RLS policies not yet enabled — will be required before production

### AI Integration

- Vercel AI SDK streaming is async — handle loading states properly
- Claude API rate limits: 50 requests/minute (tier dependent)
- Always validate AI responses with Zod — never trust raw output structure

## What NOT to Do

❌ **Don't mock the database** — integration tests should hit Supabase (or local Supabase)
❌ **Don't bypass TypeScript** — no `@ts-ignore` or `as any` shortcuts
❌ **Don't inline prompts** — keep them in `lib/ai/prompts.ts` for versioning/iteration
❌ **Don't create duplicate types** — all types live in `types/index.ts`
❌ **Don't add comments explaining WHAT code does** — the code should be self-documenting
❌ **Don't add features beyond the task** — no premature abstractions or "nice to have" extras
❌ **Don't commit without testing in browser** — type checking is not enough for UI features

## Useful References

- **Next.js 16 Docs**: `node_modules/next/dist/docs/` (local reference)
- **Supabase JS Docs**: https://supabase.com/docs/reference/javascript
- **Anthropic API Docs**: https://docs.anthropic.com
- **Vercel AI SDK Docs**: https://sdk.vercel.ai/docs
- **Shadcn UI Components**: https://ui.shadcn.com/docs/components

## Development Priorities (Roadmap)

Current phase: **MVP Foundation**

### Phase 1: MVP Foundation (Current)
1. ✅ Project setup & database schema
2. ✅ Type definitions (Exercise, User, Session, Volume, Voice, Routine)
3. ✅ AI service structure (routine builder, substitution, voice parsing)
4. ✅ Basic file structure
5. ⏳ Onboarding UI (multi-step form: goals, injuries, schedule, equipment)
6. ⏳ Routine Builder API endpoint (`POST /api/routines/generate`)
7. ⏳ Active Session UI (exercise list, current exercise detail, substitute button)
8. ⏳ AI Substitution API endpoint (`POST /api/ai/substitute`)
9. ⏳ Voice Input Component (Web Speech API integration)
10. ⏳ Volume Tracking UI (charts, personal records)
11. ⏳ Exercise database seeding (100+ exercises with pgvector embeddings)
12. ⏳ User Authentication & Management (Supabase Auth: signup, login, logout, password reset, session handling, protected routes)

### Phase 2: Core Features
- Progressive load prediction (AI-powered)
- Workout history timeline
- Session state management (Redux/Zustand)
- pgvector semantic exercise search
- Deload week detection

### Phase 3: Intelligence & Optimization
- Fatigue management algorithms
- Exercise video library
- Rest timer with notifications
- Advanced analytics dashboard

**Next milestone**: Working end-to-end flow from onboarding → routine generation → active session → substitution → tracking

---

## Quick Reference Card

| Task | Command / Pattern |
|------|-------------------|
| Start dev server | `npm run dev` |
| Add new type | Edit `types/index.ts` |
| Add new API route | `app/api/[name]/route.ts` |
| Add new page | `app/[name]/page.tsx` |
| Add Shadcn component | `npx shadcn@latest add [component]` |
| Database query | Create function in `lib/supabase/` |
| AI prompt | Add to `lib/ai/prompts.ts` |
| Utility function | Add to `lib/utils/` |
| Import path alias | `@/` → project root |

**When in doubt**: Check the README.md for setup details, and this file for development patterns.

@AGENTS.md
