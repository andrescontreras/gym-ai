# Design System Setup - Pre-Development

> **Status:** ⏳ Waiting for Stitch MCP connection  
> **Goal:** Extract design tokens → Create shared components → Team starts parallel work

---

## 🎯 Workflow Overview

```
1. Connect Stitch MCP
   ↓
2. Extract Design Tokens (colors, typography, spacing)
   ↓
3. Configure Tailwind with design tokens
   ↓
4. Create shared component library (matching Stitch)
   ↓
5. Document components for team
   ↓
6. Team starts parallel development ✅
```

---

## 📊 Phase 1: Extract Design Tokens from Stitch

### What to Extract

#### 1. Color Palette
```typescript
// Extract from Stitch:
const colors = {
  // Primary colors
  primary: {
    50: '#...',   // Lightest
    100: '#...',
    200: '#...',
    // ... through ...
    900: '#...',  // Darkest
  },
  
  // Secondary colors
  secondary: { ... },
  
  // Semantic colors
  success: '#...',
  warning: '#...',
  error: '#...',
  info: '#...',
  
  // Neutral/Gray scale
  gray: {
    50: '#...',
    // ... through ...
    900: '#...',
  },
  
  // Text colors
  text: {
    primary: '#...',
    secondary: '#...',
    disabled: '#...',
  },
  
  // Background colors
  background: {
    default: '#...',
    secondary: '#...',
    elevated: '#...',
  },
  
  // Border colors
  border: {
    default: '#...',
    focus: '#...',
    error: '#...',
  }
}
```

#### 2. Typography
```typescript
// Extract from Stitch:
const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  }
}
```

#### 3. Spacing Scale
```typescript
// Extract from Stitch:
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

#### 4. Border Radius
```typescript
// Extract from Stitch:
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // Fully rounded
}
```

#### 5. Shadows
```typescript
// Extract from Stitch:
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  none: '0 0 #0000',
}
```

#### 6. Breakpoints
```typescript
// Extract from Stitch:
const screens = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

---

## 📝 Phase 2: Configure Tailwind with Design Tokens

### Update `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. Colors from Stitch
      colors: {
        primary: {
          // Values from Stitch
          50: '#...',
          100: '#...',
          // ... etc
        },
        // ... all extracted colors
      },
      
      // 2. Typography from Stitch
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Values from Stitch
      },
      fontWeight: {
        // Values from Stitch
      },
      
      // 3. Spacing from Stitch
      spacing: {
        // Values from Stitch
      },
      
      // 4. Border radius from Stitch
      borderRadius: {
        // Values from Stitch
      },
      
      // 5. Shadows from Stitch
      boxShadow: {
        // Values from Stitch
      },
      
      // 6. Breakpoints from Stitch
      screens: {
        // Values from Stitch
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🎨 Phase 3: Create Shared Component Library

### Components to Create (Matching Stitch)

#### Priority 1: Form Components
Based on Stitch designs, create:

**Button** (`components/shared/Button.tsx`)
```tsx
// Variants from Stitch:
// - primary (main CTA)
// - secondary (outline)
// - ghost (text only)
// - danger (destructive)
// Sizes: sm, md, lg
// States: default, hover, active, disabled, loading
```

**Input** (`components/shared/Input.tsx`)
```tsx
// Variants from Stitch:
// - default
// - error
// - success
// - disabled
// With label, helper text, error message
```

**Select** (`components/shared/Select.tsx`)
```tsx
// Based on Stitch dropdown design
// States: default, open, disabled, error
```

**Checkbox** (`components/shared/Checkbox.tsx`)
```tsx
// Based on Stitch checkbox design
// States: unchecked, checked, indeterminate, disabled
```

#### Priority 2: Layout Components

**Card** (`components/shared/Card.tsx`)
```tsx
// Variants from Stitch:
// - default (elevated)
// - flat (no shadow)
// - outlined (border only)
// With header, body, footer sections
```

**Modal/Dialog** (`components/shared/Modal.tsx`)
```tsx
// Based on Stitch modal design
// Sizes: sm, md, lg, full
// With header, body, footer
```

#### Priority 3: Feedback Components

**Alert** (`components/shared/Alert.tsx`)
```tsx
// Variants from Stitch:
// - info
// - success
// - warning
// - error
```

**Toast** (`components/shared/Toast.tsx`)
```tsx
// Based on Stitch notification design
// Positions: top-right, top-center, bottom-right, etc.
// Auto-dismiss timing
```

**Loading** (`components/shared/Loading.tsx`)
```tsx
// Based on Stitch loading states
// Variants: spinner, skeleton, progress bar
```

#### Priority 4: Domain Components

**ExerciseCard** (`components/shared/ExerciseCard.tsx`)
```tsx
// Based on Stitch exercise card design
// Shows: name, muscle groups, equipment, image
// States: default, selected, disabled
```

**SetCounter** (`components/shared/SetCounter.tsx`)
```tsx
// Based on Stitch set tracking design
// Shows: set number, reps, weight
// Actions: increment, decrement, complete
```

**MuscleGroupBadge** (`components/shared/MuscleGroupBadge.tsx`)
```tsx
// Based on Stitch badge design
// Color-coded by muscle group
```

---

## 📋 Phase 4: Component Documentation

### For Each Component, Document:

1. **Visual Examples** (screenshots from Stitch)
2. **Props/API**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```
3. **Usage Examples**
```tsx
// Primary CTA
<Button variant="primary" size="lg">
  Start Workout
</Button>

// Secondary action
<Button variant="secondary">
  Cancel
</Button>
```
4. **States** (default, hover, active, disabled, loading)
5. **Accessibility** (keyboard navigation, ARIA labels)

---

## ✅ Extraction Checklist

### Once Stitch MCP is Connected:

- [ ] Extract color palette (primary, secondary, semantic, grays)
- [ ] Extract typography (fonts, sizes, weights, line heights)
- [ ] Extract spacing scale
- [ ] Extract border radius values
- [ ] Extract shadow definitions
- [ ] Extract breakpoints
- [ ] Document any animations/transitions
- [ ] Screenshot all component states from Stitch
- [ ] Note any specific design decisions (margins, paddings, etc.)

### Configuration:

- [ ] Update `tailwind.config.ts` with design tokens
- [ ] Update `app/globals.css` with CSS variables
- [ ] Test that Tailwind generates correct classes
- [ ] Verify responsive breakpoints work

### Component Creation:

- [ ] Create priority 1 components (forms)
- [ ] Create priority 2 components (layout)
- [ ] Create priority 3 components (feedback)
- [ ] Create priority 4 components (domain-specific)
- [ ] Test all variants and states
- [ ] Document usage in `docs/SHARED_COMPONENTS.md`
- [ ] Create component showcase/storybook (optional)

---

## 🔧 Tools for Component Development

### Storybook (Optional but Recommended)

**Benefits:**
- View all component states in isolation
- Test different props/variants
- Share with team before integration
- Serves as living documentation

**Setup:**
```bash
npx storybook@latest init
```

**Example Story:**
```tsx
// Button.stories.tsx
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Start Workout',
  },
};

export const Loading = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};
```

---

## 📊 Stitch MCP Queries (Once Connected)

### Expected Queries:

```typescript
// Get color palette
stitch.getColorTokens()

// Get typography system
stitch.getTypographyTokens()

// Get spacing scale
stitch.getSpacingTokens()

// Get component variants
stitch.getComponent({ id: 'button', variant: 'primary' })

// Get component states
stitch.getComponentStates({ id: 'button' })
```

---

## ⏱️ Timeline Estimate

### With Stitch MCP Connected:

| Phase | Task | Time | Owner |
|-------|------|------|-------|
| 1 | Extract design tokens | 2 hours | Designer + Dev |
| 2 | Configure Tailwind | 1 hour | Dev Lead |
| 3 | Create priority 1 components | 4 hours | Dev Lead |
| 3 | Create priority 2 components | 3 hours | Dev Lead |
| 3 | Create priority 3 components | 2 hours | Dev Lead |
| 3 | Create priority 4 components | 4 hours | Dev Lead |
| 4 | Document components | 2 hours | Dev Lead |
| 4 | Review with team | 1 hour | All |

**Total: ~2-3 days**

---

## 🎯 What to Prepare Now (Before Stitch MCP)

### While Waiting for Stitch Connection:

1. **Inventory Components Needed**
   - Review all feature specs
   - List every component mentioned
   - Identify duplicates → candidates for shared components

2. **Create Component Catalog Template**
```markdown
# Component Catalog

## Button
**Used By:** Onboarding, Session, Progress, Routines
**Variants Needed:**
- Primary (submit, confirm)
- Secondary (cancel, back)
- Danger (delete, remove)
**States:** default, hover, active, disabled, loading

## Card
**Used By:** All features
**Variants Needed:**
- Default (elevated with shadow)
- Flat (no shadow)
...
```

3. **Set Up Component Development Environment**
```bash
# Create shared components folder
mkdir -p components/shared

# Optional: Set up Storybook
npx storybook@latest init
```

4. **Define Component Creation Workflow**
   - Who creates components?
   - How to review?
   - How to document?
   - How to share with team?

---

## 🚀 Recommended Approach

### Option A: Sequential (Safest)
```
1. Wait for Stitch MCP ⏳
   ↓
2. Extract tokens (2 hrs)
   ↓
3. Create components (2-3 days)
   ↓
4. Team starts features ✅
```

**Timeline:** ~1 week total  
**Pros:** Perfect alignment with designs, no rework  
**Cons:** Team waits for component library

---

### Option B: Parallel (Faster)
```
Designer:                    Developers:
1. Finalize Stitch designs   1. Build feature UIs with
   ↓                            placeholders
2. Connect MCP               2. Create rough components
   ↓                            ↓
3. Extract tokens            3. Replace with real
   ↓                            components
4. Refine components ← ← ← ← 4. Integrate
```

**Timeline:** ~3-4 days total  
**Pros:** Faster to market, team stays productive  
**Cons:** Some rework needed, potential inconsistency

---

### Option C: Hybrid (Recommended) 💡
```
Week 1:
- Designer finalizes Stitch designs (screens + components)
- Team works on feature specs (user flows, APIs, logic)
- Dev lead prepares component structure

Week 2:
- Stitch MCP connects
- Dev lead extracts tokens + creates components (Days 1-3)
- Team reviews feature specs, prepares data layer (Days 1-3)
- Team starts UI integration with real components (Days 4-5)
```

**Timeline:** 1 week before full parallel work  
**Pros:** Balanced, team stays productive, minimal rework  
**Cons:** Requires coordination

---

## ✅ Next Steps (Action Items)

### Immediate (This Week):
- [ ] Schedule Stitch MCP connection setup
- [ ] Inventory components needed (from feature specs)
- [ ] Decide on workflow (Option A/B/C above)
- [ ] Assign component creation owner

### When Stitch MCP Connects:
- [ ] Extract all design tokens (use checklist above)
- [ ] Update `tailwind.config.ts`
- [ ] Create shared components (priority order)
- [ ] Document in `docs/SHARED_COMPONENTS.md`
- [ ] Share with team

### Before Team Starts Parallel Work:
- [ ] All priority 1 & 2 components created
- [ ] Component documentation complete
- [ ] Team trained on component usage
- [ ] Example implementations created

---

## 📞 Questions to Answer

**Before we proceed, clarify:**

1. **Timeline:**
   - When will Stitch MCP be connected?
   - When do you want team to start parallel work?

2. **Scope:**
   - Should we create all components upfront?
   - Or create as needed during development?

3. **Ownership:**
   - Who will extract design tokens?
   - Who will create shared components?
   - Who will document/maintain?

4. **Tooling:**
   - Do you want Storybook for component showcase?
   - Any other design tools to integrate?

---

**Last Updated:** August 21, 2026  
**Status:** ⏳ Waiting for Stitch MCP connection  
**Next Action:** Schedule Stitch MCP setup + decide on workflow
