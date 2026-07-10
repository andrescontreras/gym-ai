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

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

You'll need:
- **Supabase**: Create a project at [supabase.com](https://supabase.com)
- **Anthropic API Key**: Get one at [console.anthropic.com](https://console.anthropic.com)

### 3. Set Up Database (Supabase)

Run the following SQL in your Supabase SQL Editor:

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

### Phase 1: MVP Foundation (Current)
- [x] Project setup & database schema
- [x] Type definitions for all core features
- [x] AI service structure (routine builder, substitution, voice parsing)
- [ ] Supabase auth flow
- [ ] Onboarding UI (multi-step form)
- [ ] Routine Builder API endpoint
- [ ] Active Session UI
- [ ] Exercise Detail component
- [ ] AI Substitution API endpoint
- [ ] Exercise database seeding (100+ exercises)

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
