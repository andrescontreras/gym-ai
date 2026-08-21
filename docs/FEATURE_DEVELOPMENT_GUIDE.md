# Feature Development Guide

> **How to use the feature template and best practices for feature development**

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [How to Use the Template](#how-to-use-the-template)
3. [Best Practices](#best-practices)
4. [Common Pitfalls](#common-pitfalls)
5. [Integration with Stitch MCP](#integration-with-stitch-mcp)
6. [Review Checklist](#review-checklist)

---

## 🚀 Quick Start

### For Each New Feature:

1. **Copy the template:**
   ```bash
   cp docs/FEATURE_TEMPLATE.md docs/features/[FEATURE-NAME].md
   ```

2. **Fill out sections in this order:**
   - Overview (Section 1)
   - User Stories (Section 2)
   - Screens & Design (Section 4)
   - User Flow (Section 3)
   - API Endpoints (Section 5)
   - Database (Section 6)
   - Everything else

3. **Review with team** before starting development

4. **Keep updated** as feature evolves

---

## 📝 How to Use the Template

### Section-by-Section Guide

#### 1. Metadata (Top)
**When to fill:** First thing  
**Why:** Helps track ownership and progress  
**Tips:**
- Be realistic with estimates
- List ALL dependencies (other features, APIs, data)
- Update status regularly

---

#### 2. Overview
**When to fill:** At the start  
**Why:** Establishes shared understanding  
**Tips:**
- Keep it concise (2-3 sentences)
- Focus on user value, not technical details
- Include the "why" not just the "what"

**Good Example:**
> The Exercise Substitution feature finds biomechanically equivalent alternatives when equipment is unavailable or an exercise causes pain. This prevents users from getting stuck mid-workout and maintains training stimulus.

**Bad Example:**
> This feature uses Claude AI to generate exercise alternatives based on movement patterns and muscle groups.
(Too technical, doesn't explain user value)

---

#### 3. User Stories
**When to fill:** After overview  
**Why:** Defines success from user perspective  
**Tips:**
- Always use format: "As a [user type], I want to [action] so that [benefit]"
- Include different user types (beginner, advanced, injured, etc.)
- Think about edge cases

**Examples:**
```
Good:
"As a beginner with shoulder pain, I want exercise alternatives that avoid overhead movements, so I can train safely without aggravating my injury."

Bad:
"User wants to substitute exercises."
(No context on who, why, or what benefit)
```

---

#### 4. User Flow
**When to fill:** After defining user stories  
**Why:** Creates step-by-step blueprint for development  
**Tips:**
- Number every step
- Include system actions, not just user actions
- Document what happens on errors
- Cover alternative paths (what if user skips a step?)

**Template:**
```
1. User [action]
2. System [response]
3. User sees [result]
4. User [next action]
```

**Pro Tip:** Walk through the flow with your Stitch mockups open

---

#### 5. Screens & Design
**When to fill:** Alongside user flow  
**Why:** Links mockups to functionality  
**Tips:**
- One row per screen/modal/state
- Reference exact Stitch file names
- Document ALL states (empty, loading, error, success)
- Include mobile views if different from desktop

**Component States Checklist:**
For every interactive element, document:
- [ ] Default state
- [ ] Hover/focus state
- [ ] Loading state
- [ ] Success state
- [ ] Error state
- [ ] Disabled state

---

#### 6. API Endpoints
**When to fill:** After user flow is clear  
**Why:** Defines contract between frontend and backend  
**Tips:**
- Show actual JSON, not pseudo-code
- Include ALL fields (don't abbreviate with "...")
- Document every error code (400, 401, 404, 500)
- Use TypeScript types for clarity

**Checklist for Each Endpoint:**
- [ ] Method (GET/POST/PUT/DELETE)
- [ ] Route (/api/...)
- [ ] Request headers
- [ ] Request body (with types)
- [ ] Success response (200/201)
- [ ] Error responses (400/401/404/500)
- [ ] Example request/response

---

#### 7. Database
**When to fill:** Alongside API endpoints  
**Why:** Prevents database issues during development  
**Tips:**
- List existing tables you'll use
- Identify new columns needed (if any)
- Name all queries/mutations needed
- Consider data relationships

**Questions to Answer:**
- What data do I need to read?
- What data do I need to write?
- Do I need to update existing data?
- Do I need to delete anything?
- Are there RLS policies that affect this?

**Example:**
```
Table: workout_sessions
Operations: Read, Write
Columns Used: id, user_id, date, status, exercises
New Columns: None
RLS Impact: User can only access their own sessions ✅
```

---

#### 8. Business Logic
**When to fill:** When designing API/component logic  
**Why:** Documents rules that aren't obvious from UI  
**Tips:**
- Write validation rules BEFORE coding
- Include error messages users will see
- Document any calculations/formulas
- List all constraints

**Example:**
```
Validation: Training Frequency
- Rule: 1-7 days per week
- Error: "Training frequency must be 1-7 days per week"
- Edge Case: If user enters 0, default to 3
```

---

#### 9. AI Integration
**When to fill:** If feature uses AI  
**Why:** AI calls are expensive and slow - plan carefully  
**Tips:**
- Choose the right model (Sonnet for complex, Haiku for fast)
- Document exact prompt structure
- Always use Zod schemas for validation
- Plan for AI failures

**Model Selection:**
```
Claude 3.5 Sonnet:
- Use for: Complex reasoning, safety-critical decisions
- Cost: Higher
- Speed: 2-5 seconds
- Examples: Routine generation, injury-aware substitution

Claude 3.5 Haiku:
- Use for: Fast, simple tasks
- Cost: Lower
- Speed: <1 second  
- Examples: Voice parsing, load prediction
```

---

#### 10. Components
**When to fill:** Before starting UI development  
**Why:** Prevents duplicate components and promotes reuse  
**Tips:**
- Check existing components first (components/ui/)
- List Shadcn components you'll need
- Document component props with TypeScript
- Plan component hierarchy

**Reuse Checklist:**
Before creating a new component, check:
- [ ] Does a Shadcn component exist?
- [ ] Is there a similar component in the codebase?
- [ ] Can I compose existing components?
- [ ] Is this truly unique to this feature?

---

#### 11. Error Handling
**When to fill:** Alongside API design  
**Why:** Error handling is often forgotten until testing  
**Tips:**
- Document EVERY error scenario
- Write exact error message copy
- Plan recovery flows (can user retry? save progress?)
- Consider offline behavior

**Error Categories to Consider:**
- Network errors (timeout, no connection)
- Validation errors (invalid input)
- Permission errors (not authorized)
- Server errors (500)
- Rate limiting
- AI failures

---

#### 12. Edge Cases
**When to fill:** After happy path is defined  
**Why:** Edge cases break features in production  
**Tips:**
- Think about empty states
- Consider slow networks
- Plan for missing/partial data
- Test with extreme values

**Common Edge Cases:**
- First-time user (no data yet)
- Power user (tons of data)
- Slow network (loading forever)
- Offline mode
- Browser back button
- Duplicate submissions
- Session timeout

---

#### 13. Acceptance Criteria
**When to fill:** At the end, as a checklist  
**Why:** Defines "done" before you start  
**Tips:**
- Make criteria testable (yes/no)
- Include both functional and non-functional
- Cover all edge cases
- Add performance requirements

**Format:**
```
Functional:
- [ ] User can [specific action]
- [ ] Data persists [specific scenario]
- [ ] Error shows [specific message]

Non-Functional:
- [ ] Loads in <2 seconds
- [ ] Works on mobile
- [ ] Accessible (keyboard navigation)
```

---

## ✅ Best Practices

### Do's ✅

1. **Fill out template BEFORE coding**
   - Writing code first leads to missed requirements
   - Template forces you to think through details

2. **Be specific, not vague**
   - Good: "Show spinner for 15-20 seconds during AI generation"
   - Bad: "Loading state"

3. **Include real examples**
   - Actual JSON payloads
   - Real error messages
   - Sample data

4. **Document the "why" not just the "what"**
   - Good: "Use Haiku for speed since users expect <1s response"
   - Bad: "Use Haiku"

5. **Update as you learn**
   - Template is a living document
   - Update when requirements change
   - Note what changed and why

6. **Review with team**
   - Get feedback before coding
   - Catch issues early
   - Share knowledge

7. **Link everything**
   - Link to Stitch files
   - Link to API docs
   - Link to related features

### Don'ts ❌

1. **Don't skip sections**
   - Every section exists for a reason
   - Mark "N/A" if truly not applicable
   - Don't leave blank without explanation

2. **Don't be vague**
   - Bad: "User inputs data"
   - Good: "User inputs goals via multi-select checkboxes (max 3 selections)"

3. **Don't assume**
   - Document everything explicitly
   - What's obvious to you may not be to others
   - Future you will forget details

4. **Don't forget error cases**
   - Happy path is only 20% of the work
   - Error handling is 80%

5. **Don't skip testing section**
   - Define test cases upfront
   - Saves debugging time later

---

## 🎨 Integration with Stitch MCP

### If MCP Connection Available

**Benefits:**
- Query designs directly from specification
- Get exact measurements/spacing
- See design updates in real-time
- Reference components by ID

**How to Reference:**
```markdown
### Screen: Onboarding Welcome
**Stitch Reference:** `stitch://component/[component-id]`
**MCP Query:** 
```
stitch.getComponent({ id: "component-id" })
```
```

**In Template Sections:**
- **Section 4 (Screens):** Link to Stitch components
- **Section 9 (Components):** Query spacing/colors from Stitch
- **Section 11 (Edge Cases):** Reference state variants in Stitch

### Without MCP Connection

**Workaround:**
- Export Stitch screens as PNG/PDF
- Save in `docs/designs/[feature-name]/`
- Reference files in template
- Update template when designs change

**Naming Convention:**
```
docs/designs/onboarding/
  ├── 01-welcome.png
  ├── 02-goals-selection.png
  ├── 03-injury-input.png
  └── 04-results.png
```

---

## 🔍 Review Checklist

Before marking feature spec as "Ready for Development":

### Completeness
- [ ] All template sections filled out (or marked N/A)
- [ ] All Stitch screens referenced
- [ ] All API endpoints documented
- [ ] All database operations listed
- [ ] All error cases covered
- [ ] All edge cases considered

### Clarity
- [ ] User flow is step-by-step
- [ ] API requests/responses show actual JSON
- [ ] Error messages have exact copy
- [ ] Validation rules are specific
- [ ] Component props are typed

### Feasibility
- [ ] Required infrastructure exists (auth, DB tables, etc.)
- [ ] Dependencies are available
- [ ] AI model budget considered
- [ ] Performance requirements realistic
- [ ] Timeline is reasonable

### Alignment
- [ ] Matches Stitch designs
- [ ] Follows existing patterns (see FOUNDATION_COMPLETE.md)
- [ ] Reuses existing components where possible
- [ ] Consistent with other features
- [ ] Reviewed by team

---

## 🚦 Common Pitfalls

### Pitfall 1: "We'll figure it out during development"
**Problem:** Leads to scope creep and rework  
**Solution:** Document decisions upfront, update if needed

### Pitfall 2: Skipping error handling
**Problem:** Feature breaks in production  
**Solution:** Document every error case before coding

### Pitfall 3: Vague acceptance criteria
**Problem:** "Done" is subjective  
**Solution:** Make criteria testable (yes/no)

### Pitfall 4: Forgetting mobile
**Problem:** Looks great on desktop, broken on mobile  
**Solution:** Document responsive behavior explicitly

### Pitfall 5: Not updating the spec
**Problem:** Spec becomes outdated, loses value  
**Solution:** Update spec when requirements change

### Pitfall 6: Over-documenting
**Problem:** Spec becomes novel, nobody reads it  
**Solution:** Be thorough but concise. Use bullets, not paragraphs.

### Pitfall 7: Under-documenting
**Problem:** Missing critical details  
**Solution:** Fill every section, mark N/A if not applicable

---

## 📊 Example: Good vs Bad Specifications

### ❌ Bad Specification

```markdown
## Feature: Exercise Substitution

User can substitute exercises.

API: POST /api/substitute
Returns alternatives.

Components: SubstitutionModal

Done when: User can substitute
```

**Problems:**
- No user flow
- No API details (request/response)
- No error handling
- Vague acceptance criteria
- No design references

---

### ✅ Good Specification

```markdown
## Feature: Real-Time Exercise Substitution

User can find biomechanically equivalent exercise alternatives when equipment is unavailable or exercise causes discomfort, maintaining training stimulus.

### User Flow
1. During workout, user taps "Substitute" on current exercise
2. Modal opens (SubstitutionModal.tsx)
3. User selects reason (dropdown): "Equipment busy" / "Feeling pain" / "Other"
4. User can add text note (optional)
5. User taps "Find Alternatives"
6. System calls POST /api/ai/substitute with exercise context
7. Loading state shows (5-10 seconds)
8. User sees 3 alternatives, sorted by confidence (0-1)
9. User taps alternative to view details (load, sets, reps adjusted)
10. User taps "Use This" to replace exercise
11. Modal closes, session updates

### API: POST /api/ai/substitute

Request:
{
  "exerciseId": "uuid",
  "reason": "equipment_busy",
  "userNote": "Barbell bench in use",
  "context": {
    "currentWeight": 80,
    "currentReps": 10,
    "currentSets": 3
  }
}

Response (200):
{
  "alternatives": [
    {
      "exerciseId": "uuid",
      "name": "Dumbbell Bench Press",
      "confidence": 0.95,
      "adjustedWeight": 35,
      "rationale": "Biomechanically equivalent...",
      "movementPattern": "push_horizontal"
    }
  ]
}

Error (400):
{
  "error": "No suitable alternatives found",
  "suggestion": "Try manual search"
}

### Acceptance Criteria
- [ ] User can open substitution modal from session
- [ ] User can select reason from dropdown
- [ ] API returns 3 alternatives in <10 seconds
- [ ] Confidence score shows for each alternative
- [ ] Load translation is accurate (±5kg)
- [ ] Error message shows if AI fails
- [ ] Works on mobile (tested on iPhone)
```

**Why this is good:**
- Detailed user flow (numbered steps)
- Complete API spec (request + responses)
- Error handling documented
- Testable acceptance criteria
- Specific performance requirements

---

## 🎯 Template Customization

### For Your Project

Feel free to:
- **Add sections** specific to your domain
- **Remove sections** that don't apply
- **Adjust examples** to match your style
- **Change numbering** if needed

### Required Sections (Don't Remove)
1. Overview
2. User Flow
3. Screens & Design
4. API Endpoints (if applicable)
5. Database (if applicable)
6. Error Handling
7. Acceptance Criteria

### Optional Sections
- Business Logic (add if complex rules)
- AI Integration (only for AI features)
- Timeline (helpful for planning)
- Open Questions (good for early specs)

---

## 📞 Getting Help

**If you're stuck:**
1. Check `FOUNDATION_COMPLETE.md` for patterns to follow
2. Look at existing features for examples
3. Ask team member to review
4. Fill out what you know, mark rest as [TODO]

**Questions to ask:**
- "What existing components can I reuse?"
- "Is there a similar feature I can reference?"
- "What's the expected load time for this?"
- "How should this work offline?"

---

## 🚀 Quick Reference

### Template Filling Order
1. Metadata (5 min)
2. Overview (10 min)
3. User Stories (15 min)
4. Screens & Design (30 min)
5. User Flow (30 min)
6. API Endpoints (45 min)
7. Database (20 min)
8. Business Logic (20 min)
9. Components (20 min)
10. Error Handling (30 min)
11. Edge Cases (20 min)
12. Acceptance Criteria (15 min)
13. Everything else (30 min)

**Total: ~4-5 hours for a medium feature**

Worth it because:
- Prevents 2-3 days of rework
- Catches issues before coding
- Creates shared understanding
- Serves as documentation

---

**Remember:** A well-documented feature is easier to build, test, and maintain. Time spent on specification saves multiples in development! 🎯
