/**
 * 📸 PREMIUM CAMERA SCREEN
 * Futuristic camera UI with:
 * - Glassmorphic round crop overlay
 * - Interactive edge highlights
 * - Smooth capture animations
 * - Real-time AI feedback
 * 
 * @performance Optimized for 60fps camera preview
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import { DesignTokens } from '../design/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH * 0.75;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CameraPremiumScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const scanRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const captureScale = useSharedValue(1);
  const focusRingScale = useSharedValue(0);
  const cornerGlow = useSharedValue(0);

  useEffect(() => {
    // Continuous scan line rotation
    scanRotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse animation for scanner ring
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Corner glow animation
    cornerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    // Trigger capture animation
    captureScale.value = withSequence(
      withSpring(0.9, DesignTokens.animation.spring.snappy),
      withSpring(1, DesignTokens.animation.spring.bouncy)
    );

    // Focus ring animation
    focusRingScale.value = withSequence(
      withSpring(1.2, DesignTokens.animation.spring.bouncy),
      withTiming(0, { duration: 300 })
    );

    // Simulate capture delay
    setTimeout(() => {
      setIsCapturing(false);
      // Navigate to result screen
      // navigation.navigate('Result', { imageData: capturedImage });
    }, 1500);
  };

  const scanRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${scanRotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const focusRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusRingScale.value }],
    opacity: interpolate(focusRingScale.value, [0, 1.2], [0, 1]),
  }));

  const cornerGlowStyle = useAnimatedStyle(() => ({
    opacity: cornerGlow.value,
  }));

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          We need your permission to access the camera for leaf scanning
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <LinearGradient
            colors={[DesignTokens.colors.aiGreen, DesignTokens.colors.aiGreenDark]}
            style={styles.permissionButtonGradient}
          >
            <Text style={styles.permissionButtonText}>GRANT ACCESS</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera Preview */}
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <LinearGradient
              colors={[DesignTokens.colors.glassDark, DesignTokens.colors.glassMedium]}
              style={styles.headerButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={[DesignTokens.colors.glassDark, DesignTokens.colors.glassMedium]}
              style={styles.headerTitle}
            >
              <Text style={styles.headerText}>AI LEAF SCANNER</Text>
            </LinearGradient>
          </View>

          <View style={styles.headerRight} />
        </View>

        {/* Scanner Frame Overlay */}
        <View style={styles.scannerOverlay}>
          {/* Dark overlay masks */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayRow}>
            <View style={styles.overlayLeft} />
            
            {/* Central Scanner Area */}
            <View style={styles.scannerFrame}>
              {/* Animated scan ring */}
              <Animated.View style={[styles.scanRing, pulseStyle]}>
                <Svg width={CROP_SIZE} height={CROP_SIZE}>
                  <AnimatedCircle
                    cx={CROP_SIZE / 2}
                    cy={CROP_SIZE / 2}
                    r={(CROP_SIZE / 2) - 3}
                    stroke={DesignTokens.colors.aiGreen}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10 5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <Circle
                    cx={CROP_SIZE / 2}
                    cy={CROP_SIZE / 2}
                    r={(CROP_SIZE / 2) - 10}
                    stroke={DesignTokens.colors.aiGreenGlow}
                    strokeWidth="1"
                    fill="none"
                    opacity="0.4"
                  />
                </Svg>
              </Animated.View>

              {/* Rotating scan line */}
              <Animated.View style={[styles.scanLineContainer, scanRotationStyle]}>
                <LinearGradient
                  colors={[
                    'rgba(0, 255, 138, 0)',
                    'rgba(0, 255, 138, 0.8)',
                    'rgba(0, 255, 138, 0)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanLine}
                />
              </Animated.View>

              {/* Focus ring (appears on capture) */}
              <Animated.View style={[styles.focusRing, focusRingStyle]}>
                <Svg width={CROP_SIZE} height={CROP_SIZE}>
                  <Circle
                    cx={CROP_SIZE / 2}
                    cy={CROP_SIZE / 2}
                    r={(CROP_SIZE / 2) - 5}
                    stroke={DesignTokens.colors.aiGreenLight}
                    strokeWidth="4"
                    fill="none"
                  />
                </Svg>
              </Animated.View>

              {/* Corner Brackets */}
              <Animated.View style={[styles.cornerBrackets, cornerGlowStyle]}>
                {/* Top Left */}
                <View style={[styles.bracket, styles.bracketTopLeft]}>
                  <LinearGradient
                    colors={[DesignTokens.colors.aiGreen, 'transparent']}
                    style={styles.bracketGradient}
                  />
                </View>

                {/* Top Right */}
                <View style={[styles.bracket, styles.bracketTopRight]}>
                  <LinearGradient
                    colors={[DesignTokens.colors.aiGreen, 'transparent']}
                    style={styles.bracketGradient}
                  />
                </View>

                {/* Bottom Left */}
                <View style={[styles.bracket, styles.bracketBottomLeft]}>
                  <LinearGradient
                    colors={['transparent', DesignTokens.colors.aiGreen]}
                    style={styles.bracketGradient}
                  />
                </View>

                {/* Bottom Right */}
                <View style={[styles.bracket, styles.bracketBottomRight]}>
                  <LinearGradient
                    colors={['transparent', DesignTokens.colors.aiGreen]}
                    style={styles.bracketGradient}
                  />
                </View>
              </Animated.View>

              {/* Center crosshair */}
              <View style={styles.crosshair}>
                <View style={styles.crosshairHorizontal} />
                <View style={styles.crosshairVertical} />
              </View>
            </View>

            <View style={styles.overlayRight} />
          </View>
          <View style={styles.overlayBottom} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <LinearGradient
            colors={[DesignTokens.colors.glassDark, DesignTokens.colors.glassMedium]}
            style={styles.instructionsBox}
          >
            <Text style={styles.instructionsText}>
              Position the leaf within the scanner frame
            </Text>
            <Text style={styles.instructionsSubtext}>
              Ensure good lighting and focus
            </Text>
          </LinearGradient>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          {/* Gallery Button */}
          <Pressable style={styles.controlButton}>
            <LinearGradient
              colors={[DesignTokens.colors.glassDark, DesignTokens.colors.glassMedium]}
              style={styles.controlButtonGradient}
            >
              <Text style={styles.controlIcon}>🖼️</Text>
            </LinearGradient>
          </Pressable>

          {/* Capture Button */}
          <Animated.View style={[styles.captureButtonContainer, captureButtonStyle]}>
            <Pressable onPress={handleCapture} disabled={isCapturing}>
              <View style={styles.captureButton}>
                <LinearGradient
                  colors={[DesignTokens.colors.aiGreen, DesignTokens.colors.aiGreenDark]}
                  style={styles.captureButtonGradient}
                >
                  {isCapturing ? (
                    <Text style={styles.captureButtonText}>ANALYZING...</Text>
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </LinearGradient>
              </View>
            </Pressable>
          </Animated.View>

          {/* Flash Button */}
          <Pressable style={styles.controlButton}>
            <LinearGradient
              colors={[DesignTokens.colors.glassDark, DesignTokens.colors.glassMedium]}
              style={styles.controlButtonGradient}
            >
              <Text style={styles.controlIcon}>⚡</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.deepBlack,
  },
  camera: {
    flex: 1,
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: DesignTokens.colors.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing.xl,
  },
  permissionText: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textSecondary,
  },
  permissionTitle: {
    ...DesignTokens.typography.title,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  permissionSubtitle: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xl,
  },
  permissionButton: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadows.glow,
  },
  permissionButtonGradient: {
    paddingHorizontal: DesignTokens.spacing.xxl,
    paddingVertical: DesignTokens.spacing.md,
  },
  permissionButtonText: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.deepBlack,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 48,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.md,
  },
  backButton: {
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
  },
  backIcon: {
    fontSize: 24,
    color: DesignTokens.colors.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
  },
  headerTitle: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderGlow,
  },
  headerText: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.aiGreen,
    fontSize: 12,
  },
  headerRight: {
    width: 44,
  },

  // Scanner Overlay
  scannerOverlay: {
    flex: 1,
  },
  overlayTop: {
    height: (SCREEN_HEIGHT - CROP_SIZE) / 2 - 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayRow: {
    flexDirection: 'row',
    height: CROP_SIZE,
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  // Scanner Frame
  scannerFrame: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanRing: {
    position: 'absolute',
  },
  scanLineContainer: {
    position: 'absolute',
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: CROP_SIZE,
    height: 2,
  },
  focusRing: {
    position: 'absolute',
  },

  // Corner Brackets
  cornerBrackets: {
    position: 'absolute',
    width: CROP_SIZE,
    height: CROP_SIZE,
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    overflow: 'hidden',
  },
  bracketGradient: {
    flex: 1,
    borderWidth: 3,
    borderColor: DesignTokens.colors.aiGreen,
  },
  bracketTopLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: DesignTokens.borderRadius.md,
  },
  bracketTopRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: DesignTokens.borderRadius.md,
  },
  bracketBottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: DesignTokens.borderRadius.md,
  },
  bracketBottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: DesignTokens.borderRadius.md,
  },

  // Crosshair
  crosshair: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 24,
    height: 1,
    backgroundColor: DesignTokens.colors.aiGreen,
    top: 12,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 24,
    backgroundColor: DesignTokens.colors.aiGreen,
    left: 12,
  },

  // Instructions
  instructions: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  instructionsBox: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    alignItems: 'center',
  },
  instructionsText: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing.xs,
  },
  instructionsSubtext: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
  },

  // Controls
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
  },
  controlButton: {
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: DesignTokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
  },
  controlIcon: {
    fontSize: 24,
  },

  // Capture Button
  captureButtonContainer: {
    borderRadius: 9999,
    ...DesignTokens.shadows.glowIntense,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: DesignTokens.colors.deepBlack,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    backgroundColor: DesignTokens.colors.deepBlack,
  },
  captureButtonText: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.deepBlack,
    fontSize: 10,
  },
});
