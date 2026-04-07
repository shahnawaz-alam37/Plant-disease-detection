/**
 * ANIMATION PRESETS
 * Reusable animation configurations and utilities
 */

import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { DesignTokens } from '../design/tokens';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌊 ENTRANCE ANIMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const entranceAnimations = {
  /**
   * Fade in with scale up
   */
  fadeInScale: (
    opacity: SharedValue<number>,
    scale: SharedValue<number>,
    delay: number = 0
  ) => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    scale.value = withDelay(
      delay,
      withSpring(1, DesignTokens.animation.spring.bouncy)
    );
  },

  /**
   * Bounce in from bottom
   */
  bounceInBottom: (
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    delay: number = 0
  ) => {
    translateY.value = withDelay(
      delay,
      withSpring(0, DesignTokens.animation.spring.bouncy)
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  },

  /**
   * Slide in from right
   */
  slideInRight: (
    translateX: SharedValue<number>,
    delay: number = 0
  ) => {
    translateX.value = withDelay(
      delay,
      withSpring(0, DesignTokens.animation.spring.smooth)
    );
  },

  /**
   * Staggered group entrance
   */
  staggeredEntrance: (
    items: SharedValue<number>[],
    baseDelay: number = 0,
    staggerDelay: number = 100
  ) => {
    items.forEach((item, index) => {
      item.value = withDelay(
        baseDelay + index * staggerDelay,
        withSpring(1, DesignTokens.animation.spring.bouncy)
      );
    });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRESS INTERACTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const pressAnimations = {
  /**
   * Standard button press
   */
  buttonPress: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.96, DesignTokens.animation.spring.snappy),
      withSpring(1.02, DesignTokens.animation.spring.bouncy),
      withSpring(1, DesignTokens.animation.spring.smooth)
    );
  },

  /**
   * Card press with subtle scale
   */
  cardPress: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.98, DesignTokens.animation.spring.snappy),
      withSpring(1, DesignTokens.animation.spring.smooth)
    );
  },

  /**
   * Icon button press with rotation
   */
  iconButtonPress: (
    scale: SharedValue<number>,
    rotation: SharedValue<number>
  ) => {
    scale.value = withSequence(
      withSpring(0.9, DesignTokens.animation.spring.snappy),
      withSpring(1, DesignTokens.animation.spring.bouncy)
    );
    rotation.value = withSequence(
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTINUOUS ANIMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const continuousAnimations = {
  /**
   * Gentle rotation loop
   */
  rotateLoop: (rotation: SharedValue<number>, duration: number = 20000) => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  },

  /**
   * Pulse/breathing effect
   */
  pulse: (
    scale: SharedValue<number>,
    min: number = 1.0,
    max: number = 1.05,
    duration: number = 2000
  ) => {
    scale.value = withRepeat(
      withSequence(
        withTiming(max, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(min, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  },

  /**
   * Glow pulse (opacity)
   */
  glowPulse: (
    opacity: SharedValue<number>,
    min: number = 0.3,
    max: number = 1.0,
    duration: number = 1500
  ) => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(max, { duration }),
        withTiming(min, { duration })
      ),
      -1,
      false
    );
  },

  /**
   * Float animation (up and down)
   */
  float: (
    translateY: SharedValue<number>,
    distance: number = 20,
    duration: number = 3000
  ) => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-distance, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(distance, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  },

  /**
   * Shimmer effect
   */
  shimmer: (translateX: SharedValue<number>, duration: number = 1500) => {
    translateX.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false
    );
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎪 COMPLEX SEQUENCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const complexAnimations = {
  /**
   * Success celebration
   */
  celebrate: (
    scale: SharedValue<number>,
    rotation: SharedValue<number>
  ) => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 5, stiffness: 100 }),
      withSpring(0.9, { damping: 5, stiffness: 100 }),
      withSpring(1, DesignTokens.animation.spring.bouncy)
    );
    rotation.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  },

  /**
   * Error shake
   */
  errorShake: (translateX: SharedValue<number>) => {
    translateX.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  },

  /**
   * Loading pulse
   */
  loadingPulse: (
    scale: SharedValue<number>,
    opacity: SharedValue<number>
  ) => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const animationUtils = {
  /**
   * Create a delayed spring animation
   */
  delayedSpring: (
    value: number,
    delay: number = 0,
    config = DesignTokens.animation.spring.smooth
  ) => {
    return withDelay(delay, withSpring(value, config));
  },

  /**
   * Create a delayed timing animation
   */
  delayedTiming: (
    value: number,
    delay: number = 0,
    duration: number = 300
  ) => {
    return withDelay(
      delay,
      withTiming(value, { duration, easing: Easing.inOut(Easing.ease) })
    );
  },

  /**
   * Reset animation to initial state
   */
  reset: (sharedValue: SharedValue<number>, initialValue: number = 0) => {
    sharedValue.value = withTiming(initialValue, { duration: 0 });
  },

  /**
   * Interpolate with custom easing
   */
  interpolateEasing: (
    input: number,
    inputRange: number[],
    outputRange: number[],
    easing = Easing.inOut(Easing.ease)
  ) => {
    // Custom interpolation logic
    const ratio = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
    const easedRatio = easing(ratio);
    return outputRange[0] + easedRatio * (outputRange[1] - outputRange[0]);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRESET CONFIGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const springConfigs = {
  ...DesignTokens.animation.spring,
  
  // Additional custom configs
  veryBouncy: {
    damping: 8,
    stiffness: 120,
    mass: 0.6,
  },
  
  quick: {
    damping: 20,
    stiffness: 200,
    mass: 0.3,
  },
  
  slow: {
    damping: 30,
    stiffness: 80,
    mass: 1.2,
  },
};

export const timingConfigs = {
  instant: { duration: 100 },
  fast: { duration: 200, easing: Easing.inOut(Easing.ease) },
  normal: { duration: 300, easing: Easing.inOut(Easing.ease) },
  slow: { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  verySlow: { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  entrance: entranceAnimations,
  press: pressAnimations,
  continuous: continuousAnimations,
  complex: complexAnimations,
  utils: animationUtils,
  spring: springConfigs,
  timing: timingConfigs,
};
