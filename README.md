# Gym AI - Your AI Personal Trainer

An intelligent strength training and hypertrophy app that acts as a **personal trainer in your pocket**. Unlike static workout templates, Gym AI uses generative and algorithmic AI to create personalized routines, enable real-time exercise substitutions, and optimize training volume—all while preventing overtraining and respecting injury limitations.

## 🎯 Core Value Proposition

**The Problem**: Traditional workout apps provide generic, static templates that don't adapt to real-world constraints (equipment occupied, pain/discomfort, limited space) and fail to prevent overtraining.

**Our Solution**: Gym AI combines biomechanical intelligence with user context to:
1. **Generate Personalized Routines** - Not templates. Every plan is custom-built based on your goals, injuries, schedule, and equipment.
2. **Real-Time Exercise Substitutions** - Equipment busy? Feeling shoulder pain? The AI finds biomechanically equivalent alternatives instantly.
3. **Volume Optimization** - Calculates optimal training volume to maximize hypertrophy without overtraining.
4. **Frictionless Tracking** - Voice input support: "I did 12 reps with 40 kilos" → automatically logged.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **UI**: Tailwind CSS 4 + Shadcn UI components
- **Database**: Supabase (PostgreSQL + pgvector for semantic search)
- **AI**: Vercel AI SDK + Anthropic Claude 3.5 Sonnet
- **Voice Input**: Web Speech API / Whisper API (planned)
- **Auth**: Supabase Auth (planned)

## Project Structure

```
gym-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI substitution endpoints
│   │   └── exercises/    # Exercise data endpoints
│   ├── session/          # Active session views
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── session/          # Session-related components
│   ├── exercise/         # Exercise card/detail components
│   └── ai/               # AI suggestion components
├── lib/
│   ├── supabase/         # Supabase client & queries
│   ├── ai/               # AI prompts & logic
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## Getting Started

> **✅ Foundation Complete!** Authentication, database, and core infrastructure are ready.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `ANTHROPIC_API_KEY` - Your Anthropic API key (for AI features)

**Corporate Network Users**: If you encounter SSL certificate errors, add:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0  # Development only!
```

### 3. Apply Database Migrations

The database schema and seed data are already prepared in `supabase/migrations/`. Apply them using Supabase SQL Editor:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project → SQL Editor
2. Run `supabase/migrations/20260708000000_initial_schema.sql` (creates tables)
3. Run `supabase/migrations/20260822000000_enable_rls.sql` (enables security)
4. Run `supabase/migrations/20260823000000_seed_exercises.sql` (seeds 50+ exercises)

**Option B: Using Supabase CLI**
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**What Gets Created:**

```sql
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  movement_pattern TEXT NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  description TEXT,
  video_url TEXT,
  embedding vector(1536), -- For semantic search
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  experience_level TEXT DEFAULT 'beginner',
  injuries TEXT[],
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INT NOT NULL,
  reps INT NOT NULL,
  weight DECIMAL NOT NULL,
  rir INT NOT NULL,
  rest_seconds INT DEFAULT 90,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  substituted_from UUID REFERENCES exercises(id)
);

-- Create indexes
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_movement_pattern ON exercises(movement_pattern);
CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
```

### 4. Run Development Server

```bash
npm run dev
```

**Corporate Network Users**: If you get SSL certificate errors, run:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Test the Setup:**
1. Visit `/dashboard` - should redirect to `/` (not logged in)
2. Create a test user in Supabase dashboard or via API
3. Log in and access `/dashboard` - should show your profile

**Successful setup shows:**
- ✅ Dashboard displays "Welcome, [Your Name]!"
- ✅ Experience level shown
- ✅ Sign out button works
- ✅ No console errors

## 🚀 Core Features

### 1. 🏗️ Routine Builder (Onboarding + AI Generation)
**What it does**: Designs a 100% personalized workout plan optimized for hypertrophy, progression, and adherence.

**Inputs**:
- Goals (hypertrophy, fat loss, strength, endurance)
- Injury history with severity levels
- Training frequency (days/week) and session duration
- Experience level (beginner, intermediate, advanced)
- Available equipment

**AI Magic**:
- **Injury Filter**: Automatically replaces restricted movement patterns (e.g., deep squats → hip thrusts for knee pain)
- **Anti-Overtraining**: Calculates optimal weekly volume per muscle group based on experience level
- **Intelligent Split**: Designs Push/Pull/Legs, Upper/Lower, or Full Body splits guaranteeing 48-72hr recovery
- **Periodization**: Structures training in microcycles (accumulation, intensification, deload)

**Output**:
- Complete mesocycle (8-12 weeks) with weekly progression
- Day-by-day session structure (exercises, sets, reps, rest)
- Natural language explanation of programming decisions

---

### 2. 🔄 Real-Time Exercise Substitution
**What it does**: Replaces exercises on-the-fly while maintaining biomechanical equivalence and training stimulus.

**Inputs**:
- Original exercise context (muscle group, movement pattern, current load)
- Substitution reason: voice or text input (e.g., "Machine occupied", "Shoulder hurts")
- User profile (experience, injuries)

**AI Magic**:
- Matches movement pattern first (push_horizontal, squat, hinge, etc.)
- Matches muscle group second
- **Load Translation**: Calculates adjusted weight/reps for the new exercise (e.g., 80kg barbell → 35kg dumbbells)
- Confidence scoring (0.9-1.0 = near-perfect, 0.7-0.8 = good, <0.7 = questionable)

**Output**:
- 3 biomechanically equivalent alternatives
- Technical justification for each
- Adjusted load recommendations
- Quick-swap UI with one-tap confirmation

---

### 3. 📊 Volume Calculator & Progress Tracking
**What it does**: Zero-friction workout logging with automatic volume calculation and progressive load prediction.

**Inputs**:
- Sets, reps, weight (via manual entry or **voice input**)
- RIR (Reps in Reserve) or RPE (Rate of Perceived Exertion)

**Voice Input Example**:
> User: *presses mic* "I did 12 reps with 40 kilos"  
> App: *auto-fills* 12 reps | 40kg | RIR auto-estimated

**Outputs**:
- **Volume graphs**: Visualize strength/weight progression over time
- **Personal Records**: Track max weight, max volume, max reps per exercise
- **Predictive Load** (Phase 2): AI suggests next session's weight/reps based on RIR history
  - "Last session: 80kg × 8 @ RIR 2 → Next: Try 82.5kg × 8"

---

### 4. 🔐 User Authentication & Profile Management
**Purpose**: Secure access + persistent user state for AI context.

- Email/password + social login (Google/Apple)
- Stores onboarding data (injuries, goals, training frequency) as JSON
- All AI calls reference user profile for personalization

---

### 5. 💾 Exercise Database (Structured & Searchable)
**Purpose**: Foundation for intelligent substitution.

**Each exercise is NOT just a name—it's a structured object**:
```typescript
{
  id, name, muscleGroup, synergistMuscles,
  movementPattern, equipment, resistanceProfile,
  biomechanicalTags, videoUrl, embedding (pgvector)
}
```

**Search capabilities**:
- Semantic search via pgvector (find similar exercises by movement pattern)
- Filter by equipment, muscle group, and biomechanical tags

## 🗺️ Development Roadmap

### Phase 1: MVP Foundation ✅ COMPLETE
- [x] Project setup & database schema
- [x] Type definitions for all core features
- [x] AI service structure (routine builder, substitution, voice parsing)
- [x] **Supabase auth flow** (signup, login, logout, session management)
- [x] **Authentication context & hooks** (useAuth, useProfile)
- [x] **Middleware for route protection**
- [x] **Row Level Security (RLS) policies**
- [x] **Exercise database seeding** (50+ exercises across 8 movement patterns)
- [x] **Shared utilities** (formatters, volume calculations, load translation)
- [x] **Working dashboard with profile display**
- [ ] Onboarding UI (multi-step form) - **READY FOR TEAM**
- [ ] Routine Builder API endpoint - **READY FOR TEAM**
- [ ] Active Session UI - **READY FOR TEAM**
- [ ] AI Substitution API endpoint - **READY FOR TEAM**

### Phase 2: Core Features
- [ ] Voice input integration (Web Speech API / Whisper)
- [ ] Volume tracking UI with charts
- [ ] Progress history & personal records
- [ ] pgvector semantic exercise search
- [ ] Session state management (Redux/Zustand)
- [ ] Workout history timeline

### Phase 3: Intelligence & Optimization
- [ ] Predictive load calculation (AI-powered)
- [ ] Automatic deload week detection
- [ ] Fatigue management algorithms
- [ ] Exercise video library
- [ ] Rest timer with notifications
- [ ] Workout notes & RPE tracking

### Phase 4: Social & Premium
- [ ] Share workout plans with friends
- [ ] Leaderboards & challenges
- [ ] Premium features (advanced analytics, custom AI prompts)
- [ ] Mobile app (React Native/Expo)
- [ ] Wearable integration (Apple Watch, Garmin)

## 🏗️ Technical Architecture

### AI Integration Strategy

**1. Routine Builder**
- Model: Claude 3.5 Sonnet (complex reasoning, safety-critical)
- Input: User profile + onboarding data (JSON)
- Output: Structured workout plan with natural language rationale
- Validation: Zod schemas ensure correct structure

**2. Exercise Substitution**
- Model: Claude 3.5 Sonnet (biomechanical analysis)
- Input: Original exercise + user context + constraint reason
- Output: 3 alternatives with load translation + confidence scores
- Latency: <2 seconds (streamed responses for UX)

**3. Voice Parsing**
- Model: Claude 3.5 Haiku (speed-optimized for NLP)
- Input: Voice transcription (via Web Speech API or Whisper)
- Output: Structured tracking data (reps, weight, RIR)
- Fallback: If confidence <0.7, prompt user to confirm

**4. Predictive Load (Phase 2)**
- Model: Claude 3.5 Haiku + algorithmic rules
- Input: Historical performance (last 3-5 sessions)
- Output: Suggested weight/reps for progressive overload

### Data Architecture

**Supabase Schema**:
```
users (auth.users)
  ↓
user_profiles (onboarding data, goals, injuries)
  ↓
workout_plans (AI-generated mesocycles)
  ↓
workout_sessions (daily workouts)
  ↓
session_exercises (individual exercises with performance logs)

exercises (catalog with pgvector embeddings)
```

**Key Design Decisions**:
- **Embeddings**: pgvector for semantic exercise similarity (movement pattern matching)
- **Volume Tracking**: Denormalized for fast queries (weekly_volume table)
- **RLS**: Row Level Security ensures users only see their own data
- **Caching**: AI responses cached by (userId, exerciseId, reason) to reduce costs

## Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Contributing

This is a personal project. Feel free to fork and adapt to your needs.

## License

MIT
# gym-ai
# gym-ai
# gym-ai
