# User Authentication — Implementation Plan (Dev A)

> How Dev A builds the feature specified in [`user-authentication.md`](user-authentication.md),
> using AI coding sessions on **Sonnet 5.5 or cheaper models**, with as few tokens as possible.
>
> - Team context: [`TEAM-IMPLEMENTATION-PLAN.md`](../TEAM-IMPLEMENTATION-PLAN.md) §8. Dev A owns
>   this feature end to end, including its migrations (team plan §4.3), and builds it before
>   Progress Tracking.
> - The plan is **run one session at a time** (§5). Each session is self-contained: it says what
>   to read, which files it may change, and how to prove it's done.
> - Written 2026-11-25 from a read of the repo. Nothing here has been built or browser-tested yet.

**If you are an AI agent:** read §1. Then read your own session in §5, and §2–§4 only where your
session points to them. Don't read the other sessions. Your session ID is in the prompt you were
given.

**If you are Dev A:** read §0. You run the sessions; the agent does the work inside each one.

---

## 0. How Dev A runs this plan

### 0.1 Session index

Run them in this order. "∥" means two sessions touch different files and can run at the same time
in separate git worktrees (§0.4). Model names are the Claude Code `/model` choices.

| Session | Cards | Group | Model | Effort | Needs first | ∥ with | Size |
|---|---|---|---|---|---|---|---|
| **A1** Contracts | S0-J4 (team plan), AUTH-05 | Sprint 0 | Sonnet 5.5 | medium | S0-B3 (sections in `types/index.ts`) | A2, A3 | M |
| **A2** Dependencies and local auth config | AUTH-01, AUTH-02 | Core | Haiku 4.5 | low | S0-C1 (`supabase/config.toml` exists) | A1, A3 | S |
| **A3** Profile trigger migration | AUTH-03 | Core | Sonnet 5.5 | medium | S0-C1 | A1, A2 | M |
| **A4** `proxy.ts` and the data access layer | AUTH-04, AUTH-06 (DAL part) | Core | Sonnet 5.5 | **high** | A1 | A7 | M |
| **A5** Core auth API routes | AUTH-06 (signup, login, logout, profile) | Core | Sonnet 5.5 | medium | A1, A3, A4, S0-C2 | A7 | M |
| **A6** `AuthContext` fix | AUTH-07 | Core | Sonnet 5.5 | medium | A5 | A7 | S |
| **A7** Auth UI building blocks | AUTH-08 | Core | Haiku 4.5 | medium | S0-A2 (tokens), S0-B4 (i18n) | A4, A5, A6 | M |
| **A8** Login and signup pages | AUTH-09 (part 1) | Core | Sonnet 5.5 | **high** | A2, A5, A6, A7 | — | L |
| | **Auth core done.** Tell B and C that seam S1 is live (team plan §5) | | | | | | |
| **A9** Password reset, end to end | AUTH-06 (reset routes), AUTH-09 (part 2) | Complete | Sonnet 5.5 | **high** | A8 | A10 | L |
| **A10** Profile page and logout | AUTH-10 | Complete | Haiku 4.5 | medium | A6, S0-A3 (shell) | A9 | S |
| **A11** Edge cases | AUTH-11 | Complete | Sonnet 5.5 | medium | A9, A10 | — | M |
| **A12** Verification | AUTH-12 | Complete | Haiku 4.5 + **Dev A in the browser** | low | A11 | — | M |
| **A13** Docs | AUTH-13 | Complete | Haiku 4.5 | low | A12 | — | S |

"Core" and "Complete" are the team plan §8 groups. The team plan §12.3 exception lets you park the
"Complete" sessions and start Progress Tracking once A8 is merged.

Your other Sprint 0 cards (S0-A1, S0-A2, S0-A3, S0-J1, S0-J5) are in the team plan §7. The §0.2
prompt works for them too: replace the session reference with "card S0-A1 in
docs/TEAM-IMPLEMENTATION-PLAN.md §7".

### 0.2 The session prompt

Start a **new** session for every row in §0.1 (`claude` in a fresh terminal, or `/clear`). Set the
model and effort first (`/model sonnet` or `/model haiku`, then `/effort medium`). Then paste this,
replacing `A?`:

```text
Session A? of docs/features/user-authentication-plan.md. You are working as Dev A.

1. Read §1 of that plan (rules for every session).
2. Find your session: grep -n '^### Session A? ' docs/features/user-authentication-plan.md
   (keep the space after the ID) and read only that section, up to the next '### Session'.
   Read §2–§4 only where your session points to them.
3. Run the "Check before starting" commands. If any fails, stop and tell me which one.
4. Do the work. Follow the "Files you may change" list strictly.
5. Finish with the "Done when" checks, update the session log (§6), commit on the branch your
   session names, and give me a summary of 10 lines or fewer.
```

For the sessions marked **high** effort (A4, A8, A9), add one line: `Before editing, show me a
plan of 10 lines or fewer and wait for my OK.`

### 0.3 Your job between sessions

1. Read the agent's summary and `git diff --stat`. Read the full diff of anything that touches
   cookies, redirects, SQL or error handling.
2. Do the checks the session lists under "Dev A checks in the browser". Agents usually can't, and
   the summary will say so.
3. Push, open the PR (team plan §6.2), get it reviewed and merged, then start the next session from
   an up-to-date `main`.
4. If a session stops on the two-strike rule (§1), re-run it one step stronger: Haiku → Sonnet, or
   medium → high effort. Nothing in this plan should need Opus.

### 0.4 Why the sessions are set up this way (token and quality rules)

These are built into §1 and the prompt. Here's the reasoning, so you can apply it to your Progress
Tracking sessions too.

| Practice | Why |
|---|---|
| A fresh session per row, never one long chat | Every turn re-sends the whole context. Long chats cost more per message, and cheaper models lose track of earlier instructions |
| The prompt never asks to re-read `CLAUDE.md` or `AGENTS.md` | Claude Code loads them automatically (`CLAUDE.md` imports `AGENTS.md`). Re-reading wastes about 8k tokens |
| Agents read only their own session plus named line ranges. Never the full spec (1,123 lines), the team plan (about 1,000 lines) or the Next.js auth guide (1,697 lines) | Each of those costs 10–20k tokens. §2–§4 already extract what the sessions need |
| Verified facts (§2) and exact contracts (§4) are written once | Agents don't re-research library APIs or re-design interfaces every session. That's also where cheaper models make their worst mistakes |
| A strict "Files you may change" list per session | Stops exploratory reading and scope creep, the two biggest token sinks |
| Cheap checks while working (`npx tsc --noEmit`, `npx eslint <files>`). The full `npm run build` once, at the end. All output piped through `tail` | Build output is long, and only the last lines matter |
| Ready-made `curl` checks in each "Done when" | The agent proves the work without designing tests, and you can re-run them yourself |
| The two-strike rule: same error twice → stop and report | Cheaper models can loop on one error for thousands of tokens. You decide whether to escalate |
| Haiku 4.5 for config, presentational UI, docs and scripted checks. Sonnet 5.5 for anything that touches security | Haiku costs a fraction of Sonnet and is good at well-specified mechanical work. Cookies, redirects and error mapping are where a subtle mistake becomes a vulnerability |
| A plan-first step only on high-effort sessions | A 10-line plan is cheap and catches a wrong approach before it's written. On small sessions it's overhead |
| The session log (§6), 3 lines per session | The next session learns what happened from 3 lines, not from git history or an old chat |
| No subagents | The file lists are already scoped. A subagent rebuilds context from scratch and roughly doubles the cost |

Parallel sessions (∥ in §0.1) save wall-clock time, not tokens. Give each one its own worktree so
two agents never edit the same checkout:

```bash
git worktree add ../gym-ai-a2 -b feature/AUTH-01-auth-deps-config main
cd ../gym-ai-a2 && npm install && claude
```

All worktrees share one local Supabase. Only one session at a time may add a migration.

---

## 1. Rules for every session

These add to `CLAUDE.md` and `AGENTS.md`, which are already loaded. Don't re-read them.

**Reading**
- Read only what your session lists. Grep for a line before you Read, and Read files over 300
  lines with `offset` and `limit`.
- Never read a long doc in full. Spec sections are listed by line range in §2.4. The ranges were
  taken on 2026-11-25; if a heading moved, grep for it.
- Trust §2. It was verified against the installed packages. If something in §2 turns out to be
  wrong, fix §2 and say so in your summary.
- Don't spawn subagents.

**Editing**
- Change only the files in your session's "Files you may change" list. If you need anything else,
  stop and describe the change instead. Files owned by B or C (team plan §4.2) always need a
  request, never an edit.
- Match the surrounding code style. No comments that explain what code does (`AGENTS.md`). No
  `any`, no `as` casts to silence errors.
- Types go in the Auth/Profile section of `types/index.ts`. User-facing strings go in
  `messages/{en,es}/auth.json`, EN and ES together, keys sorted.
- Never return Supabase's `error.message` to the client. Never log emails, passwords or tokens.

**Checking**
- While working: `npx tsc --noEmit 2>&1 | tail -20` and `npx eslint <files you changed>`.
- At the end, once: `npm run build 2>&1 | tail -30`.
- Anything that talks to auth needs local Supabase running (`npx supabase status`) and, for HTTP
  checks, `npm run dev` in the background.
- **Two-strike rule:** if the same check fails twice with the same error after you tried to fix
  it, stop. Report the first 15 lines of the error, what you tried, and your best guess.
- UI: if this session has a browser tool, check the page at 390×844. If not, say "UI not tested"
  and leave the browser checks to Dev A. Never imply you tested something you didn't.

**Finishing**
- Create the branch your session names (`git switch -c <branch>` from an up-to-date `main`),
  commit with an imperative message, and don't push. End the commit message with the attribution
  line your harness specifies, if any.
- Update your row in the session log (§6): status, branch, and up to 3 lines of notes (deviations,
  follow-ups, anything the next session must know).
- Summary of 10 lines or fewer: what changed, checks run and their results, what wasn't tested,
  open questions. Don't paste file contents.

---

## 2. Verified facts

Checked on 2026-11-25 against `node_modules` and the code. Sessions use these instead of looking
them up.

### 2.1 Libraries

| Fact | Detail |
|---|---|
| Versions | `next` 16.2.10, `@supabase/ssr` 0.12.0, `@supabase/supabase-js` and `auth-js` 2.110.1, `zod` 4.4.3, `ai` 7.0.18 |
| Not installed yet | `react-hook-form`, `@hookform/resolvers` (A2 installs them), `next-intl` (B installs it in S0-B4) |
| Proxy | `middleware.ts` is deprecated in Next 16. The new file is `proxy.ts` at the repo root with a **named export `proxy`**. It runs on the Node.js runtime by default; setting `runtime` throws. The `config.matcher` export works as before |
| Proxy docs | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: exports at lines 54–70, migration at lines 737–770 |
| Auth guide | `node_modules/next/dist/docs/01-app/02-guides/authentication.md`: "Optimistic checks with Proxy" at lines 1024–1128, "Creating a Data Access Layer" at lines 1129–1232, "Route Handlers" at lines 1489–1542 |
| `searchParams` | In Next 16 pages, `searchParams` is a Promise. `await` it |
| `@supabase/ssr` cookies | `setAll(cookiesToSet, headers)` has a **second argument**: cache headers (`Cache-Control: private, no-cache, no-store…`, `Expires`, `Pragma`) that must be set on the response too, or a CDN could serve one user's session cookie to another. `middleware.ts` and `lib/supabase/server.ts` ignore it today |
| `getClaims()` | Exists on `supabase.auth` in auth-js 2.110.1. It verifies the JWT and returns `{ data: { claims } }` or an error. Use it in `proxy.ts` |
| `getUser()` vs `getSession()` | `getUser()` is verified by the Auth server; use it in the data access layer. `getSession()` is **not** verified and must never be used for authorization (`AuthContext` uses it today) |
| Auth error codes | Match on `error.code` (the `ErrorCode` union in `auth-js/dist/module/lib/error-codes.d.ts`), never on message text. §4.3 lists the ones that matter |
| `verifyOtp` | `{ type, token_hash }`, where `type` is an `EmailOtpType` such as `'recovery'` or `'email'` |
| Shared `Input` | `components/shared/Input.tsx` has `label`, `errorMessage`, `helperText` and `variant` props. Its `<label>` has **no `htmlFor`**, so screen readers don't link it to the input. A7 fixes this (Dev A owns `components/shared/`) |
| Lint and TS | `npm run lint` runs ESLint with `next/core-web-vitals` and `next/typescript`. Unused names starting with `_` are allowed. `tsconfig` has `strict` and `resolveJsonModule` on, so JSON imports work |
| Local Supabase | API `http://127.0.0.1:54321`, DB `postgresql://postgres:postgres@127.0.0.1:54322/postgres`, Studio `http://127.0.0.1:54323`, Mailpit `http://127.0.0.1:54324` (CLI defaults; `npx supabase status` prints the real values and the anon key) |

### 2.2 Current code and its problems

| File | Problems |
|---|---|
| `app/api/auth/signup/route.ts` | Debug `console.log` at lines 9–15 prints part of the Supabase URL. No validation. Returns `error.message` (line 26). Inserts the profile with the anon client (lines 29–43), which fails under RLS when email confirmation is on |
| `app/api/auth/login/route.ts` | No validation. Returns `error.message` (line 15). Returns no user |
| `app/api/auth/logout/route.ts` | Returns `error.message` (line 9) |
| `app/api/profile/route.ts` | Works, but `getUserProfile` (in `lib/supabase/queries.ts` today, moving to `profile.ts` in S0-C2) casts snake_case rows to camelCase. No `emailVerified` |
| `contexts/AuthContext.tsx` | Creates a new browser client on every render (line 23). Uses `getSession()` (line 27). A raw `.from('user_profiles')` read (lines 52–60) bypasses the mapper. Inserts the profile a **second** time in `signUp` (lines 67–79). `useEffect` has missing dependencies |
| `middleware.ts` | Deprecated name. Calls `getUser()` twice (lines 35 and 46). Redirects to `/`, which has no login, and drops the return path. Ignores the `setAll` headers. Non-null `!` on env vars |
| `user_profiles` (SQL) | The primary key `id` is `auth.users.id`. There is no `user_id` column (the spec is wrong about this). No `updated_at`, no `units`, no profile-creation trigger. RLS allows select, update and insert where `auth.uid() = id` |
| Missing | Pages `/login`, `/signup`, `/reset-password`, `/reset-password/confirm`, `/profile`. Route `/auth/confirm`. Folders `components/auth/` and `lib/auth/`. Files `messages/*/auth.json` |

### 2.3 Prerequisites from other people

| Needed by | What | Owner | Check |
|---|---|---|---|
| A1 | Labelled sections in `types/index.ts` | B (S0-B3) | `grep -n 'Auth/Profile' types/index.ts` |
| A2, A3 | `supabase/config.toml` and a running local Supabase | C (S0-C1) | `test -f supabase/config.toml && npx supabase status` |
| A5 | A working `getUserProfile` mapper in `lib/supabase/profile.ts` | C (S0-C2) | `grep -n 'export async function getUserProfile' lib/supabase/profile.ts` |
| A7, A8 | Design tokens render | A (S0-A2) | `grep -n '@config\|@theme' app/globals.css` |
| A7, A8 | `next-intl` installed, namespace files exist | B (S0-B4) | `grep -q '"next-intl"' package.json && test -f messages/en/auth.json` |
| A10 | App shell with bottom tabs | A (S0-A3) | `ls components/navigation` |

### 2.4 Where things are in the spec

`docs/features/user-authentication.md`, line ranges as of 2026-11-25:

| Section | Lines |
|---|---|
| §3 User flows (registration, login, logout, reset, alternative and error flows) | 54–176 |
| §4 Screens, component states, responsive behavior | 177–224 |
| §5 API endpoints (§4 of this plan overrides the shapes) | 225–438 |
| §7 Validation rules, password strength | 587–654 |
| §9 Components | 661–729 |
| §10 Error scenarios and messages | 730–802 |
| §11 Edge cases | 803–858 |
| §12 Acceptance criteria (functional, security) | 859–909 |
| §13 Manual testing checklist and test data | 910–994 |

---

## 3. Decisions

### 3.1 Spec vs. code

The spec was written before the code. Where they disagree, build to the **right-hand column**.
A13 updates the spec to match (team plan PROP-06).

| # | Spec says | Build this instead | Why |
|---|---|---|---|
| S1 | `/api/auth/signin`, `/signout` | Keep `/api/auth/login`, `/logout`. Add `/api/auth/reset-password` and `/reset-password/confirm` | Team plan PROP-01 |
| S2 | `user_profiles.user_id` FK, queries `.eq('user_id', …)` | `user_profiles.id` **is** the auth user id. `.eq('id', …)` | Existing schema and RLS |
| S3 | Profile created by the signup route or a mutation | A DB trigger on `auth.users` insert (A3). Pass `name` via `signUp({ options: { data: { name } } })` | Atomic, works with email confirmation and RLS. Fixes D10 |
| S4 | New `email_verified` column | Don't add it. Read `user.email_confirmed_at` | One source of truth |
| S5 | New `avatar_url` column | Skip | The spec marks it future |
| S6 | Add `updated_at` | Add it (A3) | Needed for profile updates |
| S7 | `@supabase/auth-helpers-nextjs`, `zod ^3` | `@supabase/ssr` and `zod ^4` (installed) | auth-helpers is deprecated |
| S8 | Shadcn `components/ui/{input,label,card,alert}` | `components/shared/{Input,Card,Alert,Button}` | Those exist. `components/ui/` only has `button` |
| S9 | Responses return `accessToken` / `expiresAt`. Logout takes `Authorization: Bearer` | The session lives only in cookies set by `@supabase/ssr`. Responses return `{ success, user }`, never tokens | Tokens in JavaScript defeat the point of cookie sessions |
| S10 | Reset confirm takes `{ token, password }` | Email link → `/auth/confirm?token_hash=…&type=recovery` → `verifyOtp` sets a session → `/reset-password/confirm` → `updateUser({ password })` | How Supabase recovery works with SSR |
| S11 | `GET /api/auth/me` | Reuse `GET /api/profile` and add `emailVerified` | One endpoint, not two |
| S12 | Redirect to `/dashboard` after login | Redirect to a safe `next`, otherwise `/` (Today) | Team plan route map, §5.1 |
| S13 | Hand-rolled `needsRefresh()` at 50 minutes | Let `@supabase/ssr` refresh in `proxy.ts` and the browser client | A second refresh loop causes refresh-token reuse errors |
| S14 | Tokens in **httpOnly** cookies | `@supabase/ssr` cookies are **not** httpOnly, because the browser client reads them. Accept this for MVP and rely on short JWT expiry | Q-A |
| S15 | `EMAIL_EXISTS` is a 400. Reset errors use the code `INVALID_TOKEN` | Keep 400 for `EMAIL_EXISTS`. Use `INVALID_RESET_TOKEN`, which matches the spec's message list | Fewer spec changes |
| S16 | One `AuthForm` with a `mode` prop, plus a client-side `ProtectedRoute` wrapper | Four small forms that share the A7 blocks. No `ProtectedRoute`: `proxy.ts` and `requireUser()` protect pages on the server | Typed per form, and no loading flash |

### 3.2 Open questions (defaults apply until Dev A or the product owner decides otherwise)

| # | Question | Default |
|---|---|---|
| Q-A | Is non-httpOnly cookie storage (S14) acceptable for MVP? | Yes. A13 documents it in the spec's security section |
| Q-B | Is email verification required before using the app? (team plan Q4) | Not required. Show a "verify your email" banner |
| Q-C | "5 failed logins per email per hour": a custom limiter, or Supabase's built-in limits? | Supabase limits, with `429` mapped to `RATE_LIMIT_EXCEEDED`. A custom limiter belongs to team plan M4-4 |
| Q-D | Disposable-email blocklist and the "30-day re-registration block" (spec §7) | Deferred. There's no account deletion in MVP |
| Q-E | Social login, MFA, "Remember me", account deletion (spec §16) | Out of MVP scope |

---

## 4. Contracts

Sessions implement these exactly. A1 turns §4.1–§4.5 into code. After A1 merges, the code is the
source of truth: later sessions read the code, not this section.

### 4.1 Types (`types/index.ts`, Auth/Profile section)

```ts
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'WEAK_PASSWORD' | 'INVALID_EMAIL'
  | 'PASSWORDS_DONT_MATCH' | 'INVALID_NAME' | 'SAME_PASSWORD' | 'INVALID_RESET_TOKEN'
  | 'RATE_LIMIT_EXCEEDED' | 'SESSION_EXPIRED' | 'UNAUTHORIZED'
  | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR'

export interface AuthErrorResponse { error: string; code: AuthErrorCode }

export interface AuthUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  emailVerified: boolean
}

export interface AuthSuccessResponse { success: true; user: AuthUser }

export interface SignupRequest { email: string; password: string; name?: string }
export interface LoginRequest { email: string; password: string }
export interface ResetPasswordRequest { email: string }
export interface ResetPasswordConfirmRequest { password: string }
```

Also on `UserProfile`: change `name` to `string | null` (the SQL column is nullable and the name is
optional at signup), and add `units: 'kg' | 'lb'` and `updatedAt: string` to match A3's migration.

### 4.2 Validation (`lib/validation/auth.ts`)

| Schema | Rules |
|---|---|
| `emailSchema` | Trimmed, lowercased, a valid email, at most 255 characters → `INVALID_EMAIL` |
| `passwordSchema` | 8–72 characters, with at least one uppercase letter, one lowercase letter and one digit → `WEAK_PASSWORD` |
| `nameSchema` | Optional. Trimmed, 2–50 characters, letters in any language plus spaces, apostrophes and hyphens (`/^\p{L}[\p{L} '\-]*$/u`, so "José Núñez" passes) → `INVALID_NAME` |
| `signupRequestSchema` | `{ email, password, name? }`, written as `z.object(…) satisfies z.ZodType<SignupRequest>`. The server uses it |
| `signupFormSchema` | `signupRequestSchema` plus `confirmPassword`, with a `refine` that puts `PASSWORDS_DONT_MATCH` on the `confirmPassword` path. The client uses it |
| `loginRequestSchema` | `{ email, password: z.string().min(1) }`. Never apply strength rules at login |
| `resetRequestSchema` | `{ email }` |
| `resetConfirmRequestSchema`, `resetConfirmFormSchema` | `{ password }`. The form version adds `confirmPassword` |

Every issue's `message` is an `AuthErrorCode`. Add `getIssueCode(error: z.ZodError): AuthErrorCode`,
which returns the first issue's message if it's a known code and `UNKNOWN_ERROR` otherwise, so
nobody needs an `as` cast. The UI translates with `` t(`errors.${code}`) ``.

### 4.3 Errors (`lib/auth/errors.ts`, `lib/auth/responses.ts`)

`mapSupabaseAuthError(error: { code?: string; status?: number }): AuthErrorCode`

| Supabase `error.code` | → `AuthErrorCode` |
|---|---|
| `invalid_credentials` | `INVALID_CREDENTIALS` |
| `user_already_exists`, `email_exists` | `EMAIL_EXISTS` |
| `weak_password` | `WEAK_PASSWORD` |
| `email_address_invalid` | `INVALID_EMAIL` |
| `same_password` | `SAME_PASSWORD` |
| `otp_expired`, `flow_state_expired`, `flow_state_not_found` | `INVALID_RESET_TOKEN` |
| `over_request_rate_limit`, `over_email_send_rate_limit`, or `status === 429` | `RATE_LIMIT_EXCEEDED` |
| `session_expired`, `session_not_found`, `refresh_token_not_found`, `refresh_token_already_used` | `SESSION_EXPIRED` |
| Anything else with `status >= 500` | `SERVER_ERROR` |
| Anything else | `UNKNOWN_ERROR` |

`authErrorResponse(code: AuthErrorCode): NextResponse<AuthErrorResponse>` returns `{ error, code }`.
`error` is the EN message from `messages/en/auth.json` (`errors.<CODE>`). The status is:

| Status | Codes |
|---|---|
| 422 | `INVALID_EMAIL`, `WEAK_PASSWORD`, `PASSWORDS_DONT_MATCH`, `INVALID_NAME` |
| 400 | `EMAIL_EXISTS`, `SAME_PASSWORD`, `INVALID_RESET_TOKEN` |
| 401 | `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `SESSION_EXPIRED` |
| 429 | `RATE_LIMIT_EXCEEDED` |
| 500 | `SERVER_ERROR`, `UNKNOWN_ERROR` |

`NETWORK_ERROR` is client-only: the UI uses it when `fetch` throws. The server never sends it.

Message copy: EN comes from the spec's `AUTH_ERROR_MESSAGES` (spec lines 769–802), plus
`INVALID_NAME` and `SAME_PASSWORD` from spec §7 (lines 589–610). ES is a natural Spanish
translation using informal "tú".

### 4.4 Safe redirect (`lib/auth/safe-redirect.ts`)

`getSafeNext(value: string | null | undefined, fallback = '/'): string` returns `value` only when
it's a same-origin relative path, and `fallback` otherwise. This prevents open redirects. `proxy.ts`,
`/auth/confirm` and the login form all use it.

| Input | Output |
|---|---|
| `/session`, `/session?x=1` | Unchanged |
| `null`, `''` | `/` |
| `//evil.com`, `/\evil.com`, `https://evil.com`, `javascript:alert(1)` | `/` |
| `/login`, `/signup` (would loop) | `/` |
| Anything containing a control character or a backslash | `/` |

How: reject anything that doesn't start with exactly one `/`, then check that
`new URL(value, 'http://local.invalid').origin === 'http://local.invalid'`.

### 4.5 Data access layer (`lib/supabase/auth.ts`)

```ts
export const getCurrentUser: () => Promise<AuthUser | null>  // wrapped in React cache(); uses getUser()
export async function requireUser(): Promise<AuthUser>       // redirects to /login?next=… when signed out
```

- **Route handlers** call `getCurrentUser()` and return `authErrorResponse('UNAUTHORIZED')` when
  it's `null`. They never redirect.
- **Pages and Server Components** call `requireUser()`.
- `AuthUser` mapping: `email: user.email ?? ''`, `name: user.user_metadata?.name ?? null`,
  `createdAt: user.created_at`, `emailVerified: Boolean(user.email_confirmed_at)`.

This is seam S1 in the team plan. B and C call it in their routes. The signatures are frozen at G0.

### 4.6 Proxy rules (`proxy.ts`)

- **Protected** (signed out → login): `/` as an exact match, and the prefixes `/dashboard`,
  `/session`, `/progress`, `/routines`, `/history`, `/onboarding`, `/profile`.
- **Guest-only** (signed in → `/`): `/login`, `/signup`.
- **Always reachable:** `/reset-password`, `/reset-password/confirm`, `/auth/confirm`. A recovery
  link signs the user in, so these must work in both states.
- **`/api/**` is never redirected.** Route handlers do their own auth and return 401 JSON.
- Signed out on a protected page → `/login?next=<pathname+search>`. If a cookie matching
  `/^sb-.+-auth-token(\.\d+)?$/` was sent but there are no valid claims, add `&reason=expired`.
- Make exactly one auth call, `supabase.auth.getClaims()`, right after creating the client, with
  no code in between.
- Every response, **including redirects**, carries the cookies and cache headers that `setAll`
  produced. Otherwise the refreshed session is lost, and the next request refreshes again.

Skeleton. Adapt it rather than copying it blindly, and check it against the proxy docs in §2.1:

```ts
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  let authHeaders: Record<string, string> = {}
  const { url, anonKey } = getSupabaseEnv()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        authHeaders = headers
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })
  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims)
  // apply the rules above; build every redirect with redirectWith(target, response, authHeaders)
  return response
}

function redirectWith(target: URL, from: NextResponse, headers: Record<string, string>) {
  const redirect = NextResponse.redirect(target)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  Object.entries(headers).forEach(([key, value]) => redirect.headers.set(key, value))
  return redirect
}
```

Only copy the `setAll` headers onto a redirect, never all of `response.headers`: those include
Next's internal `x-middleware-next`, which would break the redirect.

`getSupabaseEnv()` lives in a new `lib/supabase/env.ts`. It reads `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and throws an error naming the missing variable instead of using
`!`.

---

## 5. Sessions

Each session has the same parts: **Goal**, **Check before starting**, **Read**, **Files you may
change**, **Steps**, **Done when** and **Out of scope**. Branch names follow team plan §6.1.

### Session A1 — Contracts

- **Goal:** turn §4.1–§4.5 into code, so every later session (and B and C, through seam S1) builds
  against fixed signatures. This is also Sprint 0 card S0-J4.
- **Model:** Sonnet 5.5, medium. **Branch:** `feature/AUTH-05-auth-contracts`.
- **Check before starting:** `grep -n 'Auth/Profile' types/index.ts`.
- **Read:** plan §4.1–§4.5. In `types/index.ts`, grep for `UserProfile` and read about 40 lines
  around it. Spec lines 589–644 (validation and password strength) and 769–802 (messages).
- **Files you may change:** `types/index.ts` (Auth/Profile section only), `lib/validation/auth.ts`,
  `lib/auth/errors.ts`, `lib/auth/responses.ts`, `lib/auth/safe-redirect.ts`,
  `lib/auth/password-strength.ts`, `lib/supabase/auth.ts` (signatures with stub bodies that throw
  `new Error('Not implemented: session A4')`), `messages/en/auth.json`, `messages/es/auth.json`
  (create them if S0-B4 hasn't yet).
- **Steps:**
  1. Add the §4.1 types and update `UserProfile`. Fix type errors this causes in files that only
     read `name` (a `?? ''` is fine). If a fix is needed in a file you may not change, list it in
     the summary.
  2. Write the §4.2 schemas and `getIssueCode`, the §4.3 mapper and `authErrorResponse`, and the
     §4.4 `getSafeNext`.
  3. `lib/auth/password-strength.ts`: `getPasswordStrength(password): 0 | 1 | 2 | 3 | 4`, a pure
     function matching spec §7 (lines 611–644). The labels are i18n keys `strength.0` to
     `strength.4`.
  4. `messages/{en,es}/auth.json`: an `errors` object with every `AuthErrorCode`, and the
     `strength` labels. Other UI keys come later, from the sessions that use them.
  5. Stub the §4.5 signatures.
- **Done when:**
  - `npx tsc --noEmit` shows no new errors.
  - A throwaway script (`/tmp/check.ts`, not committed, run with `npx tsx /tmp/check.ts`) prints
    every §4.4 row and these strength cases: `'weak'` → 0, `'TestPass123'` → 3,
    `'TestPass123!x'` → 4. Paste the results in the summary.
- **Out of scope:** using any of this in routes or UI.

### Session A2 — Dependencies and local auth config

- **Goal:** the libraries the auth forms need are installed, and local Supabase sends auth emails
  to Mailpit with the right links.
- **Model:** Haiku 4.5, low. **Branch:** `feature/AUTH-01-auth-deps-config`.
- **Check before starting:** `test -f supabase/config.toml && npx supabase status`.
- **Read:** only the `[auth]` and `[auth.email]` sections of `supabase/config.toml` (grep for the
  headings first).
- **Files you may change:** `package.json`, `package-lock.json`, `supabase/config.toml` (auth
  sections only), `supabase/templates/recovery.html`, `supabase/templates/confirmation.html`.
- **Steps:**
  1. If `package-lock.json` has uncommitted changes from before this session, stop and ask Dev A
     whether to commit or discard them (team plan §6.3).
  2. `npm install react-hook-form @hookform/resolvers`. Confirm `@hookform/resolvers` is v5 or
     later (needed for Zod 4). Commit this on its own.
  3. In `config.toml`, set `site_url = "http://localhost:3000"`,
     `additional_redirect_urls = ["http://localhost:3000/auth/confirm"]`, `jwt_expiry = 3600`,
     `enable_refresh_token_rotation = true`, `minimum_password_length = 8`, and, under
     `[auth.email]`, `enable_confirmations = false` (Q-B).
  4. Create the two templates and point `[auth.email.template.recovery]` and
     `[auth.email.template.confirmation]` at them with `content_path`. The recovery link is
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password/confirm`.
     The confirmation link is the same with `type=email&next=/`. Commit steps 3–4 separately from
     step 2.
  5. `npx supabase stop && npx supabase start` to apply the config.
- **Done when:** `npx supabase status` is healthy, `npm ls react-hook-form @hookform/resolvers`
  shows both, and `npm run build 2>&1 | tail -30` is no worse than before.
- **Out of scope:** hosted Supabase settings. List the hosted values in the summary as a note for
  later; applying them needs human approval.

The two commits become two PRs, because the team plan allows one dependency change per PR.

### Session A3 — Profile trigger migration

- **Goal:** signing up creates the profile row in the database, with no app code involved.
- **Model:** Sonnet 5.5, medium. **Branch:** `feature/AUTH-03-profile-trigger`.
- **Check before starting:** `npx supabase status`, then `ls supabase/migrations` (note the latest
  timestamp).
- **Read:** `supabase/migrations/20260708000000_initial_schema.sql` lines 25–36 (`user_profiles`),
  and the `user_profiles` policies in `20260822000000_enable_rls.sql` (grep for them).
- **Files you may change:** one new file,
  `supabase/migrations/<timestamp>_auth_profile_trigger.sql`, with a timestamp later than every
  existing migration. Your section of `supabase/seed.sql`, only if the demo-user insert now
  conflicts with the trigger.
- **Steps:**
  1. Add `updated_at timestamptz not null default now()` and
     `units text not null default 'kg' check (units in ('kg', 'lb'))` to `user_profiles`.
  2. Create `public.handle_new_user()`: `returns trigger`, `language plpgsql`,
     `security definer`, `set search_path = ''`. It inserts `(id, email, name)` from `new.id`,
     `new.email` and `new.raw_user_meta_data->>'name'` into `public.user_profiles`, with
     `on conflict (id) do nothing`. Qualify every table name, because the search path is empty.
  3. `create trigger on_auth_user_created after insert on auth.users for each row execute
     function public.handle_new_user();`
  4. A `before update` trigger on `user_profiles` that sets `new.updated_at = now()`.
  5. `npx supabase db reset`.
- **Done when:**
  - `db reset` runs clean, including the dev seed.
  - A signup through the local Auth API creates the profile row:

    ```bash
    ANON=<anon key from npx supabase status>
    curl -s -X POST http://127.0.0.1:54321/auth/v1/signup -H "apikey: $ANON" \
      -H 'Content-Type: application/json' \
      -d '{"email":"a3@test.local","password":"TestPass123","data":{"name":"Ana"}}' -o /dev/null -w '%{http_code}\n'
    psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
      -c "select name, units, updated_at is not null as has_updated from public.user_profiles where email = 'a3@test.local'"
    ```

    Expect `200`, then one row: `Ana | kg | t`. If `psql` isn't installed, run the query in Studio
    and say so.
- **Out of scope:** removing the app-side inserts (A5 and A6 do that). Applying to hosted.

### Session A4 — `proxy.ts` and the data access layer

- **Goal:** pages are protected on the server, the session refreshes on every request, and route
  handlers have one trusted way to get the current user.
- **Model:** Sonnet 5.5, **high**. Plan first. **Branch:** `feature/AUTH-04-proxy`.
- **Check before starting:** `test -f lib/auth/safe-redirect.ts && grep -n 'getCurrentUser' lib/supabase/auth.ts`.
- **Read:** plan §4.4–§4.6. `middleware.ts` (61 lines). The proxy docs at lines 54–70 and 737–770,
  and the auth guide at lines 1024–1232 (§2.1). No other parts of those docs.
- **Files you may change:** `proxy.ts` (new), `middleware.ts` (delete), `lib/supabase/env.ts`
  (new), `lib/supabase/auth.ts` (implement the stubs).
- **Steps:**
  1. Write `proxy.ts` from the §4.6 rules and skeleton. Keep the existing `matcher`. Delete
     `middleware.ts`.
  2. Implement `getCurrentUser()` (React `cache`, `getUser()` through `createClient` from
     `lib/supabase/server.ts`) and `requireUser()` (§4.5).
  3. In the summary, ask C to switch `lib/supabase/client.ts` and `server.ts` to `getSupabaseEnv()`
     and to pass `headers` through in `server.ts`'s `setAll`. Don't edit those files.
- **Done when:** with `npm run dev` running, each line matches its comment:

  ```bash
  B=http://localhost:3000
  curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $B/session                        # 307 …/login?next=%2Fsession
  curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$B/routines?x=1"                 # 307 …/login?next=%2Froutines%3Fx%3D1
  curl -s -o /dev/null -w '%{http_code}\n' $B/login                                          # 200, never a redirect
  curl -s -o /dev/null -w '%{http_code}\n' $B/api/profile                                    # 401, not a redirect
  curl -s -o /dev/null -w '%{redirect_url}\n' -b 'sb-x-auth-token=bad' $B/session             # …&reason=expired
  curl -s -o /dev/null -w '%{redirect_url}\n' $B/reset-password                              # empty: no redirect
  ```

  And the dev server output has no middleware deprecation warning. The signed-in checks (a
  signed-in user on `/login` goes to `/`) wait for A8. Note that in the session log.
- **Out of scope:** the login page. Wiring `getCurrentUser()` into other owners' routes.

### Session A5 — Core auth API routes

- **Goal:** signup, login, logout and profile validate their input, map errors to codes, never leak
  Supabase messages, and no longer insert profiles.
- **Model:** Sonnet 5.5, medium. **Branch:** `feature/AUTH-06-auth-api`.
- **Check before starting:** `ls supabase/migrations | grep auth_profile_trigger`,
  `grep -n 'export async function getUserProfile' lib/supabase/profile.ts`, and
  `grep -c 'Not implemented' lib/supabase/auth.ts` prints `0`.
- **Read:** the four route files (§2.2 already lists their problems; don't re-analyze them). Plan
  §4.2, §4.3 and §4.5. `getUserProfile` in `lib/supabase/profile.ts` (grep).
- **Files you may change:** `app/api/auth/signup/route.ts`, `app/api/auth/login/route.ts`,
  `app/api/auth/logout/route.ts`, `app/api/profile/route.ts`.
- **Steps:**
  1. Every route: `safeParse` with the §4.2 request schema; on failure, return
     `authErrorResponse(getIssueCode(result.error))`. Supabase errors go through
     `mapSupabaseAuthError` → `authErrorResponse`. A bad JSON body → `UNKNOWN_ERROR`. No
     `console.log`. `console.error` only with the error code, never an email.
  2. Signup: `signUp({ email, password, options: { data: { name }, emailRedirectTo:
     `${new URL(request.url).origin}/auth/confirm` } })`. Delete the profile insert. Return
     `201 { success: true, user: AuthUser }`.
  3. Login: `signInWithPassword`. An unknown email and a wrong password both give
     `INVALID_CREDENTIALS`. Return `200 { success: true, user }`.
  4. Logout: `signOut()`, then `200 { success: true }`. No body or header needed.
  5. Profile: `getCurrentUser()` (401 when null), then `getUserProfile`. Return the profile plus
     `emailVerified`.
- **Done when:** this script gives the status in each comment (`npm run dev` and local Supabase
  running):

  ```bash
  B=http://localhost:3000; J='Content-Type: application/json'; E="a5-$RANDOM@test.local"
  curl -s -c /tmp/j -H "$J" -d "{\"email\":\"$E\",\"password\":\"TestPass123\",\"name\":\"Ana\"}" $B/api/auth/signup -w '\n%{http_code}\n'  # 201
  curl -s -H "$J" -d "{\"email\":\"$E\",\"password\":\"TestPass123\"}" $B/api/auth/signup -w '\n%{http_code}\n'              # 400 EMAIL_EXISTS
  curl -s -H "$J" -d '{"email":"x@test.local","password":"weak"}' $B/api/auth/signup -w '\n%{http_code}\n'                # 422 WEAK_PASSWORD
  curl -s -H "$J" -d '{"email":"not-an-email","password":"TestPass123"}' $B/api/auth/signup -w '\n%{http_code}\n'         # 422 INVALID_EMAIL
  curl -s -H "$J" -d "{\"email\":\"$E\",\"password\":\"Wrong1234\"}" $B/api/auth/login -w '\n%{http_code}\n'               # 401 INVALID_CREDENTIALS
  curl -s -c /tmp/j -H "$J" -d "{\"email\":\"$E\",\"password\":\"TestPass123\"}" $B/api/auth/login -w '\n%{http_code}\n'    # 200
  curl -s -b /tmp/j $B/api/profile -w '\n%{http_code}\n'                                                                 # 200, has emailVerified
  curl -s -b /tmp/j -c /tmp/j -X POST $B/api/auth/logout -w '\n%{http_code}\n'                                            # 200
  curl -s -b /tmp/j $B/api/profile -w '\n%{http_code}\n'                                                                 # 401
  ```

  Also: no response body contains `access_token`, and `grep -rn 'console.log' app/api/auth`
  prints nothing.
- **Out of scope:** the reset-password routes (A9) and `AuthContext` (A6).

### Session A6 — `AuthContext` fix

- **Goal:** one client-side auth state that goes through the API routes, reacts to sign-out in
  other tabs, and never touches the database directly.
- **Model:** Sonnet 5.5, medium. **Branch:** `fix/AUTH-07-auth-context`.
- **Check before starting:** A5 is merged (`grep -c "from('user_profiles')" app/api/auth/signup/route.ts`
  prints `0`).
- **Read:** `contexts/AuthContext.tsx` (99 lines), `hooks/useAuth.ts`, `hooks/useProfile.ts`.
- **Files you may change:** those three files.
- **Steps:**
  1. Create the browser client once (module scope or `useMemo`).
  2. `signIn`, `signUp` and `signOut` call `/api/auth/*` with `fetch`. They return
     `AuthSuccessResponse`, or throw a typed error carrying the `AuthErrorCode` (`NETWORK_ERROR`
     when `fetch` itself throws). After success, `router.refresh()`.
  3. Remove the client-side profile insert. Load the profile from `/api/profile`.
  4. Use `getUser()`, not `getSession()`, for the initial state. In `onAuthStateChange`, on
     `SIGNED_OUT`, clear state and `router.replace('/login')`.
  5. Fix the `useEffect` dependencies.
- **Done when:** `tsc` and `eslint` pass on the three files with no `react-hooks/exhaustive-deps`
  warning, and `grep -rn "from('user_profiles')" contexts hooks` prints nothing.
- **Dev A checks in the browser (after A8):** sign out in one tab; the other tab goes to `/login`
  within a few seconds. If it doesn't, note it for A11.
- **Out of scope:** any UI.

### Session A7 — Auth UI building blocks

- **Goal:** the small reusable pieces every auth form uses, so A8 and A9 only assemble them.
- **Model:** Haiku 4.5, medium. **Branch:** `feature/AUTH-08-auth-blocks`.
- **Check before starting:** `grep -q '"next-intl"' package.json && test -f messages/en/auth.json`.
- **Read:** the prop interfaces of `components/shared/Input.tsx`, `Alert.tsx` and `Button.tsx`
  (grep `interface` first). Spec lines 189–224 (component states, responsive behavior). How
  `next-intl` is used so far: `grep -rn "useTranslations" app components | head -5`.
- **Files you may change:** `components/auth/AuthCard.tsx`, `components/auth/PasswordField.tsx`,
  `components/auth/PasswordStrengthIndicator.tsx`, `components/auth/FormError.tsx` (all new),
  `components/shared/Input.tsx` (the label fix only), `messages/{en,es}/auth.json`.
- **Steps:**
  1. `Input`: when no `id` is passed, generate one with `useId()`. Link it with `<label htmlFor>`,
     set `aria-invalid` when there's an error, and point `aria-describedby` at the error or helper
     text. No other API changes.
  2. `AuthCard`: centered, max width 480 px, full width with a 16 px gutter on mobile, dark theme
     tokens. Props: `title`, `subtitle?`, `children`, `footer?`.
  3. `PasswordField`: the shared `Input` plus a show/hide toggle (48 px target, `aria-pressed`,
     translated `aria-label`). Forward the ref so react-hook-form's `register` works.
  4. `PasswordStrengthIndicator`: uses `getPasswordStrength`. Four bars and a translated label,
     inside `aria-live="polite"`. Renders nothing for an empty password.
  5. `FormError`: the shared `Alert` with `role="alert"`. Takes an `AuthErrorCode` and translates it.
- **Done when:** `tsc` and `eslint` pass. The summary lists each component's props, one line each.
- **Dev A checks in the browser (after A8):** the strength meter, the show/hide toggle and the error
  alert, at 390 px and 1024 px.
- **Out of scope:** pages and form logic.

### Session A8 — Login and signup pages

- **Goal:** a new user can sign up and land on onboarding, and a returning user can log in and get
  back to where they were.
- **Model:** Sonnet 5.5, **high**. Plan first. **Branch:** `feature/AUTH-09-login-signup`.
- **Check before starting:** `npm ls react-hook-form`, `ls components/auth/PasswordField.tsx`, and
  the A5 and A6 rows in §6 are "Merged".
- **Read:** spec lines 54–93 (registration and login flows), 131–176 (error flows) and 189–217
  (component states). The props of the A7 components. The `signIn` and `signUp` signatures in
  `contexts/AuthContext.tsx`.
- **Files you may change:** `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`,
  `app/(auth)/signup/page.tsx`, `components/auth/LoginForm.tsx`, `components/auth/SignupForm.tsx`
  (all new), `messages/{en,es}/auth.json`. If S0-A3 created placeholder pages at `app/login` or
  `app/signup`, delete them.
- **Steps:**
  1. `app/(auth)/layout.tsx` wraps children in `AuthCard`. The pages are Server Components that
     `await searchParams` and render a client form.
  2. `LoginForm`: react-hook-form with `zodResolver(loginRequestSchema)`. Banners for
     `reason=expired` (`SESSION_EXPIRED`), `reset=success` and `loggedOut=1`. On error, keep the
     email and clear the password. On success, `router.replace(getSafeNext(next))`. Links to
     "Forgot password?" and "Sign up".
  3. `SignupForm`: `zodResolver(signupFormSchema)`, `mode: 'onChange'`. Email, password with the
     strength meter, confirm password, and an optional name. Submit stays disabled until the form
     is valid. `EMAIL_EXISTS` shows a "Log in instead" link. On success,
     `router.replace('/onboarding')`.
  4. Both forms: while submitting, show a spinner, disable the inputs and show "Signing in…" or
     "Creating account…". `NETWORK_ERROR` keeps the form data. Set `autoComplete` to `email`,
     `current-password` or `new-password` as appropriate.
  5. Every string goes in `messages/{en,es}/auth.json`, under `login.*` and `signup.*`.
- **Done when:** `tsc`, `eslint` and `npm run build` pass, the A4 curl checks still pass, and a
  signed-in request to `/login` now redirects to `/` (log in with the A5 script first, then
  `curl -s -o /dev/null -w '%{redirect_url}\n' -b /tmp/j http://localhost:3000/login`).
- **Dev A checks in the browser:** every component state in spec §4, at 390×844, in EN and ES.
  Signup → `/onboarding`. Signed out, `/session` → login → back on `/session`. `/login?next=//evil.com`
  → `/` after login. Your password manager offers to save the password.
- **Out of scope:** the reset-password pages (A9) and the profile page (A10).

**When A8 is merged, Auth core is done.** Tell B and C that seam S1 is live, and update the log.

### Session A9 — Password reset, end to end

- **Goal:** a user who forgot their password gets an email, sets a new password and logs in again,
  and the flow never reveals whether an email is registered.
- **Model:** Sonnet 5.5, **high**. Plan first. **Branch:** `feature/AUTH-09-password-reset`.
- **Check before starting:** `ls components/auth/LoginForm.tsx`, and Mailpit opens at
  `http://127.0.0.1:54324`.
- **Read:** spec lines 94–110 (reset flow). Plan §3.1 S10 and §4.4. `components/auth/LoginForm.tsx`
  as the pattern to follow.
- **Files you may change:** `app/api/auth/reset-password/route.ts`,
  `app/api/auth/reset-password/confirm/route.ts`, `app/auth/confirm/route.ts`,
  `app/(auth)/reset-password/page.tsx`, `app/(auth)/reset-password/confirm/page.tsx`,
  `components/auth/ResetRequestForm.tsx`, `components/auth/ResetConfirmForm.tsx` (all new),
  `messages/{en,es}/auth.json`.
- **Steps:**
  1. `POST /api/auth/reset-password`: `resetPasswordForEmail(email, { redirectTo:
     `${origin}/auth/confirm` })`. The A2 template builds the actual link. **Always** return `200`
     with the same generic body, even for an unknown email or a Supabase error. Only rate limiting
     may return `429`.
  2. `GET /auth/confirm`: read `token_hash`, `type` and `next`, then `verifyOtp({ type, token_hash })`.
     On success, redirect to `getSafeNext(next)`. On failure, redirect to
     `/reset-password?error=INVALID_RESET_TOKEN`.
  3. `POST /api/auth/reset-password/confirm`: `getCurrentUser()`, or `INVALID_RESET_TOKEN` when
     null. `updateUser({ password })`, mapping `same_password` to `SAME_PASSWORD`. Then `signOut()`.
  4. `/reset-password`: an email field → "Sending…" → a success state that hides the field and says
     "Check your email". Shows `?error=INVALID_RESET_TOKEN` as "link invalid or expired".
  5. `/reset-password/confirm`: new and confirm password with the strength meter. On success,
     `router.replace('/login?reset=success')`.
- **Done when:** `tsc`, `eslint` and `build` pass, and:

  ```bash
  B=http://localhost:3000; J='Content-Type: application/json'
  curl -s -H "$J" -d '{"email":"nobody@test.local"}' $B/api/auth/reset-password -w '\n%{http_code}\n'     # 200, generic body
  curl -s -H "$J" -d '{"email":"a3@test.local"}' $B/api/auth/reset-password -w '\n%{http_code}\n'        # 200, identical body
  curl -s -o /dev/null -w '%{redirect_url}\n' "$B/auth/confirm?token_hash=bad&type=recovery"              # …/reset-password?error=INVALID_RESET_TOKEN
  curl -s -o /dev/null -w '%{redirect_url}\n' "$B/auth/confirm?token_hash=bad&type=recovery&next=//evil.com"  # never evil.com
  ```

- **Dev A checks in the browser:** the full flow through Mailpit. Opening the same link a second
  time shows the invalid-link error. Reusing the current password shows `SAME_PASSWORD`.
- **Out of scope:** the email-verification banner (A11).

### Session A10 — Profile page and logout

- **Goal:** the Profile tab shows who you are, lets you change units and language, and logs you out.
- **Model:** Haiku 4.5, medium. **Branch:** `feature/AUTH-10-profile`.
- **Check before starting:** `ls components/navigation`, and the A6 row in §6 is "Merged".
- **Read:** `app/api/profile/route.ts`, the `signOut` signature in `contexts/AuthContext.tsx`, and
  how the locale cookie is set (`grep -rn "NEXT_LOCALE\|locale" i18n | head`).
- **Files you may change:** `app/profile/page.tsx`, `components/auth/ProfileView.tsx`,
  `components/auth/LogoutButton.tsx` (new), `app/api/profile/route.ts` (add `PATCH`),
  `messages/{en,es}/auth.json`.
- **Steps:**
  1. `/profile` is a Server Component: `requireUser()`, then load the profile. Show the email,
     name, join date, units, a language switch and "Log out".
  2. `PATCH /api/profile` accepts `{ name?, units? }`, validated with `nameSchema` and
     `z.enum(['kg', 'lb'])`. Update with `.eq('id', user.id)` and return the updated profile.
  3. `LogoutButton`: calls `signOut`, then `router.replace('/login?loggedOut=1')`.
  4. No `UserMenu` dropdown. The Profile tab takes its place (team plan §4.1).
- **Done when:** `tsc`, `eslint` and `build` pass. Logged in with the A5 script, a `PATCH` with
  `{"units":"lb"}` returns 200, and `{"units":"stone"}` returns 422:
  `curl -s -b /tmp/j -X PATCH -H 'Content-Type: application/json' -d '{"units":"lb"}' http://localhost:3000/api/profile -w '\n%{http_code}\n'`.
- **Dev A checks in the browser:** the page at 390 px. A units change survives a reload. The
  language switch flips the page to ES. Logout lands on `/login` with the banner.
- **Out of scope:** account deletion and avatars.

### Session A11 — Edge cases

- **Goal:** the uncommon paths fail gracefully.
- **Model:** Sonnet 5.5, medium. **Branch:** `feature/AUTH-11-auth-edge-cases`.
- **Check before starting:** the A9 and A10 rows in §6 are "Merged".
- **Read:** spec lines 803–858 (edge cases), and the §6 notes from A6 and A8.
- **Files you may change:** `app/api/profile/route.ts`, `contexts/AuthContext.tsx`,
  `components/auth/**`, `messages/{en,es}/auth.json`.
- **Steps:**
  1. Missing profile for a signed-in user: `GET /api/profile` upserts `(id, email)` and returns the
     new profile instead of a 404 ("ensure on read").
  2. A `429` from any auth call shows the `RATE_LIMIT_EXCEEDED` copy.
  3. A dismissible "verify your email" banner on the profile page when `emailVerified` is false
     (Q-B).
  4. If A6's note says cross-tab sign-out didn't fire, add a `visibilitychange` re-check.
- **Done when:** `tsc`, `eslint` and `build` pass. After deleting your own `user_profiles` row in
  Studio, `GET /api/profile` returns 200 with a recreated row.
- **Out of scope:** a custom login limiter (Q-C).

### Session A12 — Verification

- **Goal:** evidence that the feature meets the spec's acceptance criteria and security
  requirements before it's called done.
- **Model:** Haiku 4.5, low, for the scripted checks. **Dev A** does the browser part.
  **Branch:** `chore/AUTH-12-auth-verification` (one docs commit with the results).
- **Check before starting:** the A11 row in §6 is "Merged". `npm run dev` and local Supabase are
  running.
- **Read:** spec lines 859–909 (acceptance criteria) and 910–935 (manual checklist).
- **Files you may change:** this plan: the §6 log, and a "Results" table added at the end of this
  session's section.
- **Steps for the agent:**
  1. `npm run lint 2>&1 | tail -20` and `npm run build 2>&1 | tail -30`.
  2. Re-run the curl scripts from A4, A5, A9 and A10. Record pass or fail per line.
  3. Secret-leak check (it prints only a verdict, never the key):
     `KEY=$(sed -n 's/^SUPABASE_SERVICE_ROLE_KEY=//p' .env.local); grep -rlF "$KEY" .next/static >/dev/null && echo LEAK || echo clean`.
  4. Session refresh: temporarily set `jwt_expiry = 60` in `config.toml` and restart Supabase. Log
     in with the A5 script, then call `curl -s -b /tmp/j -c /tmp/j http://localhost:3000/session`
     every 20 seconds for 2 minutes. None of the calls may redirect to `/login`. Restore `3600` and
     restart.
  5. Write the browser checklist for Dev A as checkboxes: spec lines 912–935 plus the items below.
- **Dev A checks in the browser:** the spec checklist in EN and ES at 320, 390, 768 and 1024 px.
  Two tabs: logging out in one sends the other to `/login`. A keyboard-only run through all four
  forms. A screen reader announces errors.
- **Done when:** every item is checked, or has an issue filed.
- **Out of scope:** fixing what fails. File it, then fix it in a follow-up session using the same
  prompt, with the issue as the task.

### Session A13 — Docs

- **Goal:** the spec and the agent docs describe what was actually built.
- **Model:** Haiku 4.5, low. **Branch:** `docs/AUTH-13-auth-docs`.
- **Check before starting:** the A12 row in §6 is "Done".
- **Read:** plan §3 and the §6 log. Spec sections only as you edit them (grep the heading, then
  read that section).
- **Files you may change:** `docs/features/user-authentication.md`, `AGENTS.md` (only the
  `middleware` mentions), and this plan's header status line.
- **Steps:**
  1. Spec: set the status to Done. Apply S1–S16 to §5–§9 (routes, shapes, no tokens in responses,
     no `user_id`, the trigger, the components that exist). Record the answers to Q-A to Q-E in
     §16. Add a changelog row in §19.
  2. `AGENTS.md`: say `proxy.ts` wherever it says middleware.
- **Done when:** `grep -n "auth/signin\|auth-helpers\|user_id\|accessToken" docs/features/user-authentication.md`
  prints nothing outside the changelog.
- **Out of scope:** code changes.

---

## 6. Session log

Each session updates its own row when it finishes. Status is one of: Not started, In review,
Merged, Done, Blocked. Notes are 3 lines at most. The next session reads this instead of git
history.

| Session | Status | Branch / PR | Notes |
|---|---|---|---|
| A1 | In review | `feature/AUTH-05-auth-contracts` | Added own `Auth/Profile` section (S0-B3 absent) and `messages/{en,es}/auth.json` (S0-B4 absent). 11 pre-existing tsc errors (Card, Modal, volume.ts etc.) unrelated. `@/messages/en/auth.json` import in responses.ts needs `resolveJsonModule` (on). |
| A2 | Not started | | |
| A3 | Not started | | |
| A4 | Not started | | |
| A5 | Not started | | |
| A6 | Not started | | |
| A7 | Not started | | |
| A8 | Not started | | |
| A9 | Not started | | |
| A10 | Not started | | |
| A11 | Not started | | |
| A12 | Not started | | |
| A13 | Not started | | |

The agent sets "In review" when it commits. Dev A changes it to "Merged" after the PR lands.

---

## 7. Files this plan creates or changes

```
types/index.ts (Auth/Profile section)                            A1
lib/validation/auth.ts                                           A1
lib/auth/{errors,responses,safe-redirect,password-strength}.ts   A1
messages/{en,es}/auth.json                                       A1, then every UI session
package.json, package-lock.json                                  A2
supabase/config.toml (auth sections), supabase/templates/*.html  A2
supabase/migrations/<ts>_auth_profile_trigger.sql                A3
proxy.ts (new; replaces middleware.ts)                           A4
lib/supabase/env.ts, lib/supabase/auth.ts                        A4 (auth.ts stubbed in A1)
app/api/auth/{signup,login,logout}/route.ts                      A5
app/api/profile/route.ts                                         A5, A10, A11
contexts/AuthContext.tsx, hooks/useAuth.ts, hooks/useProfile.ts  A6
components/shared/Input.tsx (label fix)                          A7
components/auth/*                                                A7–A11
app/(auth)/layout.tsx, app/(auth)/login, app/(auth)/signup       A8
app/api/auth/reset-password/**, app/auth/confirm/route.ts,
  app/(auth)/reset-password/**                                   A9
app/profile/page.tsx                                             A10
docs/features/user-authentication.md, AGENTS.md                  A13
```

Requests to other owners go in session summaries, not edits: switch `lib/supabase/client.ts` and
`server.ts` to `getSupabaseEnv()` and pass the `setAll` headers through (to C, from A4).
