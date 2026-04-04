/**
 * 🎭 SKELETON LOADER
 * Shimmering skeleton for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '../design/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = DesignTokens.borderRadius.sm,
  style,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            DesignTokens.colors.glassLight,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

interface SkeletonGroupProps {
  count?: number;
  spacing?: number;
  height?: number;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  spacing = DesignTokens.spacing.sm,
  height = 20,
}) => {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} height={height} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surfaceDark,
    overflow: 'hidden',
  },
  shimmer: {
    width: 200,
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export default Skeleton;
