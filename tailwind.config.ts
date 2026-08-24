import type { Config } from "tailwindcss";
import { designTokens } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colors from Stitch design system (Kinetic Precision)
      colors: {
        // Primary - Neon Lime
        primary: {
          DEFAULT: designTokens.colors.primary,
          dim: designTokens.colors.primaryDim,
          container: designTokens.colors.primaryContainer,
          fixed: designTokens.colors.primaryFixed,
          "fixed-dim": designTokens.colors.primaryFixedDim,
          foreground: designTokens.colors.onPrimary,
          "foreground-container": designTokens.colors.onPrimaryContainer,
        },

        // Secondary - Olive Green
        secondary: {
          DEFAULT: designTokens.colors.secondary,
          container: designTokens.colors.secondaryContainer,
          fixed: designTokens.colors.secondaryFixed,
          "fixed-dim": designTokens.colors.secondaryFixedDim,
          foreground: designTokens.colors.onSecondary,
          "foreground-container": designTokens.colors.onSecondaryContainer,
        },

        // Tertiary - Neutral
        tertiary: {
          DEFAULT: designTokens.colors.tertiary,
          container: designTokens.colors.tertiaryContainer,
          fixed: designTokens.colors.tertiaryFixed,
          "fixed-dim": designTokens.colors.tertiaryFixedDim,
          foreground: designTokens.colors.onTertiary,
          "foreground-container": designTokens.colors.onTertiaryContainer,
        },

        // Surface system - Dark backgrounds
        surface: {
          DEFAULT: designTokens.colors.surface,
          dim: designTokens.colors.surfaceDim,
          bright: designTokens.colors.surfaceBright,
          container: {
            lowest: designTokens.colors.surfaceContainerLowest,
            low: designTokens.colors.surfaceContainerLow,
            DEFAULT: designTokens.colors.surfaceContainer,
            high: designTokens.colors.surfaceContainerHigh,
            highest: designTokens.colors.surfaceContainerHighest,
          },
          foreground: designTokens.colors.onSurface,
          "foreground-variant": designTokens.colors.onSurfaceVariant,
        },

        // Background
        background: {
          DEFAULT: designTokens.colors.background,
          foreground: designTokens.colors.onBackground,
        },

        // Semantic colors
        error: {
          DEFAULT: designTokens.colors.error,
          container: designTokens.colors.errorContainer,
          foreground: designTokens.colors.onError,
          "foreground-container": designTokens.colors.onErrorContainer,
        },

        // Outline system
        outline: {
          DEFAULT: designTokens.colors.outline,
          variant: designTokens.colors.outlineVariant,
        },

        // Inverse
        inverse: {
          surface: designTokens.colors.inverseSurface,
          "on-surface": designTokens.colors.inverseOnSurface,
          primary: designTokens.colors.inversePrimary,
        },

        // Brand accent
        accent: designTokens.colors.electricLime,

        // Text hierarchy
        text: {
          primary: designTokens.colors.text.primary,
          secondary: designTokens.colors.text.secondary,
          disabled: designTokens.colors.text.disabled,
        },
      },

      // Typography from Stitch
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },

      fontSize: designTokens.typography.fontSize,

      fontWeight: designTokens.typography.fontWeight,

      letterSpacing: designTokens.typography.letterSpacing,

      lineHeight: designTokens.typography.lineHeight,

      // Spacing from Stitch
      spacing: designTokens.spacing,

      // Border radius from Stitch
      borderRadius: designTokens.borderRadius,

      // Shadows
      boxShadow: designTokens.boxShadow,

      // Transitions
      transitionDuration: {
        fast: designTokens.transitions.duration.fast,
        normal: designTokens.transitions.duration.normal,
        slow: designTokens.transitions.duration.slow,
      },

      transitionTimingFunction: {
        ease: designTokens.transitions.easing.ease,
        "ease-in": designTokens.transitions.easing.easeIn,
        "ease-out": designTokens.transitions.easing.easeOut,
        "ease-in-out": designTokens.transitions.easing.easeInOut,
      },

      // Z-index
      zIndex: designTokens.zIndex,

      // Breakpoints
      screens: designTokens.screens,
    },
  },
  plugins: [],
};

export default config;
