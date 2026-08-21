# [Feature Name] - Specification

> **Copy this template for each feature. Fill in all sections before development starts.**

---

## 📋 Feature Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | [e.g., Personalized Routine Builder] |
| **Feature Owner** | [Team member name] |
| **Priority** | [High / Medium / Low] |
| **Estimated Effort** | [e.g., 5 days] |
| **Dependencies** | [Other features or infrastructure needed] |
| **Status** | [Planning / Design / Development / Testing / Done] |

---

## 🎯 1. Overview

### What This Feature Does
[2-3 sentences explaining the feature's purpose and value to users]

**Example:**
> The Personalized Routine Builder generates custom workout plans based on user goals, injuries, schedule, and available equipment. Unlike static templates, each routine is AI-generated with biomechanical intelligence to prevent overtraining and respect injury limitations.

### User Problem Solved
[What pain point does this address?]

**Example:**
> Users struggle to create effective workout plans because generic templates don't account for their injuries, limited equipment, or time constraints.

### Success Metrics
- [ ] [Metric 1, e.g., "90% of users complete onboarding"]
- [ ] [Metric 2, e.g., "Generated routines follow volume caps"]
- [ ] [Metric 3, e.g., "Zero injury-restricted movements in plans"]

---

## 👥 2. User Stories

**Primary User Story:**
> As a [type of user], I want to [action] so that [benefit].

**Example:**
> As a beginner with knee pain, I want to generate a personalized workout plan that avoids deep squats, so that I can train safely without aggravating my injury.

**Additional User Stories:**
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

---

## 🗺️ 3. User Flow

### Happy Path (Main Flow)
```
1. User starts at [screen/page]
2. User performs [action]
3. System does [processing/validation]
4. User sees [result/next screen]
5. User performs [next action]
6. System [final result]
```

**Example:**
```
1. User lands on /onboarding after signup
2. User selects goals (hypertrophy, strength, etc.)
3. User inputs injuries with severity (knee pain - moderate)
4. User sets training frequency (4 days/week, 60 min/session)
5. User selects available equipment (barbell, dumbbells, bench)
6. User clicks "Generate My Routine"
7. System calls AI with user profile + constraints
8. System shows loading state (15-20 seconds)
9. User sees generated 8-week routine with explanation
10. User can preview, edit, or accept routine
```

### Alternative Flows
**[Flow Name - e.g., "User skips injury input"]**
```
1. User skips injury section
2. System generates routine without restrictions
3. User sees warning: "No injury restrictions applied"
```

### Error Flows
**[Error Scenario - e.g., "AI generation fails"]**
```
1. User submits onboarding
2. API call to AI fails (timeout/error)
3. User sees error message: "Unable to generate routine. Try again."
4. User can retry or save progress and return later
```

---

## 🎨 4. Screens & Design

### Screen List
List all screens/views in this feature with Stitch file references:

| # | Screen Name | Stitch File | Description |
|---|-------------|-------------|-------------|
| 1 | [Name] | `stitch-file-1.png` | [What user sees/does] |
| 2 | [Name] | `stitch-file-2.png` | [What user sees/does] |
| 3 | [Name] | `stitch-file-3.png` | [What user sees/does] |

**Example:**
| # | Screen Name | Stitch File | Description |
|---|-------------|-------------|-------------|
| 1 | Welcome | `onboarding-welcome.png` | Hero with "Let's Build Your Plan" CTA |
| 2 | Goals Selection | `onboarding-goals.png` | Multi-select: hypertrophy, strength, etc. |
| 3 | Injury Input | `onboarding-injuries.png` | Add injuries with severity slider |
| 4 | Schedule Setup | `onboarding-schedule.png` | Days/week picker + session duration |
| 5 | Equipment | `onboarding-equipment.png` | Checklist of available equipment |
| 6 | Generating (Loading) | `onboarding-loading.png` | Progress indicator with AI messages |
| 7 | Results | `onboarding-results.png` | Generated routine with rationale |

### Component States
For each interactive component, document all states:

**[Component Name - e.g., "Routine Generator Button"]**
- **Default:** [Description + design reference]
- **Hover:** [Description + design reference]
- **Loading:** [Description + design reference]
- **Success:** [Description + design reference]
- **Error:** [Description + design reference]
- **Disabled:** [Description + design reference]

### Responsive Behavior
- **Desktop (1024px+):** [Layout description]
- **Tablet (768px-1023px):** [Layout description]
- **Mobile (<768px):** [Layout description]

---

## 🔌 5. API Endpoints

### Endpoint 1: [Name]
**Method:** `POST` / `GET` / `PUT` / `DELETE`  
**Route:** `/api/[route]`  
**Purpose:** [What this endpoint does]

**Request:**
```typescript
// Headers
{
  "Content-Type": "application/json"
}

// Body
{
  "field1": "value1",
  "field2": 123,
  "field3": ["array", "values"]
}
```

**Response (Success - 200):**
```typescript
{
  "success": true,
  "data": {
    "field1": "value1",
    "field2": { ... }
  }
}
```

**Response (Error - 400/500):**
```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Example:**
```typescript
// POST /api/routines/generate

// Request
{
  "userId": "uuid",
  "goals": ["hypertrophy", "strength"],
  "injuries": [
    { "area": "knee", "severity": "moderate", "restrictedPatterns": ["squat"] }
  ],
  "schedule": {
    "daysPerWeek": 4,
    "sessionDurationMinutes": 60
  },
  "equipment": ["barbell", "dumbbells", "bench"]
}

// Response (200)
{
  "success": true,
  "routine": {
    "id": "uuid",
    "name": "Custom Hypertrophy Plan",
    "durationWeeks": 8,
    "microcycles": [ ... ],
    "aiRationale": "This plan avoids deep squats due to knee pain..."
  }
}
```

### Endpoint 2: [Name]
[Repeat structure above]

---

## 🗄️ 6. Database

### Tables Used
List all database tables this feature reads from or writes to:

**Table: `[table_name]`**
- **Operations:** [Read / Write / Update / Delete]
- **Columns Used:** `column1`, `column2`, `column3`
- **New Columns Needed:** None / `new_column_name` (type, description)

**Example:**
**Table: `user_profiles`**
- **Operations:** Read
- **Columns Used:** `id`, `injuries`, `preferences`, `experience_level`
- **New Columns Needed:** None

**Table: `workout_plans`**
- **Operations:** Write
- **Columns Used:** `id`, `user_id`, `name`, `duration_weeks`, `microcycles`, `goals`, `ai_rationale`
- **New Columns Needed:** None

### Queries Needed
List Supabase queries in `lib/supabase/queries.ts`:

**Existing Queries to Use:**
- `getUserProfile(userId)` - Gets user profile with injuries

**New Queries to Create:**
```typescript
// getWorkoutPlanById(planId: string): Promise<WorkoutPlan | null>
// Purpose: Fetch a specific workout plan for display

// getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>
// Purpose: Get all plans for a user (for plan selection)
```

### Mutations Needed
List Supabase mutations in `lib/supabase/mutations.ts`:

**New Mutations to Create:**
```typescript
// createWorkoutPlan(plan: WorkoutPlan): Promise<WorkoutPlan>
// Purpose: Save AI-generated routine to database

// updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan>
// Purpose: Allow user to modify generated plan
```

---

## 🧠 7. Business Logic

### Validation Rules
**[Field/Input Name]**
- Rule: [Description]
- Error Message: [What user sees]

**Example:**
**Training Frequency**
- Rule: Must be between 1-7 days per week
- Error Message: "Training frequency must be 1-7 days per week"

**Session Duration**
- Rule: Must be between 15-180 minutes
- Error Message: "Session must be 15-180 minutes"

### Calculations & Algorithms
Document any complex logic:

**[Calculation Name - e.g., "Weekly Volume Cap"]**
```typescript
// Calculate optimal weekly volume per muscle group based on experience
const volumeCap = {
  beginner: 12,    // 10-12 sets per muscle per week
  intermediate: 16, // 12-18 sets per muscle per week
  advanced: 20     // 16-22 sets per muscle per week
}[experienceLevel];

// Apply to routine generation constraint
```

### Business Constraints
- [Constraint 1 - e.g., "Must respect injury restrictions"]
- [Constraint 2 - e.g., "Volume must not exceed caps"]
- [Constraint 3 - e.g., "Recovery: 48-72hrs between muscle groups"]

---

## 🤖 8. AI Integration (if applicable)

### AI Service Used
- **Model:** [e.g., Claude 3.5 Sonnet / Haiku]
- **Function:** [Which AI function from `lib/ai/service.ts`]
- **Why This Model:** [Reasoning - complex/fast/cheap]

**Example:**
- **Model:** Claude 3.5 Sonnet
- **Function:** `generateWorkoutPlan()`
- **Why:** Complex reasoning needed for injury-aware programming and periodization

### Prompt Requirements
**System Prompt Context:**
```typescript
// What context to pass to AI
{
  userProfile: UserProfile,
  trainingScience: {
    volumeCaps: { ... },
    recoveryWindows: { ... },
    movementPatterns: { ... }
  }
}
```

**User Prompt Template:**
```
Generate an 8-week hypertrophy routine for:
- Goals: [goals]
- Injuries: [injuries with restrictions]
- Schedule: [days/week, duration]
- Equipment: [available equipment]

Constraints:
- Respect injury restrictions completely
- Stay within volume caps for experience level
- Ensure 48-72hr recovery between muscle groups
```

### Response Format (Zod Schema)
```typescript
// Zod schema for validation
const WorkoutPlanSchema = z.object({
  name: z.string(),
  durationWeeks: z.number().min(4).max(16),
  microcycles: z.array( ... ),
  aiRationale: z.string()
});
```

### Fallback Behavior
**If AI fails:**
- [What happens - e.g., "Show error, allow retry"]
- [Degraded mode - e.g., "Offer template-based plans"]

---

## 🎨 9. Components

### New Components to Create
**Component: `[ComponentName]`**
- **Location:** `components/[folder]/[ComponentName].tsx`
- **Purpose:** [What it does]
- **Props:**
  ```typescript
  interface ComponentNameProps {
    prop1: string;
    prop2: number;
    onAction: () => void;
  }
  ```
- **State:** [What state it manages]
- **Shadcn Components Used:** Button, Card, Input, etc.

**Example:**
**Component: `OnboardingWizard`**
- **Location:** `components/onboarding/OnboardingWizard.tsx`
- **Purpose:** Multi-step form for collecting user preferences
- **Props:**
  ```typescript
  interface OnboardingWizardProps {
    userId: string;
    onComplete: (data: OnboardingData) => void;
  }
  ```
- **State:** currentStep, formData, isSubmitting
- **Shadcn Components Used:** Button, Card, Input, Select, Slider

### Existing Components to Reuse
- `Button` from `components/ui/button.tsx`
- `Card` from `components/ui/card.tsx`
- [List all reused components]

---

## ⚠️ 10. Error Handling

### Error Scenarios
**[Error Type - e.g., "Network Error"]**
- **When:** [When this occurs]
- **User Experience:** [What user sees]
- **Recovery:** [How user recovers]

**Example:**
**Network Error (AI API Timeout)**
- **When:** AI generation takes >30 seconds
- **User Experience:** Toast message: "Generation is taking longer than usual. Please wait..."
- **Recovery:** Show retry button after 45 seconds

**Validation Error (Invalid Input)**
- **When:** User enters 0 days per week
- **User Experience:** Inline error below field: "Training frequency must be 1-7 days"
- **Recovery:** Fix input, error clears automatically

### Error Messages
List all error messages with exact copy:

```typescript
const ERROR_MESSAGES = {
  INVALID_FREQUENCY: "Training frequency must be 1-7 days per week",
  AI_TIMEOUT: "Routine generation timed out. Please try again.",
  NO_EQUIPMENT: "Please select at least one piece of equipment",
  // ... all error messages
};
```

---

## 🎭 11. Edge Cases

### Empty States
**[Scenario - e.g., "User has no saved routines"]**
- **Display:** [What to show]
- **CTA:** [Call to action]

**Example:**
**No Saved Routines**
- **Display:** Empty state illustration + "You haven't created any routines yet"
- **CTA:** "Generate Your First Routine" button → onboarding

### Loading States
**[Component/Screen - e.g., "Routine Generation"]**
- **Loading UI:** [Skeleton, spinner, progress bar]
- **Duration:** [Expected load time]
- **Messaging:** [What to tell user]

**Example:**
**Routine Generation Loading**
- **Loading UI:** Progress bar with animated messages
- **Duration:** 15-20 seconds
- **Messaging:** "Analyzing your goals...", "Calculating optimal volume...", "Avoiding restricted movements..."

### Data Limits
- **[Limit Type]:** [Description + behavior]

**Example:**
- **Max Routines Per User:** 10 saved routines (free tier)
- **Behavior:** Show upgrade prompt when limit reached

---

## ✅ 12. Acceptance Criteria

### Functional Requirements
- [ ] User can complete the main flow without errors
- [ ] Data persists correctly to database
- [ ] All validation rules work as specified
- [ ] Error messages display correctly
- [ ] Loading states show during async operations
- [ ] [Add feature-specific criteria]

### Non-Functional Requirements
- [ ] Page loads in <2 seconds
- [ ] AI generation completes in <30 seconds
- [ ] Works on Chrome, Safari, Firefox (latest)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] No console errors

### Edge Cases Handled
- [ ] Empty states display correctly
- [ ] Error states recoverable
- [ ] Loading states clear after completion
- [ ] Offline behavior graceful

---

## 🧪 13. Testing Checklist

### Manual Testing
- [ ] Test happy path end-to-end
- [ ] Test each alternative flow
- [ ] Test each error scenario
- [ ] Test with empty/missing data
- [ ] Test on mobile device
- [ ] Test with slow network (throttling)
- [ ] Test keyboard navigation
- [ ] Test with screen reader

### Test Data
**Sample Input:**
```json
{
  "goals": ["hypertrophy"],
  "injuries": [{"area": "knee", "severity": "moderate"}],
  "schedule": {"daysPerWeek": 4, "sessionDurationMinutes": 60},
  "equipment": ["barbell", "dumbbells", "bench"]
}
```

**Expected Output:**
```json
{
  "name": "4-Day Hypertrophy Routine",
  "durationWeeks": 8,
  "microcycles": [ ... ],
  "aiRationale": "This plan uses hip thrusts instead of squats..."
}
```

---

## 📦 14. Dependencies

### External Libraries
- [Library name] - [Purpose] - [Version]

**Example:**
- `react-hook-form` - Form state management - `^7.43.0`
- `zod` - Schema validation - `^3.20.0`

### Internal Dependencies
- [Feature/Module] - [Why needed]

**Example:**
- Authentication system - Required to identify user
- Exercise database - Required for routine generation

### Blockers
- [ ] [Dependency that must be completed first]

---

## 🚀 15. Implementation Notes

### Development Approach
[Any specific guidance for implementation]

**Example:**
1. Build UI components first (no API integration)
2. Add form validation
3. Integrate AI API
4. Add error handling
5. Test end-to-end
6. Polish loading states

### Technical Decisions
**[Decision Topic - e.g., "State Management"]**
- **Choice:** [What was chosen]
- **Why:** [Reasoning]
- **Alternatives Considered:** [What else was considered]

**Example:**
**State Management**
- **Choice:** React Hook Form + local state
- **Why:** Simple form, no global state needed
- **Alternatives Considered:** Redux (overkill for this use case)

### Performance Considerations
- [Consideration 1]
- [Consideration 2]

**Example:**
- Cache user profile to avoid repeated queries
- Debounce injury input to reduce re-renders

---

## 📝 16. Open Questions

List any unresolved questions that need answering before/during development:

- [ ] [Question 1]
- [ ] [Question 2]

**Example:**
- [ ] Should we allow users to save multiple injury profiles?
- [ ] What happens if AI generates a plan that exceeds session duration?
- [ ] Should we validate equipment availability in real-time?

---

## 🔗 17. Related Documents

- **Designs:** [Link to Stitch/Figma]
- **API Docs:** [Link if applicable]
- **User Research:** [Link to research/interviews]
- **Related Features:** [Links to other feature specs]

---

## 📅 18. Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Design Complete | [Date] | ✅ / 🔄 / ⏳ |
| API Development | [Date] | ✅ / 🔄 / ⏳ |
| UI Development | [Date] | ✅ / 🔄 / ⏳ |
| Integration | [Date] | ✅ / 🔄 / ⏳ |
| Testing | [Date] | ✅ / 🔄 / ⏳ |
| Launch | [Date] | ✅ / 🔄 / ⏳ |

---

## 💬 19. Feedback & Iteration

### Design Review Notes
[Notes from design review]

### Development Feedback
[Notes during development]

### User Testing Feedback
[Notes from user testing]

### Changes Made
| Date | Change | Reason |
|------|--------|--------|
| [Date] | [What changed] | [Why] |

---

**Last Updated:** [Date]  
**Feature Owner:** [Name]  
**Status:** [Planning / Development / Testing / Done]
