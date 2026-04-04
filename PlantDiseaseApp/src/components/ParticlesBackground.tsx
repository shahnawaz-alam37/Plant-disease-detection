/**
 * 🌌 ANIMATED PARTICLES BACKGROUND
 * Floating particle system with physics-based movement
 * Creates biotech atmosphere with glowing particles
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '../design/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// Generate random particles with physics properties
const generateParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3000 + 2000,
    delay: Math.random() * 1000,
  }));
};

const AnimatedParticle: React.FC<{ particle: Particle }> = ({ particle }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Float animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(20, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Fade in/out
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      false
    );

    // Pulse scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.particleGlow,
          {
            width: particle.size * 3,
            height: particle.size * 3,
            borderRadius: (particle.size * 3) / 2,
          },
        ]}
      />
    </Animated.View>
  );
};

export const ParticlesBackground: React.FC = () => {
  const particles = React.useMemo(() => generateParticles(), []);

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={DesignTokens.gradients.deepSpace}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Radial glow overlay */}
      <View style={styles.radialGlow} />

      {/* Particles */}
      {particles.map((particle) => (
        <AnimatedParticle key={particle.id} particle={particle} />
      ))}

      {/* Noise texture overlay */}
      <View style={styles.noiseOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DesignTokens.colors.deepBlack,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: DesignTokens.colors.aiGreen,
  },
  particleGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -6 }],
    backgroundColor: DesignTokens.colors.aiGreenGlow,
  },
  radialGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: DesignTokens.effects.noise.opacity,
  },
});

export default ParticlesBackground;
