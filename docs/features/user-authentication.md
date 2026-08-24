# User Authentication & Management - Specification

> **User management system with authentication, registration, and session handling**

---

## 📋 Feature Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | User Authentication & Management |
| **Feature Owner** | TBD |
| **Priority** | High |
| **Estimated Effort** | 7-10 days |
| **Dependencies** | Supabase setup, Database schema |
| **Status** | Planning |

---

## 🎯 1. Overview

### What This Feature Does
The User Authentication & Management system provides secure user identity management with registration, login, logout, password recovery, and session handling. This feature serves as the foundation for all personalized functionality in Gym AI, ensuring each user's data (routines, sessions, progress) is private and secure.

### User Problem Solved
Users need a secure way to create an account, access their personalized workout data across devices, and protect their fitness information from unauthorized access. Without authentication, users cannot save progress, access personalized routines, or use the app across multiple sessions/devices.

### Success Metrics
- [ ] 95%+ of new users successfully complete registration
- [ ] Login success rate >98%
- [ ] Password reset completion rate >85%
- [ ] Zero unauthorized data access incidents
- [ ] Session persistence works across browser restarts
- [ ] Average login time <2 seconds

---

## 👥 2. User Stories

**Primary User Story:**
> As a new user, I want to create an account with my email and password so that I can save my workout routines and track my progress over time.

**Additional User Stories:**
- As a returning user, I want to log in quickly with my credentials so that I can access my saved workout data
- As a user who forgot my password, I want to reset it via email so that I can regain access to my account
- As a logged-in user, I want to log out so that my data is secure when using a shared device
- As a user, I want my session to persist when I close and reopen the browser so that I don't have to log in every time
- As a user, I want to see my profile information (name, email, join date) so that I can verify my account details
- As a user, I want clear error messages when login/signup fails so that I know how to fix the issue
- As a user with injuries, I want my authentication to be separate from my profile data so that I can update my training info without affecting my login credentials

---

## 🗺️ 3. User Flow

### Happy Path (Registration)
```
1. User lands on /signup page
2. User enters email, password, and confirms password
3. User optionally enters name
4. User clicks "Create Account"
5. System validates:
   - Email format is valid
   - Password meets requirements (8+ chars, 1 number, 1 uppercase)
   - Password and confirm password match
   - Email is not already registered
6. System creates Supabase Auth user
7. System creates corresponding user_profiles record
8. System sends verification email (optional, configurable)
9. System auto-logs user in
10. User is redirected to /onboarding
```

### Happy Path (Login)
```
1. User lands on /login page
2. User enters email and password
3. User clicks "Sign In"
4. System validates credentials with Supabase Auth
5. System creates session (JWT token stored in httpOnly cookie)
6. User is redirected to /dashboard (or last visited protected page)
7. User sees personalized content
```

### Happy Path (Logout)
```
1. User clicks "Log Out" from navigation menu
2. System calls Supabase signOut()
3. System clears session/cookies
4. User is redirected to /login
5. User sees "You've been logged out" confirmation message
```

### Happy Path (Password Reset)
```
1. User clicks "Forgot Password?" on /login
2. User is redirected to /reset-password
3. User enters email
4. User clicks "Send Reset Link"
5. System sends password reset email via Supabase Auth
6. User sees "Check your email for reset instructions"
7. User clicks link in email
8. User is redirected to /reset-password/confirm with token
9. User enters new password and confirms
10. System validates new password
11. System updates password via Supabase Auth
12. User sees "Password updated successfully"
13. User is redirected to /login
```

### Alternative Flows

**Social Login (Future Enhancement)**
```
1. User clicks "Continue with Google"
2. OAuth flow with Google
3. User authorizes Gym AI
4. System creates/logs in user
5. User is redirected to /dashboard or /onboarding (if new)
```

**Email Verification Flow (Optional)**
```
1. After signup, user receives verification email
2. User clicks verification link
3. System marks email as verified
4. User sees "Email verified" confirmation
5. User can now access all features
```

### Error Flows

**Invalid Credentials (Login)**
```
1. User enters wrong email or password
2. System returns 401 error from Supabase Auth
3. User sees error message: "Invalid email or password"
4. Form remains populated (except password field)
5. User can retry
```

**Email Already Exists (Registration)**
```
1. User tries to register with existing email
2. Supabase Auth returns error
3. User sees error: "An account with this email already exists"
4. User can click "Log in instead" to go to /login
```

**Weak Password (Registration)**
```
1. User enters password that doesn't meet requirements
2. System validates client-side before submission
3. User sees inline error: "Password must be at least 8 characters with 1 number and 1 uppercase letter"
4. Submit button remains disabled until valid
```

**Password Reset Email Not Found**
```
1. User enters email that doesn't exist
2. System still shows success message (security best practice)
3. No email is sent
4. User waits, realizes email doesn't exist, goes to /signup
```

**Session Expired**
```
1. User's session token expires (default: 1 hour)
2. User tries to access protected page
3. Middleware detects expired session
4. User is redirected to /login with message: "Session expired. Please log in again."
5. After login, user is redirected back to original page
```

---

## 🎨 4. Screens & Design

### Screen List

| # | Screen Name | Stitch File | Description |
|---|-------------|-------------|-------------|
| 1 | Login | `auth-login.png` | Email/password form + "Forgot password?" link + "Sign up" link |
| 2 | Signup | `auth-signup.png` | Email/password/confirm + optional name field + "Sign in instead" link |
| 3 | Forgot Password | `auth-forgot-password.png` | Email input + "Send reset link" button |
| 4 | Reset Password Confirm | `auth-reset-confirm.png` | New password + confirm password + "Update password" button |
| 5 | Profile View (Basic) | `profile-basic.png` | Display email, name, join date, "Log out" button |

### Component States

**Login Form**
- **Default:** Empty email/password fields, "Sign In" button enabled
- **Typing:** Real-time validation indicators (email format, password min length)
- **Loading:** Button shows spinner, form disabled, "Signing in..." text
- **Success:** Brief success message, redirect to dashboard
- **Error:** Error banner above form with specific error message, form re-enabled
- **Disabled:** N/A (form always interactive)

**Signup Form**
- **Default:** Empty fields, "Create Account" button disabled
- **Typing:** Real-time validation (email format, password strength meter, password match)
- **Loading:** Button shows spinner, "Creating account..." text
- **Success:** "Account created!" message, auto-login, redirect to onboarding
- **Error:** Error banner with specific message (email exists, weak password, etc.)

**Password Reset Request**
- **Default:** Empty email field
- **Loading:** "Sending reset link..." with spinner
- **Success:** "Check your email for reset instructions" message, email field hidden
- **Error:** "Unable to send reset email. Please try again."

**Logout Button**
- **Default:** "Log Out" text in navigation
- **Hover:** Slight highlight
- **Loading:** Brief spinner during sign out
- **Success:** Redirect to /login

### Responsive Behavior
- **Desktop (1024px+):** Centered auth form card (max-width 480px), full-width background with gradient
- **Tablet (768px-1023px):** Same as desktop, card scales responsively
- **Mobile (<768px):** Card takes full width with 16px padding, form fields stack vertically

---

## 🔌 5. API Endpoints

### Endpoint 1: Sign Up
**Method:** `POST`  
**Route:** `/api/auth/signup`  
**Purpose:** Create new user account with Supabase Auth and user profile

**Request:**
```typescript
// Headers
{
  "Content-Type": "application/json"
}

// Body
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe" // optional
}
```

**Response (Success - 201):**
```typescript
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-08-23T10:00:00Z"
  },
  "session": {
    "accessToken": "jwt-token",
    "expiresAt": "2026-08-23T11:00:00Z"
  }
}
```

**Response (Error - 400):**
```typescript
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

**Response (Error - 422):**
```typescript
{
  "error": "Password must be at least 8 characters",
  "code": "WEAK_PASSWORD"
}
```

---

### Endpoint 2: Sign In
**Method:** `POST`  
**Route:** `/api/auth/signin`  
**Purpose:** Authenticate user and create session

**Request:**
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "accessToken": "jwt-token",
    "expiresAt": "2026-08-23T11:00:00Z"
  }
}
```

**Response (Error - 401):**
```typescript
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

### Endpoint 3: Sign Out
**Method:** `POST`  
**Route:** `/api/auth/signout`  
**Purpose:** Destroy user session

**Request:**
```typescript
// Headers
{
  "Authorization": "Bearer jwt-token"
}

// Body (empty)
{}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Endpoint 4: Password Reset Request
**Method:** `POST`  
**Route:** `/api/auth/reset-password`  
**Purpose:** Send password reset email

**Request:**
```typescript
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent"
}
```

**Note:** Always return success to prevent email enumeration attacks

---

### Endpoint 5: Password Reset Confirm
**Method:** `POST`  
**Route:** `/api/auth/reset-password/confirm`  
**Purpose:** Update password with reset token

**Request:**
```typescript
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass456"
}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Response (Error - 400):**
```typescript
{
  "error": "Invalid or expired reset token",
  "code": "INVALID_TOKEN"
}
```

---

### Endpoint 6: Get Current User
**Method:** `GET`  
**Route:** `/api/auth/me`  
**Purpose:** Fetch current authenticated user profile

**Request:**
```typescript
// Headers
{
  "Authorization": "Bearer jwt-token"
}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-08-23T10:00:00Z",
    "emailVerified": true
  }
}
```

**Response (Error - 401):**
```typescript
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

---

## 🗄️ 6. Database

### Tables Used

**Table: `auth.users` (Supabase Auth)**
- **Operations:** Read, Write (via Supabase Auth API)
- **Columns Used:** `id`, `email`, `created_at`, `email_confirmed_at`
- **New Columns Needed:** None (managed by Supabase)
- **Note:** This is Supabase's internal auth table, accessed via Auth API, not direct SQL

**Table: `user_profiles`**
- **Operations:** Read, Write, Update
- **Columns Used:** `id`, `user_id` (FK to auth.users), `name`, `email`, `created_at`, `updated_at`
- **New Columns Needed:** 
  - `name` (text, nullable) - User's display name
  - `email` (text, not null, unique) - Denormalized from auth.users for easier queries
  - `avatar_url` (text, nullable) - Profile picture URL (future enhancement)
  - `email_verified` (boolean, default false) - Email verification status

**RLS Policies Needed for `user_profiles`:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Only authenticated users can insert their profile (triggered on signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Queries Needed

**Existing Queries to Use:**
- None (this is the foundation feature)

**New Queries to Create in `lib/supabase/queries.ts`:**

```typescript
// getUserProfile(userId: string): Promise<UserProfile | null>
// Purpose: Fetch user profile by ID
// Used by: Profile page, navigation, session checks

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// getUserByEmail(email: string): Promise<UserProfile | null>
// Purpose: Find user by email (admin only or password reset checks)
// Used by: Admin tools, password reset validation

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null; // User not found
  return data;
}
```

### Mutations Needed

**New Mutations to Create in `lib/supabase/mutations.ts`:**

```typescript
// createUserProfile(userId: string, email: string, name?: string): Promise<UserProfile>
// Purpose: Create user profile record after Supabase Auth signup
// Triggered by: Signup API endpoint

export async function createUserProfile(
  userId: string, 
  email: string, 
  name?: string
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      email,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_verified: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>
// Purpose: Update user profile fields (name, avatar, etc.)
// Used by: Profile settings page

export async function updateUserProfile(
  userId: string, 
  updates: { name?: string; avatar_url?: string }
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// deleteUserProfile(userId: string): Promise<void>
// Purpose: Delete user profile (account deletion)
// Used by: Account deletion flow (future enhancement)

export async function deleteUserProfile(userId: string) {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
}
```

---

## 🧠 7. Business Logic

### Validation Rules

**Email**
- Rule: Must be valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Error Message: "Please enter a valid email address"

**Password (Signup)**
- Rule: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number
- Error Message: "Password must be at least 8 characters with 1 uppercase letter and 1 number"

**Password (Reset)**
- Rule: Same as signup + must be different from current password (checked server-side)
- Error Message: "New password must be different from your current password"

**Confirm Password**
- Rule: Must exactly match password field
- Error Message: "Passwords do not match"

**Name (Optional)**
- Rule: 2-50 characters if provided, letters and spaces only
- Error Message: "Name must be 2-50 characters (letters and spaces only)"

### Calculations & Algorithms

**Session Expiration**
```typescript
// Default session duration: 1 hour
const SESSION_DURATION_MS = 60 * 60 * 1000;

// Refresh token before expiration (at 50 minutes)
const REFRESH_BEFORE_MS = 50 * 60 * 1000;

// Check if session needs refresh
function needsRefresh(expiresAt: string): boolean {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  return (expiry - now) < (SESSION_DURATION_MS - REFRESH_BEFORE_MS);
}
```

**Password Strength Score (Client-Side Indicator)**
```typescript
// Calculate password strength (0-4)
function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++; // Special char
  return Math.min(score, 4);
}

// Strength labels: ["Weak", "Fair", "Good", "Strong", "Very Strong"]
```

### Business Constraints
- Maximum 5 failed login attempts per email per hour (rate limiting)
- Password reset tokens expire after 1 hour
- Email verification links expire after 24 hours
- Sessions auto-refresh when user is active (prevents mid-workout logout)
- Users cannot sign up with temporary/disposable email domains (configurable blocklist)
- Deleted users cannot re-register with same email for 30 days (soft delete period)

---

## 🤖 8. AI Integration (if applicable)

**N/A** - This feature does not use AI. Authentication is handled entirely by Supabase Auth API.

---

## 🎨 9. Components

### New Components to Create

**Component: `AuthForm`**
- **Location:** `components/auth/AuthForm.tsx`
- **Purpose:** Reusable form wrapper for all auth screens (login, signup, password reset)
- **Props:**
  ```typescript
  interface AuthFormProps {
    mode: 'login' | 'signup' | 'reset-password' | 'reset-confirm';
    onSubmit: (data: AuthFormData) => Promise<void>;
    isLoading: boolean;
    error?: string;
  }
  ```
- **State:** Form field values, client-side validation errors
- **Shadcn Components Used:** Card, Input, Button, Label, Alert

**Component: `PasswordStrengthIndicator`**
- **Location:** `components/auth/PasswordStrengthIndicator.tsx`
- **Purpose:** Visual password strength meter for signup/password reset
- **Props:**
  ```typescript
  interface PasswordStrengthIndicatorProps {
    password: string;
  }
  ```
- **State:** None (pure presentational)
- **Shadcn Components Used:** Progress (custom styled)

**Component: `ProtectedRoute`**
- **Location:** `components/auth/ProtectedRoute.tsx`
- **Purpose:** HOC/wrapper to protect pages that require authentication
- **Props:**
  ```typescript
  interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string; // Default: "/login"
  }
  ```
- **State:** Loading state while checking auth
- **Behavior:** Redirects to login if not authenticated

**Component: `UserMenu`**
- **Location:** `components/navigation/UserMenu.tsx`
- **Purpose:** Dropdown menu in navigation with profile link and logout
- **Props:**
  ```typescript
  interface UserMenuProps {
    user: {
      email: string;
      name?: string;
    };
    onLogout: () => void;
  }
  ```
- **State:** Dropdown open/closed
- **Shadcn Components Used:** DropdownMenu, Avatar

### Existing Components to Reuse
- `Button` from `components/ui/button.tsx`
- `Input` from `components/ui/input.tsx`
- `Label` from `components/ui/label.tsx`
- `Card` from `components/ui/card.tsx`
- `Alert` from `components/ui/alert.tsx`

---

## ⚠️ 10. Error Handling

### Error Scenarios

**Network Error (Supabase Unavailable)**
- **When:** API request to Supabase times out or fails
- **User Experience:** Error banner: "Connection error. Please check your internet and try again."
- **Recovery:** Retry button, form data preserved

**Invalid Credentials (Login)**
- **When:** User enters wrong email/password combination
- **User Experience:** Error banner: "Invalid email or password"
- **Recovery:** User can re-enter credentials, no lockout until 5 failed attempts

**Rate Limit Exceeded**
- **When:** User tries to log in 5+ times in 1 hour with wrong password
- **User Experience:** Error banner: "Too many login attempts. Please try again in 1 hour or reset your password."
- **Recovery:** Wait for rate limit to expire, or use password reset

**Email Already Registered**
- **When:** User tries to sign up with existing email
- **User Experience:** Error banner: "An account with this email already exists. Try logging in instead."
- **Recovery:** Link to login page

**Weak Password**
- **When:** User enters password that doesn't meet requirements
- **User Experience:** Inline error below password field: "Password must be at least 8 characters with 1 uppercase letter and 1 number"
- **Recovery:** User sees real-time strength indicator, submit disabled until valid

**Session Expired**
- **When:** User's JWT token expires (after 1 hour of inactivity)
- **User Experience:** Redirect to login with message: "Your session has expired. Please log in again."
- **Recovery:** User logs in, then is redirected back to the page they were trying to access

**Email Verification Required (Future)**
- **When:** User tries to access protected features before verifying email
- **User Experience:** Banner: "Please verify your email to unlock all features. Resend verification email."
- **Recovery:** Resend verification link

### Error Messages

```typescript
const AUTH_ERROR_MESSAGES = {
  // Login errors
  INVALID_CREDENTIALS: "Invalid email or password",
  RATE_LIMIT_EXCEEDED: "Too many login attempts. Please try again in 1 hour or reset your password.",
  ACCOUNT_DISABLED: "This account has been disabled. Contact support.",
  
  // Signup errors
  EMAIL_EXISTS: "An account with this email already exists. Try logging in instead.",
  WEAK_PASSWORD: "Password must be at least 8 characters with 1 uppercase letter and 1 number",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  INVALID_EMAIL: "Please enter a valid email address",
  
  // Password reset errors
  INVALID_RESET_TOKEN: "This password reset link is invalid or expired. Please request a new one.",
  RESET_TOKEN_EXPIRED: "This password reset link has expired. Please request a new one.",
  
  // Session errors
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You must be logged in to access this page.",
  
  // Network errors
  NETWORK_ERROR: "Connection error. Please check your internet and try again.",
  SERVER_ERROR: "Something went wrong on our end. Please try again.",
  
  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again."
};
```

---

## 🎭 11. Edge Cases

### Empty States

**No User Profile After Signup**
- **Display:** If user_profiles creation fails but Supabase Auth succeeds
- **Behavior:** Show error, log user out, suggest trying again
- **Prevention:** Wrap signup in transaction (create auth user → create profile, rollback if either fails)

**User Logged In But Profile Missing**
- **Display:** Rare edge case if profile deleted but auth remains
- **Behavior:** Create new profile on-the-fly or force logout with error
- **CTA:** "Complete your profile" flow

### Loading States

**Initial Auth Check (App Load)**
- **Loading UI:** Full-page spinner with "Loading..." text
- **Duration:** <1 second (checking existing session)
- **Messaging:** No message needed (brief flash)

**Login/Signup Submit**
- **Loading UI:** Button spinner, "Signing in..." / "Creating account..." text
- **Duration:** 1-3 seconds
- **Messaging:** Button text changes to indicate action in progress

**Session Refresh (Background)**
- **Loading UI:** None (invisible to user)
- **Duration:** <500ms
- **Behavior:** Happens automatically every 50 minutes if user active

### Data Limits

**Email Length:** Max 255 characters (database constraint)
**Password Length:** Min 8 chars, max 72 chars (bcrypt limit)
**Name Length:** Max 50 characters
**Failed Login Attempts:** 5 per hour per email before rate limiting

### Browser/Device Edge Cases

**Third-Party Cookies Disabled**
- **Impact:** Session storage may not work properly
- **Fallback:** Use localStorage for session token (less secure but functional)
- **User Message:** "For best security, enable cookies in your browser"

**Private/Incognito Mode**
- **Impact:** Session clears when browser closes (expected behavior)
- **Behavior:** User must log in again after closing incognito window

**Multiple Tabs/Windows**
- **Impact:** User logs out in one tab
- **Behavior:** Other tabs detect session change and redirect to login
- **Implementation:** Listen for Supabase `onAuthStateChange` event

---

## ✅ 12. Acceptance Criteria

### Functional Requirements
- [ ] User can successfully sign up with email and password
- [ ] User profile is created in `user_profiles` table after signup
- [ ] User can log in with correct credentials
- [ ] User cannot log in with incorrect credentials
- [ ] User sees clear error messages for invalid inputs
- [ ] User can log out and session is cleared
- [ ] User can request password reset email
- [ ] User can reset password using email link
- [ ] User session persists across browser restarts (until expiration)
- [ ] User is redirected to login when accessing protected routes while logged out
- [ ] User is redirected to original page after login
- [ ] Password strength indicator shows real-time feedback during signup
- [ ] Form validation prevents submission of invalid data

### Non-Functional Requirements
- [ ] Login completes in <2 seconds
- [ ] Signup completes in <3 seconds
- [ ] Password reset email arrives within 1 minute
- [ ] Session refresh happens automatically without user awareness
- [ ] Works on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Responsive on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] Forms are accessible via keyboard navigation
- [ ] Error messages are announced to screen readers
- [ ] No console errors during auth flows
- [ ] HTTPS enforced in production
- [ ] JWT tokens stored securely (httpOnly cookies)

### Security Requirements
- [ ] Passwords are hashed (handled by Supabase Auth with bcrypt)
- [ ] JWT tokens expire after 1 hour
- [ ] Rate limiting prevents brute force attacks (5 attempts per hour)
- [ ] Password reset tokens expire after 1 hour
- [ ] Email enumeration is prevented (same response for existing/non-existing emails)
- [ ] No sensitive data in client-side code or logs
- [ ] RLS policies prevent unauthorized data access
- [ ] Session tokens are httpOnly (not accessible via JavaScript)

### Edge Cases Handled
- [ ] Email already registered (signup)
- [ ] Session expired (auto-redirect to login)
- [ ] Network errors (retry with preserved form data)
- [ ] Password mismatch (real-time validation)
- [ ] Weak password (strength indicator + submit disabled)
- [ ] Multiple tabs (session sync)
- [ ] Private/incognito mode (session clears on browser close)

---

## 🧪 13. Testing Checklist

### Manual Testing
- [ ] Test signup with valid email/password
- [ ] Test signup with invalid email format
- [ ] Test signup with weak password
- [ ] Test signup with existing email
- [ ] Test signup with mismatched passwords
- [ ] Test login with correct credentials
- [ ] Test login with wrong password
- [ ] Test login with non-existent email
- [ ] Test password reset request
- [ ] Test password reset confirmation with valid token
- [ ] Test password reset confirmation with expired token
- [ ] Test logout and verify session cleared
- [ ] Test session persistence (close/reopen browser)
- [ ] Test protected route access while logged out
- [ ] Test protected route access while logged in
- [ ] Test session refresh (wait 50 minutes while active)
- [ ] Test session expiration (wait 1 hour without activity)
- [ ] Test rate limiting (5+ failed login attempts)
- [ ] Test on mobile device (iOS/Android)
- [ ] Test on tablet
- [ ] Test keyboard navigation through forms
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)

### Test Data

**Valid Signup:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123",
  "name": "Test User"
}
```

**Expected Result:**
- User created in Supabase Auth
- Profile created in `user_profiles`
- User auto-logged in
- Redirected to `/onboarding`

**Invalid Signup (Weak Password):**
```json
{
  "email": "testuser@example.com",
  "password": "weak",
  "name": "Test User"
}
```

**Expected Result:**
- Error: "Password must be at least 8 characters with 1 uppercase letter and 1 number"
- Submit button disabled
- User remains on signup page

**Valid Login:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```

**Expected Result:**
- Session created
- User redirected to `/dashboard`
- UserMenu shows user email/name

**Invalid Login:**
```json
{
  "email": "testuser@example.com",
  "password": "WrongPassword"
}
```

**Expected Result:**
- Error: "Invalid email or password"
- Form re-enabled
- Password field cleared

---

## 📦 14. Dependencies

### External Libraries
- `@supabase/supabase-js` - Supabase client - `^2.38.0`
- `@supabase/auth-helpers-nextjs` - Next.js auth utilities - `^0.8.0`
- `react-hook-form` - Form state management - `^7.43.0`
- `zod` - Schema validation - `^3.20.0`

### Internal Dependencies
- Supabase project setup - Required for Auth and Database
- `user_profiles` table - Must exist before signup
- Environment variables - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Blockers
- [ ] Supabase project created and configured
- [ ] Database schema migrated (`user_profiles` table exists)
- [ ] Environment variables set in `.env.local`
- [ ] RLS policies enabled on `user_profiles` table

---

## 🚀 15. Implementation Notes

### Development Approach
1. **Set up Supabase Auth configuration** (email provider, password settings)
2. **Create database schema** for `user_profiles` with RLS policies
3. **Build UI components** (AuthForm, PasswordStrengthIndicator, ProtectedRoute)
4. **Implement API routes** (`/api/auth/signup`, `/api/auth/signin`, `/api/auth/signout`, etc.)
5. **Add client-side validation** with react-hook-form + Zod
6. **Implement middleware** for protected routes
7. **Add session management** (auto-refresh, expiration handling)
8. **Test all auth flows** end-to-end
9. **Add error handling** for all edge cases
10. **Polish loading states** and user feedback

### Technical Decisions

**State Management**
- **Choice:** Supabase Auth + React Context for user state
- **Why:** Built-in session handling, no need for Redux/Zustand
- **Alternatives Considered:** NextAuth.js (more complex, Supabase Auth is simpler)

**Session Storage**
- **Choice:** httpOnly cookies (handled by Supabase)
- **Why:** Most secure option, prevents XSS attacks
- **Alternatives Considered:** localStorage (less secure, XSS vulnerable)

**Form Validation**
- **Choice:** react-hook-form + Zod
- **Why:** Type-safe, great DX, reusable schemas
- **Alternatives Considered:** Formik (more verbose), native HTML5 validation (less flexible)

**Password Hashing**
- **Choice:** Handled by Supabase Auth (bcrypt)
- **Why:** Industry standard, automatic, secure
- **Alternatives Considered:** None (Supabase handles this internally)

### Performance Considerations
- Debounce email existence check to avoid excessive API calls during signup
- Cache user profile after login to reduce database queries
- Preload protected route data after successful login
- Use SWR/React Query for user profile data (auto-revalidation)
- Implement optimistic UI for logout (instant feedback, async API call)

---

## 📝 16. Open Questions

- [ ] Do we want social login (Google, Apple) in MVP or Phase 2?
- [ ] Should email verification be required before accessing features?
- [ ] Do we need multi-factor authentication (MFA) for Phase 1 or later?
- [ ] Should we implement "Remember Me" functionality (longer session expiration)?
- [ ] Do we want to allow username login in addition to email?
- [ ] Should we support account deletion in Phase 1 or defer to later?
- [ ] Do we need admin roles/permissions or just standard users for MVP?

---

## 🔗 17. Related Documents

- **Designs:** TBD (Stitch files to be created)
- **Database Schema:** See `README.md` for full schema
- **Supabase Docs:** https://supabase.com/docs/guides/auth
- **Next.js Auth Helpers:** https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **Related Features:** 
  - Onboarding Flow (requires authentication)
  - Workout Sessions (requires user context)
  - Progress Tracking (requires user data)

---

## 📅 18. Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Database schema + RLS policies | TBD | ⏳ |
| Supabase Auth configuration | TBD | ⏳ |
| UI components (forms, protected routes) | TBD | ⏳ |
| API routes (signup, login, logout, reset) | TBD | ⏳ |
| Middleware for protected routes | TBD | ⏳ |
| Form validation + error handling | TBD | ⏳ |
| Session management (refresh, expiration) | TBD | ⏳ |
| Manual testing (all flows) | TBD | ⏳ |
| Security audit | TBD | ⏳ |
| Launch | TBD | ⏳ |

---

## 💬 19. Feedback & Iteration

### Design Review Notes
TBD

### Development Feedback
TBD

### User Testing Feedback
TBD

### Changes Made
| Date | Change | Reason |
|------|--------|--------|
| 2026-08-23 | Initial specification created | Feature planning |

---

**Last Updated:** 2026-08-23  
**Feature Owner:** TBD  
**Status:** Planning
