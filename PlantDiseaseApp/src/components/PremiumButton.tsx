/**
 * 🎯 PREMIUM ACTION BUTTON
 * Glassmorphic button with ripple effects and micro-interactions
 * Supports multiple variants with sophisticated animations
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '../design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  disabled = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, DesignTokens.animation.spring.snappy);
    glowOpacity.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.02, DesignTokens.animation.spring.bouncy),
      withSpring(1, DesignTokens.animation.spring.smooth)
    );
    glowOpacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Size configurations
  const sizeConfig = {
    small: {
      height: DesignTokens.sizing.button.sm,
      paddingHorizontal: DesignTokens.spacing.lg,
      fontSize: 14,
    },
    medium: {
      height: DesignTokens.sizing.button.md,
      paddingHorizontal: DesignTokens.spacing.xl,
      fontSize: 16,
    },
    large: {
      height: DesignTokens.sizing.button.lg,
      paddingHorizontal: DesignTokens.spacing.xxl,
      fontSize: 18,
    },
  };

  const currentSize = sizeConfig[size];

  // Variant styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: DesignTokens.colors.aiGreen,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: DesignTokens.colors.aiGreen,
        };
      case 'ghost':
        return {
          backgroundColor: DesignTokens.colors.glassDark,
          borderWidth: 1,
          borderColor: DesignTokens.colors.borderSubtle,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return DesignTokens.colors.deepBlack;
      case 'secondary':
      case 'ghost':
        return DesignTokens.colors.aiGreen;
      default:
        return DesignTokens.colors.textPrimary;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, { width: fullWidth ? '100%' : undefined }]}
    >
      <Animated.View
        style={[
          styles.button,
          getVariantStyle(),
          {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {/* Glow effect for primary variant */}
        {variant === 'primary' && (
          <Animated.View style={[styles.glow, glowAnimatedStyle]} />
        )}

        {/* Button content */}
        <Animated.View style={styles.content}>
          {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: currentSize.fontSize,
                fontWeight: '700',
                letterSpacing: 1,
              },
            ]}
          >
            {title.toUpperCase()}
          </Text>
        </Animated.View>

        {/* Ripple overlay */}
        <Animated.View style={[styles.ripple, glowAnimatedStyle]} />
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: DesignTokens.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...DesignTokens.shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontFamily: 'System',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: DesignTokens.colors.aiGreenGlow,
    borderRadius: DesignTokens.borderRadius.xl,
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default PremiumButton;
