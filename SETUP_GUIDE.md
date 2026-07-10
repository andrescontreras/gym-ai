# Gym AI - Setup Guide

This guide walks you through setting up the Gym AI project from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Step-by-Step Setup

### 1. Clone & Install

```bash
cd gym-ai
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (~2 minutes)
3. Navigate to **Project Settings** → **API**
4. Copy the following:
   - **Project URL** (starts with `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### 3. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 4. Configure Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Database Schema

Go to your Supabase project:

1. Open the **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the SQL from the README.md (Section 3)
4. Click **Run** (or press F5)

This creates:
- `exercises` table (with pgvector for semantic search)
- `user_profiles` table
- `workout_sessions` table
- `session_exercises` table
- All necessary indexes

### 6. (Optional) Seed Exercise Database

You can add sample exercises to test the app:

```sql
INSERT INTO exercises (name, muscle_group, movement_pattern, equipment, description) VALUES
('Barbell Bench Press', 'Chest', 'push_horizontal', ARRAY['barbell', 'bench'], 'Classic horizontal pressing movement for chest development'),
('Dumbbell Bench Press', 'Chest', 'push_horizontal', ARRAY['dumbbells', 'bench'], 'Unilateral pressing with greater range of motion'),
('Push-ups', 'Chest', 'push_horizontal', ARRAY['bodyweight'], 'Bodyweight horizontal press, scalable for all levels'),
('Barbell Back Squat', 'Legs', 'squat', ARRAY['barbell', 'squat rack'], 'Fundamental lower body compound movement'),
('Goblet Squat', 'Legs', 'squat', ARRAY['dumbbell', 'kettlebell'], 'Beginner-friendly squat variation with anterior load'),
('Deadlift', 'Posterior Chain', 'hinge', ARRAY['barbell'], 'Hip hinge pattern for posterior chain development'),
('Romanian Deadlift', 'Posterior Chain', 'hinge', ARRAY['barbell', 'dumbbells'], 'Hip hinge with emphasis on hamstrings'),
('Pull-ups', 'Back', 'pull_vertical', ARRAY['pull-up bar'], 'Vertical pulling for back and biceps'),
('Lat Pulldown', 'Back', 'pull_vertical', ARRAY['cable machine'], 'Machine-based vertical pull'),
('Barbell Row', 'Back', 'pull_horizontal', ARRAY['barbell'], 'Horizontal pulling for back thickness');
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verify Setup

You should see:
- ✅ No console errors related to environment variables
- ✅ Supabase client connecting successfully
- ✅ The Next.js default page (we'll build the UI next)

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing env vars

### Database connection errors
- Verify your Supabase project is active
- Check that the anon key matches your project
- Ensure the database schema was created successfully

### TypeScript errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall

## Next Steps

Now that setup is complete, you can:

1. **Build the Active Session UI** (`app/session/page.tsx`)
2. **Create Exercise components** (`components/exercise/`)
3. **Implement the AI substitution endpoint** (`app/api/ai/substitute/route.ts`)
4. **Add authentication** (Supabase Auth)

Refer to the main `README.md` for the development roadmap.
