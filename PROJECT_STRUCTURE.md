# Gym AI - Project Structure

This document outlines the complete file organization for the Gym AI project.

## Directory Structure

```
gym-ai/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── logout/route.ts
│   │   ├── routines/              # Routine Builder endpoints
│   │   │   ├── generate/route.ts  # POST - AI routine generation
│   │   │   ├── [id]/route.ts      # GET/PUT/DELETE specific routine
│   │   │   └── list/route.ts      # GET - User's routines
│   │   ├── ai/                    # AI-powered endpoints
│   │   │   ├── substitute/route.ts     # POST - Exercise substitution
│   │   │   ├── voice-parse/route.ts    # POST - Voice input parsing
│   │   │   └── predict-load/route.ts   # POST - Predictive load
│   │   ├── exercises/             # Exercise CRUD
│   │   │   ├── route.ts           # GET all, POST new
│   │   │   ├── [id]/route.ts      # GET/PUT/DELETE by ID
│   │   │   └── search/route.ts    # POST - Semantic search
│   │   ├── sessions/              # Workout session management
│   │   │   ├── active/route.ts    # GET - Active session
│   │   │   ├── [id]/route.ts      # GET/PUT/DELETE session
│   │   │   └── complete/route.ts  # POST - Mark session complete
│   │   └── tracking/              # Volume & progress tracking
│   │       ├── log/route.ts       # POST - Log set performance
│   │       ├── volume/route.ts    # GET - Weekly volume stats
│   │       └── history/route.ts   # GET - Exercise history
│   ├── onboarding/                # Onboarding flow
│   │   ├── page.tsx               # Multi-step onboarding form
│   │   └── components/            # Onboarding-specific components
│   │       ├── GoalsStep.tsx
│   │       ├── InjuriesStep.tsx
│   │       ├── ScheduleStep.tsx
│   │       └── EquipmentStep.tsx
│   ├── dashboard/                 # User dashboard
│   │   └── page.tsx               # Overview of plans & progress
│   ├── routines/                  # Routine management
│   │   ├── page.tsx               # List of user's routines
│   │   └── [id]/page.tsx          # View/edit specific routine
│   ├── session/                   # Active workout session
│   │   ├── page.tsx               # Current session view
│   │   └── [id]/page.tsx          # Session by ID
│   ├── history/                   # Workout history
│   │   └── page.tsx               # Timeline of past sessions
│   ├── progress/                  # Progress analytics
│   │   └── page.tsx               # Charts & personal records
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles (Tailwind)
│
├── components/                    # React components
│   ├── ui/                        # Shadcn UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ... (other Shadcn components)
│   ├── session/                   # Session-related components
│   │   ├── SessionCard.tsx        # Session overview card
│   │   ├── ExerciseList.tsx       # List of exercises in session
│   │   ├── ExerciseDetail.tsx     # Detailed exercise view
│   │   ├── SubstituteButton.tsx   # "AI Substitute" button
│   │   └── ActiveSessionView.tsx  # Full active session UI
│   ├── exercise/                  # Exercise components
│   │   ├── ExerciseCard.tsx       # Exercise preview card
│   │   ├── ExerciseSearch.tsx     # Search/filter exercises
│   │   └── ExerciseVideo.tsx      # Video player component
│   ├── ai/                        # AI-specific components
│   │   ├── SubstitutionModal.tsx  # Modal with AI suggestions
│   │   ├── SuggestionCard.tsx     # Single suggestion display
│   │   └── VoiceInput.tsx         # Voice recording component
│   ├── tracking/                  # Tracking & logging
│   │   ├── SetLogger.tsx          # Log individual set
│   │   ├── VolumeChart.tsx        # Weekly volume visualization
│   │   ├── ProgressChart.tsx      # Strength progression chart
│   │   └── PersonalRecords.tsx    # PR display
│   ├── routine/                   # Routine components
│   │   ├── RoutineCard.tsx        # Routine overview
│   │   ├── MicrocycleView.tsx     # Weekly breakdown
│   │   └── RoutineGenerator.tsx   # AI routine generation UI
│   └── layout/                    # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
│
├── lib/                           # Core libraries & utilities
│   ├── supabase/                  # Supabase integration
│   │   ├── client.ts              # Supabase client (browser)
│   │   ├── server.ts              # Supabase client (server-side)
│   │   ├── queries.ts             # Database query functions
│   │   └── mutations.ts           # Database mutation functions
│   ├── ai/                        # AI integration
│   │   ├── service.ts             # AI service functions (main)
│   │   ├── prompts.ts             # System prompts & builders
│   │   ├── schemas.ts             # Zod validation schemas
│   │   └── utils.ts               # AI utility functions
│   ├── utils/                     # Utility functions
│   │   ├── cn.ts                  # Class name utility (Tailwind)
│   │   ├── formatters.ts          # Date/number formatters
│   │   ├── volume.ts              # Volume calculation utilities
│   │   └── load-translation.ts    # Load conversion formulas
│   ├── hooks/                     # Custom React hooks (could also be top-level)
│   │   ├── useSession.ts          # Active session state
│   │   ├── useVoiceInput.ts       # Voice recording hook
│   │   └── useVolume.ts           # Volume tracking hook
│   └── constants.ts               # App-wide constants
│
├── types/                         # TypeScript type definitions
│   └── index.ts                   # All types (Exercise, User, Session, etc.)
│
├── hooks/                         # Custom React hooks (if not in lib/)
│   ├── useAuth.ts                 # Authentication hook
│   ├── useSession.ts              # Session management
│   └── useExercises.ts            # Exercise data fetching
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── videos/                    # Exercise demonstration videos
│
├── supabase/                      # Supabase migrations (if using Supabase CLI)
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── .env.local                     # Environment variables (not committed)
├── .env.local.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── README.md                      # Project documentation
├── CLAUDE.md                      # Claude Code instructions
├── AGENTS.md                      # Agent-specific instructions
├── SETUP_GUIDE.md                 # Setup walkthrough
└── PROJECT_STRUCTURE.md           # This file
```

## Key Files Explained

### Core AI Files
- **`lib/ai/service.ts`**: Main AI integration—exports functions like `generateWorkoutPlan()`, `generateExerciseSubstitution()`, `parseVoiceTrackingInput()`
- **`lib/ai/prompts.ts`**: All AI prompts and prompt builders (structured, versioned)
- **`lib/ai/schemas.ts`**: Zod schemas for validating AI responses

### Database Layer
- **`lib/supabase/client.ts`**: Browser-side Supabase client (uses anon key)
- **`lib/supabase/server.ts`**: Server-side Supabase client (can use service role key)
- **`lib/supabase/queries.ts`**: Read-only database queries (e.g., `getActiveSession()`, `getExerciseById()`)
- **`lib/supabase/mutations.ts`**: Write operations (e.g., `createSession()`, `logSet()`)

### Type System
- **`types/index.ts`**: Single source of truth for all TypeScript types
  - Exercise types
  - User & profile types
  - Session & workout types
  - AI request/response types
  - Volume & progress types
  - Voice input types

### Component Organization
- **`components/ui/`**: Shadcn UI primitives (Button, Card, Input, etc.)—**never modify directly**
- **`components/session/`**: Session-specific components (active workout view)
- **`components/ai/`**: AI interaction components (substitution modal, voice input)
- **`components/tracking/`**: Logging and progress visualization

### API Routes
- **`app/api/routines/generate/route.ts`**: POST endpoint for AI routine generation
- **`app/api/ai/substitute/route.ts`**: POST endpoint for exercise substitution
- **`app/api/ai/voice-parse/route.ts`**: POST endpoint for voice input parsing
- **`app/api/tracking/log/route.ts`**: POST endpoint for logging set performance

## Data Flow Examples

### 1. Onboarding → Routine Generation
```
User fills onboarding form
  → POST /api/routines/generate { onboardingData, userProfile }
  → lib/ai/service.ts: generateWorkoutPlan()
  → Calls Claude Sonnet with buildRoutineBuilderPrompt()
  → Validates response with WorkoutPlanSchema (Zod)
  → Saves to Supabase: workout_plans table
  → Returns plan with AI rationale
  → User sees generated routine
```

### 2. Active Session → Exercise Substitution
```
User clicks "Substitute" button on an exercise
  → Opens SubstitutionModal component
  → User inputs reason (voice or text)
  → POST /api/ai/substitute { exerciseId, reason, currentLoad }
  → lib/ai/service.ts: generateExerciseSubstitution()
  → Calls Claude Sonnet with buildSubstitutionPrompt()
  → Validates response with SubstitutionResponseSchema
  → Returns 3 alternatives with load adjustments
  → User selects one, updates session
  → PUT /api/sessions/[id] with new exercise
```

### 3. Voice Logging
```
User presses mic button on SetLogger component
  → components/ai/VoiceInput.tsx captures audio
  → Transcribes with Web Speech API
  → POST /api/ai/voice-parse { transcription, exerciseContext }
  → lib/ai/service.ts: parseVoiceTrackingInput()
  → Calls Claude Haiku (fast) with buildVoiceParsingPrompt()
  → Validates with VoiceParsingSchema
  → Returns { reps: 12, weight: 40, weightUnit: 'kg' }
  → Auto-fills form fields
  → User confirms, POST /api/tracking/log
```

## Development Guidelines

### Adding New Features
1. **Define types first** in `types/index.ts`
2. **Create API route** in `app/api/[feature]/route.ts`
3. **Add AI logic** (if needed) in `lib/ai/service.ts` + `prompts.ts`
4. **Build UI components** in `components/[feature]/`
5. **Create page** in `app/[feature]/page.tsx`
6. **Test end-to-end** in browser

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `ExerciseCard.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `volume-calculator.ts`)
- **Pages**: `page.tsx` (Next.js convention)
- **API routes**: `route.ts` (Next.js convention)

### Import Aliases
- `@/types` → `types/index.ts`
- `@/lib` → `lib/`
- `@/components` → `components/`
- `@/app` → `app/`

## Next Steps

To start development:
1. Set up environment variables (`.env.local`)
2. Initialize Supabase schema (see `README.md`)
3. Begin with onboarding UI (`app/onboarding/page.tsx`)
4. Implement routine generation API (`app/api/routines/generate/route.ts`)
5. Build active session UI (`app/session/page.tsx`)
6. Add substitution logic (`app/api/ai/substitute/route.ts`)

See `CLAUDE.md` for detailed coding conventions and domain logic.
