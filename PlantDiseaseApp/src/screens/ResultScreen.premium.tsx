/**
 * 📊 PREMIUM RESULT SCREEN
 * High-end diagnosis display with:
 * - 3D rotating leaf preview
 * - Liquid fill confidence meter
 * - Kinetic typography animations
 * - Particle effects
 * - Interactive data visualization
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  SlideInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { DesignTokens } from '../design/tokens';
import PremiumButton from '../components/PremiumButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.6;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ConfidenceBarProps {
  label: string;
  value: number;
  color: string;
  delay: number;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ label, value, color, delay }) => {
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      progress.value = withTiming(value / 100, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      glowOpacity.value = withTiming(0.8, { duration: 800 });
    }, delay);
  }, [value]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.confidenceBarContainer}>
      <View style={styles.confidenceBarHeader}>
        <Text style={styles.confidenceLabel}>{label}</Text>
        <Animated.Text
          entering={FadeIn.delay(delay + 500)}
          style={styles.confidenceValue}
        >
          {value}%
        </Animated.Text>
      </View>

      <View style={styles.confidenceBarTrack}>
        <Animated.View style={[styles.confidenceBarFill, barAnimatedStyle]}>
          <LinearGradient
            colors={[color, color + '99']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confidenceBarGradient}
          />
          <Animated.View
            style={[
              styles.confidenceBarGlow,
              glowAnimatedStyle,
              { backgroundColor: color },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, color, index }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, DesignTokens.animation.spring.bouncy);
    }, 800 + index * 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.metricCard, animatedStyle]}>
      <LinearGradient
        colors={[
          DesignTokens.colors.surfaceElevated,
          DesignTokens.colors.surfaceDark,
        ]}
        style={styles.metricCardGradient}
      >
        <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.metricIcon}>{icon}</Text>
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <View style={[styles.metricBorder, { backgroundColor: color }]} />
      </LinearGradient>
    </Animated.View>
  );
};

export default function ResultPremiumScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Mock data - replace with actual result data
  const [result] = useState({
    disease: 'Tomato Late Blight',
    confidence: 96.8,
    severity: 'High',
    recommendations: [
      'Remove affected leaves immediately',
      'Apply copper-based fungicide',
      'Improve air circulation',
      'Reduce overhead watering',
    ],
    detailScores: [
      { label: 'Leaf Texture', value: 94 },
      { label: 'Color Pattern', value: 98 },
      { label: 'Spot Distribution', value: 97 },
    ],
  });

  // Animation values
  const imageRotateY = useSharedValue(0);
  const imageScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const circleProgress = useSharedValue(0);

  useEffect(() => {
    // Image entrance with 3D rotation
    imageScale.value = withSpring(1, DesignTokens.animation.spring.bouncy);
    imageRotateY.value = withSequence(
      withTiming(15, { duration: 400 }),
      withSpring(0, DesignTokens.animation.spring.smooth)
    );

    // Header fade in
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Confidence circle animation
    circleProgress.value = withDelay(
      400,
      withTiming(result.confidence / 100, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${imageRotateY.value}deg`;
    return {
      transform: [
        { perspective: 1000 },
        { rotateY },
        { scale: imageScale.value },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const circumference = 2 * Math.PI * 80;
  const circleAnimatedStyle = useAnimatedStyle(() => ({
    strokeDashoffset: circumference * (1 - circleProgress.value),
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return DesignTokens.colors.error;
      case 'medium':
        return DesignTokens.colors.warning;
      case 'low':
        return DesignTokens.colors.success;
      default:
        return DesignTokens.colors.info;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={DesignTokens.gradients.deepSpace}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Diagnosis Complete</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Leaf Image with 3D Rotation */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <View style={styles.imageFrame}>
            {/* Placeholder - replace with actual image */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🍃</Text>
            </View>

            {/* Confidence Circle Overlay */}
            <View style={styles.confidenceCircleContainer}>
              <Svg width={180} height={180}>
                <Defs>
                  <SvgLinearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={DesignTokens.colors.aiGreen} />
                    <Stop offset="100%" stopColor={DesignTokens.colors.aiGreenLight} />
                  </SvgLinearGradient>
                </Defs>

                {/* Background circle */}
                <Circle
                  cx="90"
                  cy="90"
                  r="80"
                  stroke={DesignTokens.colors.borderSubtle}
                  strokeWidth="8"
                  fill="none"
                />

                {/* Animated progress circle */}
                <AnimatedCircle
                  cx="90"
                  cy="90"
                  r="80"
                  stroke="url(#confidenceGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  style={circleAnimatedStyle}
                  rotation="-90"
                  origin="90, 90"
                />
              </Svg>

              {/* Confidence percentage */}
              <Animated.View
                entering={FadeIn.delay(1000).springify()}
                style={styles.confidenceTextContainer}
              >
                <Text style={styles.confidencePercentage}>{result.confidence}%</Text>
                <Text style={styles.confidenceText}>CONFIDENCE</Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Disease Name with Glitch Animation */}
        <Animated.View
          entering={SlideInUp.delay(600).springify()}
          style={styles.diseaseNameContainer}
        >
          <LinearGradient
            colors={[
              DesignTokens.colors.glassMedium,
              DesignTokens.colors.glassDark,
            ]}
            style={styles.diseaseNameCard}
          >
            <Text style={styles.diseaseLabel}>DETECTED DISEASE</Text>
            <Text style={styles.diseaseName}>{result.disease}</Text>
            
            {/* Severity Badge */}
            <View style={styles.severityBadge}>
              <LinearGradient
                colors={[
                  getSeverityColor(result.severity),
                  getSeverityColor(result.severity) + '80',
                ]}
                style={styles.severityBadgeGradient}
              >
                <Text style={styles.severityText}>SEVERITY: {result.severity.toUpperCase()}</Text>
              </LinearGradient>
            </View>

            <View style={[styles.diseaseNameBorder, { backgroundColor: DesignTokens.colors.aiGreen }]} />
          </LinearGradient>
        </Animated.View>

        {/* Metric Cards */}
        <Animated.View
          entering={FadeIn.delay(800)}
          style={styles.metricsSection}
        >
          <Text style={styles.sectionTitle}>Analysis Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon="🎯"
              label="Accuracy"
              value={result.confidence + '%'}
              color={DesignTokens.colors.aiGreen}
              index={0}
            />
            <MetricCard
              icon="⚡"
              label="Speed"
              value="0.8s"
              color={DesignTokens.colors.cyanGlow}
              index={1}
            />
            <MetricCard
              icon="🔬"
              label="Samples"
              value="2.4K"
              color={DesignTokens.colors.purpleGlow}
              index={2}
            />
          </View>
        </Animated.View>

        {/* Detailed Confidence Bars */}
        <Animated.View
          entering={SlideInRight.delay(1000)}
          style={styles.detailsSection}
        >
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>
          {result.detailScores.map((score, index) => (
            <ConfidenceBar
              key={score.label}
              label={score.label}
              value={score.value}
              color={DesignTokens.colors.aiGreen}
              delay={1200 + index * 150}
            />
          ))}
        </Animated.View>

        {/* Recommendations */}
        <Animated.View
          entering={FadeIn.delay(1600)}
          style={styles.recommendationsSection}
        >
          <Text style={styles.sectionTitle}>Treatment Recommendations</Text>
          {result.recommendations.map((rec, index) => (
            <Animated.View
              key={index}
              entering={SlideInRight.delay(1700 + index * 100).springify()}
              style={styles.recommendationItem}
            >
              <LinearGradient
                colors={[
                  DesignTokens.colors.surfaceElevated,
                  DesignTokens.colors.surfaceDark,
                ]}
                style={styles.recommendationCard}
              >
                <View style={styles.recommendationIcon}>
                  <Text style={styles.recommendationNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendationText}>{rec}</Text>
                <View style={styles.recommendationBorder} />
              </LinearGradient>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeIn.delay(2000)}
          style={styles.actionsSection}
        >
          <PremiumButton
            title="Save to History"
            onPress={() => {}}
            variant="primary"
            size="large"
            fullWidth
          />

          <View style={styles.buttonRow}>
            <View style={styles.halfButton}>
              <PremiumButton
                title="Share"
                onPress={() => {}}
                variant="secondary"
                size="medium"
                fullWidth
              />
            </View>
            <View style={styles.halfButton}>
              <PremiumButton
                title="New Scan"
                onPress={() => navigation.navigate('Capture')}
                variant="ghost"
                size="medium"
                fullWidth
              />
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DesignTokens.spacing.xxl,
    marginBottom: DesignTokens.spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
  },
  backIcon: {
    fontSize: 24,
    color: DesignTokens.colors.textPrimary,
  },
  headerTitle: {
    ...DesignTokens.typography.headline,
    color: DesignTokens.colors.textPrimary,
  },

  // Image Container
  imageContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xl,
  },
  imageFrame: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: DesignTokens.borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    ...DesignTokens.shadows.lg,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: DesignTokens.colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 120,
  },
  confidenceCircleContainer: {
    position: 'absolute',
    bottom: -30,
    right: -30,
  },
  confidenceTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidencePercentage: {
    ...DesignTokens.typography.title,
    color: DesignTokens.colors.aiGreen,
    fontSize: 28,
  },
  confidenceText: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },

  // Disease Name
  diseaseNameContainer: {
    marginBottom: DesignTokens.spacing.xl,
  },
  diseaseNameCard: {
    padding: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.xl,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    position: 'relative',
    ...DesignTokens.shadows.md,
  },
  diseaseLabel: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.textSecondary,
    fontSize: 11,
    marginBottom: DesignTokens.spacing.xs,
  },
  diseaseName: {
    ...DesignTokens.typography.title,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.md,
  },
  diseaseNameBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: DesignTokens.borderRadius.xl,
    borderTopRightRadius: DesignTokens.borderRadius.xl,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  severityBadgeGradient: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
  },
  severityText: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.textPrimary,
    fontSize: 10,
  },

  // Metrics
  metricsSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  sectionTitle: {
    ...DesignTokens.typography.headline,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  metricCardGradient: {
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    borderRadius: DesignTokens.borderRadius.lg,
    position: 'relative',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  metricIcon: {
    fontSize: 24,
  },
  metricLabel: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.xs,
  },
  metricValue: {
    ...DesignTokens.typography.subhead,
    fontWeight: '700',
  },
  metricBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: DesignTokens.borderRadius.lg,
    borderTopRightRadius: DesignTokens.borderRadius.lg,
  },

  // Confidence Bars
  detailsSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  confidenceBarContainer: {
    marginBottom: DesignTokens.spacing.md,
  },
  confidenceBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing.sm,
  },
  confidenceLabel: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textPrimary,
  },
  confidenceValue: {
    ...DesignTokens.typography.mono,
    color: DesignTokens.colors.aiGreen,
    fontWeight: '700',
  },
  confidenceBarTrack: {
    height: 12,
    backgroundColor: DesignTokens.colors.surfaceDark,
    borderRadius: DesignTokens.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: DesignTokens.borderRadius.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  confidenceBarGradient: {
    width: '100%',
    height: '100%',
  },
  confidenceBarGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 20,
  },

  // Recommendations
  recommendationsSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  recommendationItem: {
    marginBottom: DesignTokens.spacing.md,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    position: 'relative',
    ...DesignTokens.shadows.sm,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.aiGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  recommendationNumber: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.deepBlack,
    fontWeight: '700',
  },
  recommendationText: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textPrimary,
    flex: 1,
  },
  recommendationBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: DesignTokens.colors.aiGreen,
    opacity: 0.3,
  },

  // Actions
  actionsSection: {
    gap: DesignTokens.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});
