/**
 * Design Tokens - Extracted from Stitch MCP
 * 
 * Source: Smart Gym Swap AI Project (ID: 5963366152735074449)
 * Design System: Kinetic Precision (Dark mode, Material Design 3)
 * 
 * This is the single source of truth for all design system values:
 * colors, typography, spacing, shadows, and breakpoints.
 * 
 * These tokens are used to:
 * 1. Configure Tailwind CSS (tailwind.config.ts)
 * 2. Theme UI components
 * 3. Maintain visual consistency across the app
 */

// ============================================================================
// 1. COLOR PALETTE (Material Design 3 - Dark Mode)
// ============================================================================

export const colors = {
  // Primary Colors (Neon Lime - Electric green for high visibility)
  primary: '#ebffe2',
  primaryDim: '#00e639',
  onPrimary: '#003907',
  primaryContainer: '#00ff41',
  onPrimaryContainer: '#007117',
  inversePrimary: '#006e16',
  primaryFixed: '#72ff70',
  primaryFixedDim: '#00e639',
  onPrimaryFixed: '#002203',
  onPrimaryFixedVariant: '#00530e',

  // Secondary Colors (Olive green for secondary actions)
  secondary: '#b9ccb1',
  onSecondary: '#243421',
  secondaryContainer: '#3a4b36',
  onSecondaryContainer: '#a7bba0',
  secondaryFixed: '#d5e8cc',
  secondaryFixedDim: '#b9ccb1',
  onSecondaryFixed: '#101f0e',
  onSecondaryFixedVariant: '#3a4b36',

  // Tertiary Colors (Neutral for supporting roles)
  tertiary: '#f9f9fa',
  onTertiary: '#2f3132',
  tertiaryContainer: '#dcdcdd',
  onTertiaryContainer: '#5f6162',
  tertiaryFixed: '#e3e2e3',
  tertiaryFixedDim: '#c6c6c7',
  onTertiaryFixed: '#1a1c1d',
  onTertiaryFixedVariant: '#454748',

  // Surface Colors (Dark background system)
  surface: '#131313',
  surfaceDim: '#131313',
  surfaceBright: '#3a3939',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9ccb2',
  surfaceVariant: '#353534',
  surfaceTint: '#00e639',

  // Semantic Colors (Status and feedback)
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  errorRed: '#ffb4ab',

  // Background
  background: '#131313',
  onBackground: '#e5e2e1',

  // Inverse Colors
  inverseSurface: '#e5e2e1',
  inverseOnSurface: '#313030',

  // Outline
  outline: '#84967e',
  outlineVariant: '#3b4b37',

  // Brand accent
  electricLime: '#00ff41',

  // Semantic text hierarchy
  text: {
    primary: '#e5e2e1',      // on-surface
    secondary: '#b9ccb2',    // on-surface-variant
    disabled: '#6b7280',     // dimmed
  },
} as const;

// ============================================================================
// 2. TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families (from Stitch)
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },

  // Font Sizes with Line Heights (from Stitch design system)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],         // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],        // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
    '5xl': ['3rem', { lineHeight: '1.2' }],          // 48px
  },

  // Stitch Typography Styles (Design tokens from Kinetic Precision)
  styles: {
    'display-lg': {
      fontFamily: 'Inter',
      fontSize: '48px',
      fontWeight: '800',
      lineHeight: '56px',
      letterSpacing: '-0.02em',
    },
    'display-lg-mobile': {
      fontFamily: 'Inter',
      fontSize: '36px',
      fontWeight: '800',
      lineHeight: '44px',
      letterSpacing: '-0.02em',
    },
    'headline-lg': {
      fontFamily: 'Inter',
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '40px',
      letterSpacing: '-0.01em',
    },
    'headline-lg-mobile': {
      fontFamily: 'Inter',
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '36px',
      letterSpacing: '-0.01em',
    },
    'headline-md': {
      fontFamily: 'Inter',
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
    },
    'body-lg': {
      fontFamily: 'Inter',
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '28px',
    },
    'body-md': {
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    'data-metric': {
      fontFamily: 'Inter',
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '32px',
      letterSpacing: '-0.02em',
    },
    'label-caps': {
      fontFamily: 'JetBrains Mono',
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: '16px',
      letterSpacing: '0.1em',
    },
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },

  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
} as const;

// ============================================================================
// 3. SPACING SCALE (from Stitch - base unit: 4px)
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px - base
  2: '0.5rem',    // 8px - xs
  3: '1rem',      // 16px - sm / gutter
  4: '1.5rem',    // 24px - md
  5: '1.25rem',   // 20px - margin-mobile
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px - lg
  12: '3rem',     // 48px
  16: '4rem',     // 64px - xl
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  30: '7.5rem',   // 120px - margin-desktop
  32: '8rem',     // 128px
} as const;

// ============================================================================
// 4. BORDER RADIUS (Stitch: ROUND_FOUR style)
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  default: '0.25rem',  // 4px - Stitch base
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',      // Fully rounded
} as const;

// ============================================================================
// 5. SHADOWS
// ============================================================================

export const boxShadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// ============================================================================
// 6. BREAKPOINTS
// ============================================================================

export const screens = {
  sm: '640px',      // Mobile landscape
  md: '768px',      // Tablet
  lg: '1024px',     // Desktop
  xl: '1280px',     // Large desktop
  '2xl': '1536px',  // Extra large
} as const;

// ============================================================================
// 7. COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button tokens
  button: {
    sizes: {
      sm: { padding: spacing[2], fontSize: typography.fontSize.sm },
      md: { padding: spacing[3], fontSize: typography.fontSize.base },
      lg: { padding: spacing[4], fontSize: typography.fontSize.lg },
    },
    borderRadius: borderRadius.md,
  },

  // Input tokens
  input: {
    borderRadius: borderRadius.md,
    borderColor: colors.border.default,
    focusBorderColor: colors.border.focus,
    errorBorderColor: colors.border.error,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
  },

  // Card tokens
  card: {
    borderRadius: borderRadius.lg,
    shadow: boxShadow.md,
    padding: spacing[6],
    backgroundColor: colors.background.default,
  },

  // Badge tokens
  badge: {
    borderRadius: borderRadius.full,
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
  },
} as const;

// ============================================================================
// 8. ANIMATION / TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// 9. Z-INDEX SCALE (Stacking context)
// ============================================================================

export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  modal: '1100',
  popover: '1200',
  tooltip: '1300',
  notification: '1400',
} as const;

// ============================================================================
// Type Exports (for TypeScript)
// ============================================================================

export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type BoxShadow = typeof boxShadow;
export type Screens = typeof screens;
export type Components = typeof components;
export type Transitions = typeof transitions;
export type ZIndex = typeof zIndex;

// ============================================================================
// Re-export all tokens as a single object
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  screens,
  components,
  transitions,
  zIndex,
} as const;

export default designTokens;
