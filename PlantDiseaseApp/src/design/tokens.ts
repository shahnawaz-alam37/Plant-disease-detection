/**
 * Design Tokens
 * Core design system for Plant Disease Detection
 * Consistent spacing, color, typography, and motion primitives.
 */

export const DesignTokens = {
  // Color Palette
  colors: {
    // Primary brand
    primary: '#00FF8A',
    primaryGlow: 'rgba(0, 255, 138, 0.25)',
    primaryDark: '#00CC6E',
    primaryLight: '#33FFA3',

    // Backgrounds
    deepBlack: '#0A0E14',
    backgroundDark: '#111820',
    surfaceDark: '#1A2028',
    surfaceElevated: '#232B35',

    // Accents
    cyan: '#00F5FF',
    lime: '#CCFF00',
    teal: '#00FFD1',
    purple: '#9D00FF',

    // Semantic
    success: '#00FF8A',
    warning: '#FFB800',
    error: '#FF3B6D',
    info: '#00C2FF',

    // Text hierarchy
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textTertiary: 'rgba(255, 255, 255, 0.50)',
    textDisabled: 'rgba(255, 255, 255, 0.30)',

    // Glass and overlays
    glassDark: 'rgba(26, 32, 40, 0.70)',
    glassMedium: 'rgba(35, 43, 53, 0.85)',
    glassLight: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(10, 14, 20, 0.80)',

    // Borders
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderMedium: 'rgba(255, 255, 255, 0.15)',
    borderAccent: 'rgba(0, 255, 138, 0.40)',
  },

  // Gradients
  gradients: {
    primary: ['#00FF8A', '#00CC6E', '#009955'],
    dark: ['#0A0E14', '#111820', '#1A2028'],
    accent: ['#00F5FF', '#00FF8A', '#CCFF00'],
    neutral: ['#0A0E14', '#1A2028', '#0A0E14'],
    contrast: ['#9D00FF', '#00F5FF'],
    fadeOut: ['rgba(0, 255, 138, 0.2)', 'rgba(0, 255, 138, 0)'],
    radial: ['rgba(0, 255, 138, 0.3)', 'rgba(0, 255, 138, 0)'],
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    huge: 96,
  },

  // Typography
  typography: {
    display: {
      fontSize: 56,
      fontWeight: '900' as const,
      letterSpacing: -2,
      lineHeight: 64,
      fontFamily: 'System',
    },
    title: {
      fontSize: 32,
      fontWeight: '800' as const,
      letterSpacing: -1,
      lineHeight: 40,
      fontFamily: 'System',
    },
    headline: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 32,
      fontFamily: 'System',
    },
    subhead: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 26,
      fontFamily: 'System',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 24,
      fontFamily: 'System',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.2,
      lineHeight: 20,
      fontFamily: 'System',
    },
    label: {
      fontSize: 14,
      fontWeight: '700' as const,
      letterSpacing: 1.5,
      lineHeight: 20,
      fontFamily: 'System',
      textTransform: 'uppercase' as const,
    },
    mono: {
      fontSize: 16,
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: 24,
      fontFamily: 'Courier',
    },
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    pill: 999,
    circle: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#00FF8A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 12,
    },
    glowIntense: {
      shadowColor: '#00FF8A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 30,
      elevation: 16,
    },
  },

  // Animation
  animation: {
    easing: {
      emphasized: [0.2, 0.0, 0, 1.0],
      emphasizedDecelerate: [0.05, 0.7, 0.1, 1.0],
      emphasizedAccelerate: [0.3, 0.0, 0.8, 0.15],
      standard: [0.2, 0.0, 0, 1.0],
      decelerate: [0.0, 0.0, 0, 1.0],
      accelerate: [0.3, 0.0, 1.0, 1.0],
      organic: [0.2, 0.8, 0.2, 1.0],
      bounce: [0.68, -0.55, 0.265, 1.55],
      elastic: [0.5, 1.25, 0.75, 1.25],
    },
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      verySlow: 800,
    },
    spring: {
      gentle: { damping: 20, stiffness: 90, mass: 1 },
      bouncy: { damping: 10, stiffness: 100, mass: 0.8 },
      snappy: { damping: 15, stiffness: 150, mass: 0.5 },
      smooth: { damping: 25, stiffness: 120, mass: 1 },
    },
  },

  // Component sizing
  sizing: {
    touchTarget: 44,
    icon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 48, xxl: 64 },
    button: { sm: 36, md: 48, lg: 56, xl: 64 },
    avatar: { sm: 32, md: 48, lg: 64, xl: 96 },
  },

  // Layout
  layout: {
    screenPadding: 20,
    cardPadding: 20,
    maxWidth: 600,
    gridColumns: 12,
    zIndex: {
      base: 0,
      card: 10,
      modal: 100,
      overlay: 200,
      dropdown: 300,
      toast: 400,
      tooltip: 500,
    },
  },

  // Visual effects
  effects: {
    glass: { blur: 20, opacity: 0.7, border: 'rgba(255, 255, 255, 0.1)' },
    particles: { count: 50, speed: 0.5, size: 2, opacity: 0.6 },
    noise: { opacity: 0.03, scale: 1.5 },
  },
} as const;

// Type exports
export type DesignTokensType = typeof DesignTokens;
export type ColorTokens = typeof DesignTokens.colors;
export type SpacingTokens = typeof DesignTokens.spacing;
export type TypographyTokens = typeof DesignTokens.typography;
