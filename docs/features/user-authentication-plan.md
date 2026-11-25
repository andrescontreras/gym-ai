# User Authentication — Implementation Plan

> Step-by-step plan for building the feature specified in
> [`user-authentication.md`](user-authentication.md), reconciled with the current code and with
> [`TEAM-IMPLEMENTATION-PLAN.md`](../TEAM-IMPLEMENTATION-PLAN.md). Dev A owns this feature end to
> end, including its migrations (team plan §4.3), and builds it before Progress Tracking.
> Written 2026-11-25 from a read of the repo. Nothing here has been built or browser-tested yet.

---

## 1. Where we are today

| Area | State | Problem |
|---|---|---|
| `app/api/auth/{login,logout,signup}` | Exists | No input validation; raw Supabase messages returned; debug `console.log` that prints part of the Supabase URL (signup); profile inserted with the anon client (fails under RLS when email confirmation is on) |
| `contexts/AuthContext.tsx` | Exists | Inserts the profile a **second** time on signup; reads snake_case rows as camelCase `UserProfile` (D6); `useEffect` missing deps |
| `middleware.ts` | Exists | Deprecated in Next 16 (rename to `proxy.ts`); calls `getUser()` twice; redirects to `/`, which has no login; no `next` return path |
| `app/api/profile` | Exists | Works, but `getUserProfile` returns raw rows cast to `UserProfile` (D6) |
| `user_profiles` table + RLS | Exists | PK is `id` = `auth.users.id` (the spec's `user_id` column does **not** exist); no `updated_at`; no profile-creation trigger |
| Pages `/login`, `/signup`, `/reset-password*`, `/profile` | **Missing** | |
| `/auth/confirm` callback (email links) | **Missing** | Needed for password reset and email verification |
| `components/auth/**`, `components/navigation/**` | **Missing** | |
| `react-hook-form`, `@hookform/resolvers`, `next-intl` | **Not installed** | DEC-05, DEC-06 |
| `supabase/config.toml` (local Supabase) | **Missing** | Needed for local email testing (Mailpit) and auth settings |

## 2. Spec vs. code: decisions to apply

The spec was written before the code. Where they disagree, build to the **right-hand column** and
update the spec in the same PR (PROP-06).

| # | Spec says | Build this instead | Why |
|---|---|---|---|
| S1 | `/api/auth/signin`, `/signout` | Keep `/api/auth/login`, `/logout`; add `/api/auth/reset-password` and `/reset-password/confirm` | PROP-01 |
| S2 | `user_profiles.user_id` FK; queries `.eq('user_id', …)` | `user_profiles.id` **is** the auth user id; `.eq('id', …)` | Existing schema and RLS (`auth.uid() = id`) |
| S3 | Profile created by signup route / mutation, "wrap in a transaction" | DB trigger `on auth.users insert` creates the profile (AUTH-03). Pass `name` via `signUp({ options: { data: { name } } })` | Atomic, works with email confirmation and RLS; fixes D10 |
| S4 | New `email_verified` column | Don't add it. Read `user.email_confirmed_at` from Supabase Auth | Avoids a second source of truth that drifts |
| S5 | New `avatar_url` column | Skip (spec marks it future) | Out of scope |
| S6 | Add `updated_at` | Add (in the AUTH-03 migration) | Needed by `updateUserProfile` |
| S7 | `@supabase/auth-helpers-nextjs`, `zod ^3` | `@supabase/ssr` (installed) and `zod ^4` (installed) | auth-helpers is deprecated |
| S8 | Shadcn `components/ui/{input,label,card,alert}` | `components/shared/{Input,Card,Alert,Button}` | Those are what exist; `components/ui/` only has `button` |
| S9 | Signup/login responses return `accessToken`/`expiresAt` in JSON; logout uses `Authorization: Bearer` | Session lives only in cookies set by `@supabase/ssr`. Responses return `{ success, user }`, never tokens | Returning tokens to JS defeats the point of cookie sessions |
| S10 | Reset confirm takes `{ token, password }` | Email link → `/auth/confirm?token_hash=…&type=recovery` → `verifyOtp` sets a session → `/reset-password/confirm` → `updateUser({ password })` | This is how Supabase recovery works with SSR |
| S11 | `GET /api/auth/me` | Reuse `GET /api/profile` and add `emailVerified` to its response | One endpoint, not two |
| S12 | Redirect to `/dashboard` after login | Redirect to `next` if present and safe, otherwise `/` (Today) | Route map in team plan §5.1 |
| S13 | Hand-rolled `needsRefresh()` at 50 min | Let `@supabase/ssr` refresh in `proxy.ts` and the browser client | Built in; a second refresh loop causes refresh-token reuse errors |
| S14 | Tokens in **httpOnly** cookies | `@supabase/ssr` cookies are **not** httpOnly (the browser client must read them). Accept this and rely on short JWT expiry + CSP, or move all auth to the server | Needs a conscious decision (Q-A below) |

## 3. Open questions (answer before or during AUTH-04)

| # | Question | Default until answered |
|---|---|---|
| Q-A | Is non-httpOnly cookie storage (S14) acceptable for MVP? | Yes; document it in the spec's security section |
| Q-B | Email verification required before using the app? (team plan Q4) | Not required. Show a "verify your email" banner |
| Q-C | "5 failed logins per email per hour": build a custom per-email limiter, or rely on Supabase's built-in per-IP limits? | Rely on Supabase limits; map `429` to `RATE_LIMIT_EXCEEDED`. Custom limiter goes with M4-4 (team plan) |
| Q-D | Disposable-email blocklist and "30-day re-registration block" (spec §7) | Defer. No account deletion in MVP, so the 30-day rule has nothing to act on |
| Q-E | Social login, MFA, "Remember me", account deletion (spec §16) | All out of MVP scope |

---

## 4. Steps

Each card lists its dependencies, the files touched, and a definition of done. Do them in order.
AUTH-01 to AUTH-07 plus the login and signup pages of AUTH-09 are **Auth core** (team plan §8):
they unblock the other features, so ship them first. Everything here is Dev A's to edit, except
where a card says otherwise.

### Phase 0: Foundations

**AUTH-01: Decide on the lockfile and the dependencies (S)**
- Commit or discard the uncommitted `package-lock.json` change first (team plan §6.3).
- Install `react-hook-form` and `@hookform/resolvers` (v5+ supports Zod 4). Use a separate PR
  per dependency change, and announce it to the team.
- `next-intl` arrives with S0-B4 (Dev B, Sprint 0). If that isn't merged yet, build the auth
  pages with a single `messages/en/auth.json`-shaped object, then switch to it later.
- Done when: `npm run build` is no worse than before.

**AUTH-02: Local Supabase auth config (M)**
- Dev C creates `supabase/config.toml` in S0-C1. You own its auth section.
- `supabase/config.toml`: `site_url = "http://localhost:3000"`,
  `additional_redirect_urls = ["http://localhost:3000/auth/confirm"]`,
  `jwt_expiry = 3600`, `enable_refresh_token_rotation = true`,
  `[auth.email] enable_confirmations = false` (Q-B), and `minimum_password_length = 8`.
- Recovery and confirmation email templates point at
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password/confirm`
  (and `type=email` for signup confirmation).
- Local emails show up in Mailpit (default `http://localhost:54324`). Use it to test resets.
- Hosted-project auth settings are a **human-approval** step. Write them down; don't apply them.

**AUTH-03: Profile trigger, `updated_at` and `units` (M)**
- New migration (never edit applied ones):
  - `alter table user_profiles add column updated_at timestamptz not null default now();`
  - `units` column (`kg`/`lb`, default `kg`), used by Progress Tracking and Substitution.
  - `handle_new_user()` function, `security definer`, `set search_path = ''`. It inserts
    `(id, email, name)` from `new.id`, `new.email`, `new.raw_user_meta_data->>'name'`.
  - `after insert on auth.users` trigger.
  - Optionally add `on conflict (id) do nothing` so re-runs are safe.
- Done when: signing up locally creates a `user_profiles` row with no app code involved.
- This unblocks removing both app-side inserts (AUTH-05).

**AUTH-04: Migrate `middleware.ts` → `proxy.ts` (M)**
- Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  (§ "Migration to Proxy") and `01-app/02-guides/authentication.md` first.
- Export `proxy` (named) from `proxy.ts`. Delete `middleware.ts`. Keep the same `matcher`.
- Create the server client with the cookie `getAll`/`setAll` bridge. Then make **one** auth check:
  `supabase.auth.getClaims()` (verifies the JWT, cheaper than `getUser()`, available in the
  installed auth-js). Don't run any code between client creation and that call. Always return the
  `response` object that `setAll` produced, so refreshed cookies reach the browser.
- Rules:
  - Protected prefixes: `/`, `/dashboard`, `/session`, `/progress`, `/routines`, `/history`,
    `/onboarding`, `/profile`. Match `/` exactly, not as a prefix.
  - Unauthenticated user on a protected page → `/login?next=<pathname+search>`. If an `sb-*-auth-token`
    cookie was present but invalid, add `&reason=expired` (drives the "session expired" message).
  - Authenticated user on `/login` or `/signup` → `/`.
  - `/reset-password/confirm` and `/auth/confirm` are always reachable.
- Put the env-var reads in one helper that throws a clear error instead of using `!`.
- Next's docs call proxy an **optimistic** check. Real authorization stays in route handlers and
  RLS (AUTH-06).
- Done when: no deprecation warning in `npm run dev`; logged out, `/session` → `/login?next=/session`.

### Phase 1: Contracts

**AUTH-05: Auth types, schemas and error codes (S)**
- Build on the S0-J4 contract (`AuthUser`, `requireUser()` signatures) frozen in Sprint 0.
- `types/index.ts`, Auth/Profile section:
  - `AuthErrorCode` union: `INVALID_CREDENTIALS | EMAIL_EXISTS | WEAK_PASSWORD | INVALID_EMAIL | PASSWORDS_DONT_MATCH | INVALID_NAME | SAME_PASSWORD | INVALID_RESET_TOKEN | RATE_LIMIT_EXCEEDED | UNAUTHORIZED | NETWORK_ERROR | SERVER_ERROR | UNKNOWN_ERROR`
  - `AuthErrorResponse { error: string; code: AuthErrorCode }`
  - `AuthUser { id; email; name: string | null; createdAt; emailVerified: boolean }`
  - `SignupRequest`, `LoginRequest`, `ResetPasswordRequest`, `ResetPasswordConfirmRequest`,
    `AuthSuccessResponse`
  - Change `UserProfile.name` to `string | null`, since the SQL column is nullable and the name is
    optional at signup.
- `lib/validation/auth.ts`: `emailSchema`
  (max 255), `passwordSchema` (8–72 chars, upper, lower, digit), `nameSchema` (2–50, letters and
  spaces, Unicode-aware for ES names such as "José Núñez"), plus composed `signupSchema` (with
  confirm-password `refine`), `loginSchema`, `resetRequestSchema` and `resetConfirmSchema`. The
  same schemas run on the client (react-hook-form resolver) and the server (route handlers).
- `lib/auth/errors.ts`: `mapSupabaseAuthError(error) → AuthErrorCode`. Map on `error.code`
  (`invalid_credentials`, `user_already_exists`, `weak_password`, `same_password`,
  `over_request_rate_limit`, `otp_expired`) and `status`, never on message text.
- User-facing messages: spec §10 copy in `messages/{en,es}/auth.json`, keyed by code.
- Update `docs/features/user-authentication.md` §5–§6 for S1–S11 in the same PR.

### Phase 2: Server

**AUTH-06: Harden the auth API routes (M)**
- All routes: parse with the Zod schema → `422` + code on failure. Map Supabase errors with
  `mapSupabaseAuthError`. Never return `error.message`. Remove every `console.log`.
- `signup`: `supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo } })`.
  **Delete the profile insert** (the trigger handles it). Return `201 { success, user: AuthUser }`.
  With confirmations off, cookies are set and the user is logged in.
  - Note: with confirmations **on**, Supabase returns a user with no identities instead of an
    error for an existing email. Treat that as `EMAIL_EXISTS` only if Q-B changes.
- `login`: `signInWithPassword`. `401 INVALID_CREDENTIALS` for both a wrong password and an
  unknown email. `429 RATE_LIMIT_EXCEEDED`.
- `logout`: `signOut()`, then `200`. Takes no body and no Authorization header.
- `reset-password` (new): `resetPasswordForEmail(email, { redirectTo })`. **Always** `200` with
  the generic message, even on unknown email or a Supabase error (log server-side without the
  email).
- `reset-password/confirm` (new): requires the recovery session (`getUser()` → else
  `401 INVALID_RESET_TOKEN`). Calls `updateUser({ password })`. Maps `same_password` →
  `SAME_PASSWORD`. Then `signOut()` so the user logs in fresh (spec flow step 13).
- `app/auth/confirm/route.ts` (new, GET): reads `token_hash`, `type`, `next`, calls
  `verifyOtp({ type, token_hash })`, then redirects to the safe `next`. On failure, redirects to
  `/reset-password?error=INVALID_RESET_TOKEN`.
- `lib/auth/safe-redirect.ts`: `getSafeNext(value)` accepts only same-origin relative paths
  (starts with `/`, not `//` or `/\`) and falls back to `/`. Use it here, in `proxy.ts`, and in the
  login page. **This prevents an open redirect.**
- `lib/supabase/auth.ts`: `getCurrentUser()` / `requireUser()` for route handlers and Server
  Components (a small Data Access Layer, per the Next auth guide). This is seam S1 in the team
  plan: tell B and C the day it merges. You wire it into `sessions/*` and `tracking/*` yourself;
  B wires `routines/*` (RB-06) and C wires `ai/substitute` (SUB-03, fixes D9).
- `/api/profile`: add `emailVerified` from `user.email_confirmed_at`. Depends on the mapper in
  `lib/supabase/profile.ts` (S0-C2) so `getUserProfile` returns a real camelCase `UserProfile`.
- Done when: every request/response pair in spec §13 "Test data" behaves as described, checked
  with `curl` against local Supabase.

**AUTH-07: Fix `AuthContext` (S)**
- Remove the client-side profile insert in `signUp` (the trigger handles it).
- Pick one path for mutations. Recommended: the context calls the API routes (`fetch('/api/auth/…')`)
  so validation and error mapping live in one place. Then `router.refresh()` so Server Components
  pick up the new cookies.
- Load the profile through `/api/profile` (or `useProfile`) instead of a raw
  `.from('user_profiles')` select, which bypasses the mapper.
- `onAuthStateChange`: on `SIGNED_OUT`, clear state and `router.replace('/login')`. This handles
  multi-tab sign-out. Confirm it fires across tabs in the browser. If it doesn't, also re-check on
  `visibilitychange`.
- Create the browser client once (`useMemo`/module scope), not on every render.

### Phase 3: UI

**AUTH-08: Auth building blocks (M)**
- `components/auth/AuthCard.tsx`: centered card, max-width 480 px, full width with a 16 px gutter
  on mobile, dark theme tokens.
- `components/auth/PasswordField.tsx`: input + show/hide toggle (48 px target) + inline error.
- `components/auth/PasswordStrengthIndicator.tsx`: pure, uses `getPasswordStrength` (spec §7) from
  `lib/auth/password-strength.ts`. Labels come from i18n. Uses `aria-live="polite"`.
- `components/auth/FormError.tsx`: wraps the shared `Alert` with `role="alert"` so errors are
  announced.
- Spec §9 proposes one `AuthForm` with a `mode` prop. Four small forms that share these blocks are
  simpler and typed per form. Pick one and record it in the spec.
- Drop the spec's `ProtectedRoute` client wrapper. `proxy.ts` + `requireUser()` already do this
  on the server, without a loading flash.

**AUTH-09: Auth pages (L)**
Login and signup are part of Auth core. The two reset-password pages can follow later.

Route group `app/(auth)/` with a shared `layout.tsx` (AuthCard). Server Component pages wrap
client form components.

| Page | Behaviour |
|---|---|
| `/login` | Email + password. Shows the `reason=expired` banner ("Session expired…") and the `reset=success` / `loggedOut=1` banners. On error, keeps the email and clears the password. "Forgot password?" and "Sign up" links. On success, goes to `getSafeNext(next)` |
| `/signup` | Email, password + strength meter, confirm, optional name. Submit disabled until valid. `EMAIL_EXISTS` shows a "Log in instead" link. On success, goes to `/onboarding` |
| `/reset-password` | Email → "Sending…" → success state hides the field and shows "Check your email". Shows `?error=INVALID_RESET_TOKEN` as "link invalid or expired, request a new one" |
| `/reset-password/confirm` | New + confirm password with the strength meter. On success, goes to `/login?reset=success` |

- Every form: loading state (spinner, disabled inputs, "Signing in…" text), `NETWORK_ERROR`
  handling when `fetch` throws, with form data preserved.
- Correct `autocomplete` values (`email`, `current-password`, `new-password`) so password
  managers work.
- All strings in `messages/*/auth.json` (EN and ES).
- Done when: every component state in spec §4 is reachable in the browser.

**AUTH-10: Logout entry point and Profile view (S)**
- `/profile` (Server Component, `requireUser()`): email, name, join date, units, language
  switch, and "Log out".
- `components/navigation/UserMenu.tsx`: the spec's dropdown. With bottom tabs (Today · Program ·
  Progress · Profile), the Profile tab plus a log-out button on `/profile` may be enough. Confirm
  with design before adding a dropdown (there is no Shadcn DropdownMenu installed).
- Logout: optimistic UI, call `/api/auth/logout`, then `router.replace('/login?loggedOut=1')`.

**AUTH-11: Edge cases (M)**
- Profile missing for a logged-in user (trigger failed or the row was deleted): `/api/profile`
  returns `404`, and the app calls a `POST /api/profile` "ensure" path that upserts
  `(id, email)`, or signs the user out with `SERVER_ERROR`. Pick one. Ensure-on-read is the
  friendlier choice.
- Rate-limit copy for `429`.
- Email-not-verified banner (if Q-B stays "not required").
- Incognito: no work needed, verify only.

### Phase 4: Verify and ship

**AUTH-12: Verification pass (M)**
- `npm run lint` and `npm run build` green.
- Run spec §13's manual checklist in the browser against local Supabase, in EN and ES, at 320 px,
  390 px, 768 px and 1024 px. Plus:
  - Open-redirect check: `/login?next=//evil.com` and `/login?next=https://evil.com` land on `/`.
  - The refreshed cookie survives: with `jwt_expiry` set to 60 s locally, stay active for 2 minutes
    with no logout.
  - Two tabs: logging out in one sends the other to `/login`.
  - Reset link used twice: the second use shows the invalid-link error.
  - Keyboard-only run through all four forms. Screen reader announces errors.
- Security checklist (spec §12): no tokens in JSON responses or logs, no
  `SUPABASE_SERVICE_ROLE_KEY` in any client bundle (grep `.next/static`), enumeration-safe reset.
- Hosted auth config, hosted migration and RLS changes: **stop for human approval** (AGENTS.md).

**AUTH-13: Docs (S)**
- Update `user-authentication.md`: status, S1–S14, the answers to Q-A to Q-E, and a changelog row.
- `AGENTS.md`: `proxy.ts` (C fixes the "client converts case" claim in S0-C2).

---

## 5. Dependency order

```
AUTH-01 deps ─┐
AUTH-02 config ─────┬─► AUTH-03 trigger ────► AUTH-06 API ─► AUTH-07 context ─► AUTH-09 pages ─► AUTH-11 ─► AUTH-12
AUTH-04 proxy ──────┘                            ▲                                  ▲
AUTH-05 contracts ───────────────────────────────┘          AUTH-08 blocks ─────────┘
S0-C1 config.toml (C) ─► AUTH-02
S0-C2 profile mapper (C) ─► /api/profile part of AUTH-06 ─► AUTH-10 profile
S0-B4 i18n (B) ─► all UI cards (or use the temporary messages object from AUTH-01)
```

The AUTH-03 migration needs one reviewer. Applying it to the hosted project needs human approval,
and Dev C runs it (team plan DEC-09).

## 6. Files this plan creates or changes

```
proxy.ts                                  (new; replaces middleware.ts)
app/(auth)/layout.tsx                     (new)
app/(auth)/login/page.tsx                 (new)
app/(auth)/signup/page.tsx                (new)
app/(auth)/reset-password/page.tsx        (new)
app/(auth)/reset-password/confirm/page.tsx(new)
app/auth/confirm/route.ts                 (new)
app/api/auth/login|logout|signup/route.ts (changed)
app/api/auth/reset-password/route.ts      (new)
app/api/auth/reset-password/confirm/route.ts (new)
app/api/profile/route.ts                  (changed)
app/profile/page.tsx                      (new)
components/auth/*                         (new)
components/navigation/UserMenu.tsx        (new, if kept)
contexts/AuthContext.tsx                  (changed)
lib/auth/{errors,safe-redirect,password-strength}.ts (new)
lib/supabase/auth.ts                      (new)
lib/validation/auth.ts                    (new, B reviews)
messages/{en,es}/auth.json                (new)
types/index.ts                            (Auth/Profile section)
supabase/config.toml (auth section), supabase/migrations/<ts>_auth_profile_trigger.sql
docs/features/user-authentication.md      (updated)
```
