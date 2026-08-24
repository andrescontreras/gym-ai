# Shared Components Guide

> **Status:** Essential + AI recommendation components ready ✅  
> **Last Updated:** August 23, 2026

## New Components From Latest Stitch Screens

The latest screens (AI Recommendations, Input AI Constraints, Updated Workout Confirmation) introduced reusable patterns that are now implemented as shared components:

- `StatusChip` in `components/shared/StatusChip.tsx`
  - Variants: `default | success | warning | error | info | confidence`
  - Use for confidence badges, quick status labels, and compact indicators

- `MetricTile` in `components/shared/MetricTile.tsx`
  - Use for KPI-style values like BPM, lactate, timeout, RPE, and workload values

- `RecommendationCard` in `components/shared/RecommendationCard.tsx`
  - Structured AI substitution block with stimulus match, sets/reps/load/RPE, and justification

All are exported through `components/shared/index.ts`.

---

## 🎨 Available Components

### Shadcn UI Components (Installed)

These components are ready to use. Import from `@/components/ui/`:

| Component | Import | Use Case | Documentation |
|-----------|--------|----------|---------------|
| **Button** | `import { Button } from "@/components/ui/button"` | All buttons, CTAs, actions | [Docs](https://ui.shadcn.com/docs/components/button) |

### To Be Installed (Before Team Starts)

These should be installed before parallel development:

| Component | Install Command | Priority | Used By |
|-----------|----------------|----------|---------|
| **Card** | `npx shadcn@latest add card` | 🔴 HIGH | All features (containers) |
| **Input** | `npx shadcn@latest add input` | 🔴 HIGH | Forms, search, filters |
| **Label** | `npx shadcn@latest add label` | 🔴 HIGH | All forms |
| **Form** | `npx shadcn@latest add form` | 🔴 HIGH | Onboarding, settings |
| **Select** | `npx shadcn@latest add select` | 🔴 HIGH | Dropdowns, filters |
| **Dialog** | `npx shadcn@latest add dialog` | 🟡 MEDIUM | Modals, confirmations |
| **Badge** | `npx shadcn@latest add badge` | 🟡 MEDIUM | Status indicators |
| **Separator** | `npx shadcn@latest add separator` | 🟡 MEDIUM | Visual dividers |
| **Skeleton** | `npx shadcn@latest add skeleton` | 🟡 MEDIUM | Loading states |
| **Toast** | `npx shadcn@latest add toast` | 🟡 MEDIUM | Notifications |
| **Tabs** | `npx shadcn@latest add tabs` | 🟢 LOW | Tab navigation |
| **Progress** | `npx shadcn@latest add progress` | 🟢 LOW | Loading bars |
| **Slider** | `npx shadcn@latest add slider` | 🟢 LOW | Range inputs |
| **Checkbox** | `npx shadcn@latest add checkbox` | 🟢 LOW | Multi-select |
| **Radio Group** | `npx shadcn@latest add radio-group` | 🟢 LOW | Single-select |

---

## 🚀 Quick Setup (Run This Now)

### Install All Essential Components

Run these commands one-by-one to avoid SSL timeout:

```bash
# HIGH Priority (Required for all features)
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add select

# MEDIUM Priority (Commonly used)
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add toast

# LOW Priority (Install as needed)
npx shadcn@latest add tabs
npx shadcn@latest add progress
npx shadcn@latest add slider
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
```

**Estimated Time:** 15-20 minutes

---

## 📋 Custom Shared Components

### To Be Created (Before Team Starts)

These are Gym AI-specific components that multiple features will need:

| Component | Location | Purpose | Owner | Status |
|-----------|----------|---------|-------|--------|
| **ExerciseCard** | `components/shared/ExerciseCard.tsx` | Display exercise info | [TBD] | ⏳ TODO |
| **SetCounter** | `components/shared/SetCounter.tsx` | Track sets during workout | [TBD] | ⏳ TODO |
| **LoadingSpinner** | `components/shared/LoadingSpinner.tsx` | Consistent loading indicator | [TBD] | ⏳ TODO |
| **ErrorMessage** | `components/shared/ErrorMessage.tsx` | Consistent error display | [TBD] | ⏳ TODO |
| **EmptyState** | `components/shared/EmptyState.tsx` | No data placeholders | [TBD] | ⏳ TODO |

---

## 🎨 Component Usage Guidelines

### 1. Always Use Shadcn Components First

**Before creating a new component, check:**
- [ ] Is there a Shadcn component for this?
- [ ] Is there a custom shared component for this?
- [ ] Can I compose existing components?

**Example:**
```tsx
// ❌ DON'T create custom button
const MyButton = () => <div className="...">Click</div>

// ✅ DO use Shadcn Button
import { Button } from "@/components/ui/button"
<Button variant="default">Click</Button>
```

### 2. Extend, Don't Modify Shadcn Components

**Never modify files in `components/ui/` directly!**

**Instead, create wrapper components:**
```tsx
// ✅ components/shared/PrimaryButton.tsx
import { Button } from "@/components/ui/button"

export function PrimaryButton({ children, ...props }) {
  return (
    <Button 
      variant="default" 
      size="lg"
      className="bg-blue-600 hover:bg-blue-700"
      {...props}
    >
      {children}
    </Button>
  )
}
```

### 3. Use Consistent Variants

**Button Variants:**
- `default` - Primary actions (submit, confirm)
- `destructive` - Delete, remove, dangerous actions
- `outline` - Secondary actions (cancel, back)
- `ghost` - Tertiary actions (close, dismiss)
- `link` - Text-only links

**Example:**
```tsx
<Button variant="default">Start Workout</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete Routine</Button>
```

### 4. Consistent Sizing

**Size Scale:**
- `sm` - Small UI elements, compact spaces
- `default` - Standard buttons, inputs
- `lg` - Hero CTAs, important actions
- `icon` - Icon-only buttons

---

## 📐 Spacing & Layout Conventions

### Container Padding
```tsx
// Page containers
<div className="container mx-auto p-4 md:p-6 lg:p-8">

// Card padding
<Card className="p-4 md:p-6">

// Section spacing
<section className="space-y-4">
```

### Common Patterns
```tsx
// Form group
<div className="space-y-2">
  <Label>Exercise Name</Label>
  <Input placeholder="Barbell Bench Press" />
</div>

// Button group
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="default">Save</Button>
</div>

// Card list
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## 🎯 Component Ownership

### Who Creates What?

**Shadcn Components:**
- Anyone can install (run command)
- Document in this file when installed

**Shared Components:**
- Propose in team meeting
- Assign owner
- Review before merging
- Document here

**Feature-Specific Components:**
- Created by feature owner
- Lives in feature folder (e.g., `components/onboarding/`)
- Can be promoted to shared if reused

---

## 📝 Proposing a New Shared Component

### Before Creating:

1. **Check if it exists:**
   - Shadcn library
   - `components/shared/`
   - Similar components in other features

2. **Ask these questions:**
   - Will 2+ features use this?
   - Is it truly shared or feature-specific?
   - Can I compose existing components instead?

3. **Document it:**
   Add to "Custom Shared Components" table above

### Component Template:

```tsx
// components/shared/[ComponentName].tsx
import { cn } from "@/lib/utils/cn"

interface ComponentNameProps {
  // Define props with TypeScript
  variant?: "default" | "compact"
  className?: string
}

export function ComponentName({ 
  variant = "default",
  className,
  ...props 
}: ComponentNameProps) {
  return (
    <div className={cn(
      "base-classes",
      variant === "compact" && "compact-classes",
      className
    )}>
      {/* Component content */}
    </div>
  )
}
```

---

## 🔍 Component Catalog

### Quick Reference by Feature Need

**Need to build a form?**
- Form (wrapper with validation)
- Input (text fields)
- Label (field labels)
- Select (dropdowns)
- Button (submit, cancel)

**Need to show data?**
- Card (containers)
- Badge (status indicators)
- Separator (dividers)

**Need loading/error states?**
- Skeleton (loading placeholders)
- Spinner (loading indicator)
- Toast (notifications)
- ErrorMessage (error display)

**Need user interactions?**
- Dialog (modals, confirmations)
- Button (all actions)
- Tabs (navigation)

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Creating Duplicate Components
```tsx
// DON'T create these - use Shadcn instead
const MyButton = ...     // ❌ Use Button from Shadcn
const MyInput = ...      // ❌ Use Input from Shadcn
const MyCard = ...       // ❌ Use Card from Shadcn
```

### ❌ Modifying Shadcn Files
```tsx
// ❌ DON'T edit components/ui/button.tsx
// ✅ DO create components/shared/CustomButton.tsx
```

### ❌ Inconsistent Styling
```tsx
// ❌ DON'T hardcode colors
<button className="bg-blue-500">

// ✅ DO use Tailwind semantic classes
<Button variant="default">
```

### ❌ Non-Responsive Design
```tsx
// ❌ DON'T ignore mobile
<div className="w-[800px]">

// ✅ DO use responsive classes
<div className="w-full md:w-[800px]">
```

---

## 📦 Component Installation Log

### Track What's Installed

Update this table when you install components:

| Component | Installed By | Date | Notes |
|-----------|--------------|------|-------|
| Button | Initial setup | Aug 21, 2026 | ✅ Working |
| Card | [Name] | [Date] | Status |
| Input | [Name] | [Date] | Status |
| Form | [Name] | [Date] | Status |

---

## 🎨 Design Tokens (Coming from Stitch)

### Colors
```
Primary: #[from Stitch]
Secondary: #[from Stitch]
Accent: #[from Stitch]
Error: #[from Stitch]
Success: #[from Stitch]
```

**TODO:** Extract from Stitch and update `tailwind.config.js`

### Typography
```
Heading: [from Stitch]
Body: [from Stitch]
Caption: [from Stitch]
```

**TODO:** Extract from Stitch and update CSS variables

---

## ✅ Pre-Development Checklist

Before team starts parallel development:

- [ ] All HIGH priority Shadcn components installed
- [ ] Component usage guidelines shared with team
- [ ] Custom shared components identified
- [ ] Component ownership assigned
- [ ] Design tokens extracted from Stitch (optional)
- [ ] This document shared with all team members

---

## 📞 Questions?

**"Which component should I use for X?"**
- Check Shadcn catalog: https://ui.shadcn.com/docs/components
- Check this document's "Quick Reference by Feature Need"
- Ask in team chat

**"Should I create a new shared component?"**
- Check "Proposing a New Shared Component" section
- Ask team before creating

**"Can I modify a Shadcn component?"**
- NO - create a wrapper instead
- See "Extend, Don't Modify" section

---

**Last Updated:** August 21, 2026  
**Maintained By:** Development Team  
**Next Review:** Before each feature kickoff
