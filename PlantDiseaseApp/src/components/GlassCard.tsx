/**
 * 💫 GLASSMORPHIC CARD COMPONENT
 * Reusable premium card with blur effect and glass aesthetic
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { DesignTokens } from '../design/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'subtle';
  pressable?: boolean;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  pressable = false,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const getGradientColors = () => {
    switch (variant) {
      case 'elevated':
        return [
          DesignTokens.colors.surfaceElevated,
          DesignTokens.colors.surfaceDark,
        ];
      case 'subtle':
        return [
          DesignTokens.colors.glassDark,
          DesignTokens.colors.glassMedium,
        ];
      default:
        return [
          DesignTokens.colors.glassMedium,
          DesignTokens.colors.glassDark,
        ];
    }
  };

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, DesignTokens.animation.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, DesignTokens.animation.spring.bouncy);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Component = pressable ? Animated.Pressable : Animated.View;

  return (
    <Component
      onPressIn={pressable ? handlePressIn : undefined}
      onPressOut={pressable ? handlePressOut : undefined}
      onPress={pressable ? onPress : undefined}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
        
        {/* Glass border effect */}
        <View style={styles.borderGlow} />
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    position: 'relative',
    ...DesignTokens.shadows.md,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: DesignTokens.colors.primary,
    opacity: 0.3,
    borderTopLeftRadius: DesignTokens.borderRadius.xl,
    borderTopRightRadius: DesignTokens.borderRadius.xl,
  },
});

export default GlassCard;
