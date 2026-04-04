/**
 * ⚡ ANIMATED PROGRESS RING
 * Circular progress indicator with gradient and glow
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { DesignTokens } from '../design/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-100
  color?: string;
  showPercentage?: boolean;
  duration?: number;
  delay?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  strokeWidth,
  progress,
  color = DesignTokens.colors.aiGreen,
  showPercentage = true,
  duration = 2000,
  delay = 0,
}) => {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setTimeout(() => {
      animatedProgress.value = withTiming(progress / 100, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, delay);
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={color + '99'} />
          </SvgLinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={DesignTokens.colors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color }]}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    ...DesignTokens.typography.title,
    fontWeight: '700',
  },
});

export default ProgressRing;
