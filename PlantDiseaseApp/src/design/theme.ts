/**
 * 🎨 THEME SYSTEM
 * Advanced theming architecture with full dark mode support
 * 
 * Features:
 * - Dynamic theme switching
 * - Context-aware colors
 * - Accessibility optimized
 * - Performance efficient
 */

import { DesignTokens } from './tokens';

export const DarkTheme = {
  ...DesignTokens,
  
  // Theme metadata
  meta: {
    name: 'Dark Biotech',
    mode: 'dark' as const,
    version: '2.0.0',
  },
  
  // Semantic color mappings
  semantic: {
    background: {
      primary: DesignTokens.colors.deepBlack,
      secondary: DesignTokens.colors.natureDark,
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
      strong: DesignTokens.colors.borderGlow,
    },
    
    interactive: {
      primary: DesignTokens.colors.aiGreen,
      primaryHover: DesignTokens.colors.aiGreenLight,
      primaryPressed: DesignTokens.colors.aiGreenDark,
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
        background: DesignTokens.colors.aiGreen,
        text: DesignTokens.colors.deepBlack,
        border: 'transparent',
        shadow: DesignTokens.shadows.glow,
      },
      secondary: {
        background: 'transparent',
        text: DesignTokens.colors.aiGreen,
        border: DesignTokens.colors.aiGreen,
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
      focusBorder: DesignTokens.colors.aiGreen,
    },
  },
} as const;

// Type exports
export type Theme = typeof DarkTheme;
export type SemanticColors = typeof DarkTheme.semantic;

// Default export
export default DarkTheme;
