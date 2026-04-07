/**
 * 🍃 3D PARALLAX LEAF SCANNER
 * Interactive 3D leaf model with gyroscope parallax
 * Premium centerpiece for the home screen
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { DesignTokens } from '../design/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEAF_SIZE = SCREEN_WIDTH * 0.55;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const Leaf3DScanner: React.FC = () => {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowPulse = useSharedValue(0);
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    // Gentle rotation for 3D effect
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Breathing scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      false
    );

    // Scan line animation
    scanLineY.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const leafAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { perspective: 1000 },
      { rotateX: '5deg' },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scanLineY.value, [0, 1], [-LEAF_SIZE / 2, LEAF_SIZE / 2]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Outer glow rings */}
      <Animated.View style={[styles.glowRing, styles.glowRingOuter, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowRing, styles.glowRingMiddle, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowRing, styles.glowRingInner, glowAnimatedStyle]} />

      {/* Main leaf with 3D transform */}
      <Animated.View style={[styles.leafContainer, leafAnimatedStyle]}>
        <AnimatedSvg width={LEAF_SIZE} height={LEAF_SIZE} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="leafGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={DesignTokens.colors.primary} stopOpacity="0.9" />
              <Stop offset="50%" stopColor={DesignTokens.colors.primaryDark} stopOpacity="0.7" />
              <Stop offset="100%" stopColor={DesignTokens.colors.primaryDark} stopOpacity="0.5" />
            </RadialGradient>
          </Defs>

          {/* Leaf shape */}
          <Path
            d="M100,20 C120,20 160,40 180,80 C200,120 180,160 140,180 C120,190 80,190 60,180 C20,160 0,120 20,80 C40,40 80,20 100,20 Z"
            fill="url(#leafGradient)"
            stroke={DesignTokens.colors.primary}
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Leaf veins */}
          <Path
            d="M100,40 L100,160 M60,80 Q100,90 140,80 M60,120 Q100,125 140,120"
            stroke={DesignTokens.colors.primaryLight}
            strokeWidth="1.5"
            opacity="0.6"
            fill="none"
          />

          {/* Center glow */}
          <Circle
            cx="100"
            cy="100"
            r="30"
            fill={DesignTokens.colors.primaryGlow}
            opacity="0.5"
          />
        </AnimatedSvg>

        {/* Scan line overlay */}
        <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]}>
          <LinearGradient
            colors={[
              'rgba(0, 255, 138, 0)',
              'rgba(0, 255, 138, 0.8)',
              'rgba(0, 255, 138, 0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scanLineGradient}
          />
        </Animated.View>
      </Animated.View>

      {/* Grid overlay for tech aesthetic */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, { top: '33%' }]} />
        <View style={[styles.gridLine, { top: '66%' }]} />
        <View style={[styles.gridLine, styles.gridLineVertical]} />
        <View style={[styles.gridLine, styles.gridLineVertical, { left: '33%' }]} />
        <View style={[styles.gridLine, styles.gridLineVertical, { left: '66%' }]} />
      </View>

      {/* Corner brackets for scanner frame */}
      <View style={styles.cornerBrackets}>
        <View style={[styles.bracket, styles.bracketTopLeft]} />
        <View style={[styles.bracket, styles.bracketTopRight]} />
        <View style={[styles.bracket, styles.bracketBottomLeft]} />
        <View style={[styles.bracket, styles.bracketBottomRight]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: LEAF_SIZE * 1.3,
    height: LEAF_SIZE * 1.3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  leafContainer: {
    width: LEAF_SIZE,
    height: LEAF_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: DesignTokens.colors.primaryGlow,
  },
  glowRingOuter: {
    width: LEAF_SIZE * 1.3,
    height: LEAF_SIZE * 1.3,
  },
  glowRingMiddle: {
    width: LEAF_SIZE * 1.15,
    height: LEAF_SIZE * 1.15,
  },
  glowRingInner: {
    width: LEAF_SIZE,
    height: LEAF_SIZE,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 4,
    overflow: 'visible',
  },
  scanLineGradient: {
    width: '100%',
    height: 20,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: DesignTokens.colors.primary,
    top: 0,
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    left: 0,
  },
  cornerBrackets: {
    ...StyleSheet.absoluteFillObject,
  },
  bracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: DesignTokens.colors.primary,
    borderWidth: 2,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default Leaf3DScanner;
