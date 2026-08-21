# Gym AI - Setup Guide

> **Status**: Foundation infrastructure is complete and working! ✅

This guide walks you through setting up the Gym AI project from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com)) - *Optional for testing, required for AI features*

## Quick Start (5 Minutes)

### 1. Clone & Install

```bash
cd gym-ai
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a **Database Password** (save this!)
3. Select your preferred **Region**
4. Wait for initialization (~2 minutes)

### 3. Get Your Supabase Credentials

Navigate to **Project Settings** → **API**:

Copy these values:
- **Project URL** - e.g., `https://azjccxgcuvkakedklscq.supabase.co`
- **anon/public key** (may show as "publishable key") - starts with `sb_publishable_` or `eyJ...`
- **service_role key** (secret!) - starts with `sb_secret_` or `eyJ...`

### 4. Configure Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your-secret-key-here

# Anthropic API (optional for testing)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Corporate Network Users**: Add this line for SSL issues:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # Development only!
```
### 5. Apply Database Migrations

**Three migrations need to be applied in order:**

#### Migration 1: Initial Schema
Go to Supabase SQL Editor and run: `supabase/migrations/20260708000000_initial_schema.sql`

This creates:
- `exercises` table with pgvector support
- `user_profiles` table
- `workout_plans` table
- `workout_sessions` table
- `session_exercises` table
- `set_logs` table
- All indexes

#### Migration 2: Enable Row Level Security
Run: `supabase/migrations/20260822000000_enable_rls.sql`

This enables:
- RLS on all tables
- Policies ensuring users only access their own data
- Read-only access to exercises for authenticated users

#### Migration 3: Seed Exercise Data
Run: `supabase/migrations/20260823000000_seed_exercises.sql`

This seeds:
- **50+ exercises** across 8 movement patterns
- Push Horizontal (8 exercises)
- Push Vertical (6 exercises)
- Pull Horizontal (6 exercises)
- Pull Vertical (5 exercises)
- Squat (6 exercises)
- Hinge (7 exercises)
- Lunge (5 exercises)
- Carry (3 exercises)
- Isolation movements (7 exercises)

**Verify migrations worked:**
```sql
-- Should return 50+
SELECT COUNT(*) FROM exercises;

-- Should show RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
### 6. Run the Development Server

**Standard:**
```bash
npm run dev
```

**Corporate Network (SSL issues):**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✅ Verify Setup

### Test 1: Check Redirect (Middleware Working)
Visit: http://localhost:3000/dashboard

**Expected:** Redirects to `/` (home page) because you're not logged in
**What this confirms:** 
- ✅ Middleware is protecting routes
- ✅ Auth system is working
- ✅ No console errors

### Test 2: Create a Test User
**Option A: Via Supabase Dashboard**
1. Go to your Supabase project → Auth → Users
2. Click "Add user" → "Create new user"
3. Email: `test@test.com`, Password: `testpassword123`
4. ✅ Check "Auto Confirm User"
5. Click "Create user"

**Option B: Via API** (Console in browser)
```javascript
fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'myemail@gmail.com',
    password: 'mypassword123',
    name: 'My Name'
  })
}).then(r => r.json()).then(console.log)
```

### Test 3: Log In and Access Dashboard
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'testpassword123'
  })
}).then(r => r.json()).then(console.log)
```

**Expected:** `{ success: true }`

**If user was created via Supabase dashboard**, add profile manually:
```sql
INSERT INTO user_profiles (id, email, name, experience_level)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'test@test.com',
  'Test User',
  'beginner'
);
```

### Test 4: View Dashboard
Visit: http://localhost:3000/dashboard

**Expected result:**
- ✅ Shows "Welcome, [Your Name]!"
- ✅ Displays experience level
- ✅ Sign out button works
- ✅ No console errors

---

## Troubleshooting

### SSL Certificate Error (`unable to get local issuer certificate`)
**Cause:** Corporate network with self-signed certificates

**Fix:** Add to `.env.local`:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```
Or run with: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev`

⚠️ **Development only! Never use in production!**

### "Email rate limit exceeded"
**Cause:** Too many signup attempts in quick succession

**Fix:** 
- Wait 5-10 minutes
- Use a different email address
- Or create user via Supabase dashboard

### "Profile not found" after login
**Cause:** User created via dashboard didn't create profile row

**Fix:** Run SQL to create profile (see Test 3 above)

### "Export createClient doesn't exist"
**Cause:** Hot reload didn't pick up changes

**Fix:** Restart dev server completely

---

## ✅ Setup Complete!

**What's Working:**
- ✅ Authentication (signup, login, logout)
- ✅ Protected routes with middleware
- ✅ Database connection with RLS
- ✅ 50+ exercises seeded
- ✅ User profiles
- ✅ Working dashboard

**Your team can now start building features!** 🚀

## Next Steps for Feature Teams

Refer to the **Foundation Complete Summary** in the main README.md:

**Feature A:** Personalized Routines (onboarding + AI routine builder)
**Feature B:** Exercise Substitutions (real-time AI suggestions)
**Feature C:** Volume Optimization (analytics dashboard)
**Feature D:** Workout Logging (session tracking + voice input)

Each feature has its own routes, tables, and components - **no conflicts!**
