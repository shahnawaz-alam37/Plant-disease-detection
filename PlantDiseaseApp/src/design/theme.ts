/**
 * Theme System
 * Dark theme with semantic color mappings built on top of design tokens.
 */

import { DesignTokens } from './tokens';

export const DarkTheme = {
  ...DesignTokens,

  // Theme metadata
  meta: {
    name: 'Dark',
    mode: 'dark' as const,
    version: '2.0.0',
  },

  // Semantic color mappings
  semantic: {
    background: {
      primary: DesignTokens.colors.deepBlack,
      secondary: DesignTokens.colors.backgroundDark,
      tertiary: DesignTokens.colors.surfaceDark,
      elevated: DesignTokens.colors.surfaceElevated,
    },

    text: {
      primary: DesignTokens.colors.textPrimary,
      secondary: DesignTokens.colors.textSecondary,
      tertiary: DesignTokens.colors.textTertiary,
      disabled: DesignTokens.colors.textDisabled,
      inverse: DesignTokens.colors.deepBlack,
    },

    border: {
      subtle: DesignTokens.colors.borderSubtle,
      medium: DesignTokens.colors.borderMedium,
      strong: DesignTokens.colors.borderAccent,
    },

    interactive: {
      primary: DesignTokens.colors.primary,
      primaryHover: DesignTokens.colors.primaryLight,
      primaryPressed: DesignTokens.colors.primaryDark,
      disabled: DesignTokens.colors.textDisabled,
    },

    feedback: {
      success: DesignTokens.colors.success,
      warning: DesignTokens.colors.warning,
      error: DesignTokens.colors.error,
      info: DesignTokens.colors.info,
    },
  },

  // Component-specific styles
  components: {
    button: {
      primary: {
        background: DesignTokens.colors.primary,
        text: DesignTokens.colors.deepBlack,
        border: 'transparent',
        shadow: DesignTokens.shadows.glow,
      },
      secondary: {
        background: 'transparent',
        text: DesignTokens.colors.primary,
        border: DesignTokens.colors.primary,
        shadow: DesignTokens.shadows.sm,
      },
      ghost: {
        background: DesignTokens.colors.glassLight,
        text: DesignTokens.colors.textPrimary,
        border: DesignTokens.colors.borderSubtle,
        shadow: DesignTokens.shadows.sm,
      },
    },

    card: {
      background: DesignTokens.colors.glassMedium,
      border: DesignTokens.colors.borderSubtle,
      shadow: DesignTokens.shadows.lg,
      borderRadius: DesignTokens.borderRadius.xl,
    },

    input: {
      background: DesignTokens.colors.surfaceDark,
      border: DesignTokens.colors.borderMedium,
      text: DesignTokens.colors.textPrimary,
      placeholder: DesignTokens.colors.textTertiary,
      focusBorder: DesignTokens.colors.primary,
    },
  },
} as const;

// Type exports
export type Theme = typeof DarkTheme;
export type SemanticColors = typeof DarkTheme.semantic;

// Default export
export default DarkTheme;
