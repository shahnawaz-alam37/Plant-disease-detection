/**
 * 🏠 HOME SCREEN - FLAGSHIP EXPERIENCE
 * World-class mobile UI with:
 * - 3D Parallax Leaf Scanner
 * - Animated particles background
 * - Glassmorphic cards
 * - Smooth micro-interactions
 * - Premium motion design
 * 
 * @architecture Google Material Design 3 + DeepMind AI Aesthetics
 * @performance 60fps guaranteed
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
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
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import ParticlesBackground from '../components/ParticlesBackground';
import Leaf3DScanner from '../components/Leaf3DScanner';
import PremiumButton from '../components/PremiumButton';

// Design System
import { DesignTokens } from '../design/tokens';
import DarkTheme from '../design/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, DesignTokens.animation.spring.bouncy);
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <LinearGradient
        colors={[
          DesignTokens.colors.glassMedium,
          DesignTokens.colors.glassDark,
        ]}
        style={styles.statCardGradient}
      >
        <View style={styles.statIconContainer}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        
        {/* Glow border */}
        <View style={styles.statCardBorder} />
      </LinearGradient>
    </Animated.View>
  );
};

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  index: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  index,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, DesignTokens.animation.spring.snappy);
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, DesignTokens.animation.spring.bouncy);
    pressed.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.5,
  }));

  return (
    <Animated.View
      entering={SlideInDown.delay(index * 100).springify()}
      style={[styles.quickActionWrapper, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[
            DesignTokens.colors.surfaceElevated,
            DesignTokens.colors.surfaceDark,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionCard}
        >
          {/* Glow overlay */}
          <Animated.View style={[styles.quickActionGlow, glowStyle]} />

          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>{icon}</Text>
          </View>

          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </View>

          {/* Arrow indicator */}
          <View style={styles.quickActionArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>

          {/* Border glow */}
          <View style={styles.quickActionBorder} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const headerOpacity = useSharedValue(0);
  const scannerScale = useSharedValue(0.8);

  useEffect(() => {
    // Entrance animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    scannerScale.value = withSpring(1, {
      ...DesignTokens.animation.spring.bouncy,
      delay: 200,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const scannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scannerScale.value }],
  }));

  const handleScanPress = () => {
    navigation.navigate('Capture');
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  const handleLearnPress = () => {
    navigation.navigate('Learn New');
  };

  const handleKnowledgePress = () => {
    navigation.navigate('Knowledge Hub');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <ParticlesBackground />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.title}>Plant Disease AI</Text>
          <Text style={styles.subtitle}>
            Advanced leaf diagnosis powered by deep learning
          </Text>
        </Animated.View>

        {/* 3D Leaf Scanner - Hero Element */}
        <Animated.View style={[styles.scannerSection, scannerAnimatedStyle]}>
          <Leaf3DScanner />
          
          {/* AI Status Badge */}
          <Animated.View
            entering={FadeIn.delay(500)}
            style={styles.aiStatusBadge}
          >
            <LinearGradient
              colors={[
                DesignTokens.colors.aiGreen,
                DesignTokens.colors.aiGreenDark,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiStatusGradient}
            >
              <View style={styles.aiStatusDot} />
              <Text style={styles.aiStatusText}>AI CORE ACTIVE</Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          <PremiumButton
            title="Scan Leaf Now"
            onPress={handleScanPress}
            variant="primary"
            size="large"
            fullWidth
          />
          
          <View style={styles.buttonRow}>
            <View style={styles.halfButton}>
              <PremiumButton
                title="Upload"
                onPress={handleScanPress}
                variant="secondary"
                size="medium"
                fullWidth
              />
            </View>
            <View style={styles.halfButton}>
              <PremiumButton
                title="History"
                onPress={handleHistoryPress}
                variant="ghost"
                size="medium"
                fullWidth
              />
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <Animated.View entering={FadeIn.delay(600)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="🌱"
              value="247"
              label="Plants Scanned"
              delay={700}
            />
            <StatCard
              icon="🎯"
              value="98%"
              label="Accuracy Rate"
              delay={800}
            />
            <StatCard
              icon="🏆"
              value="42"
              label="Diseases Found"
              delay={900}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <QuickActionCard
            icon="🧠"
            title="Few-Shot Learning"
            subtitle="Teach AI new plant diseases"
            onPress={handleLearnPress}
            index={0}
          />

          <QuickActionCard
            icon="📚"
            title="Knowledge Hub"
            subtitle="Browse disease database"
            onPress={handleKnowledgePress}
            index={1}
          />

          <QuickActionCard
            icon="📊"
            title="Analytics"
            subtitle="View detailed statistics"
            onPress={handleHistoryPress}
            index={2}
          />
        </View>

        {/* Bottom Spacing */}
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
    marginTop: DesignTokens.spacing.xxl,
    marginBottom: DesignTokens.spacing.lg,
  },
  greeting: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: DesignTokens.spacing.xs,
  },
  title: {
    ...DesignTokens.typography.display,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.sm,
  },
  subtitle: {
    ...DesignTokens.typography.body,
    color: DesignTokens.colors.textTertiary,
    lineHeight: 24,
  },

  // Scanner Section
  scannerSection: {
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.xl,
  },
  aiStatusBadge: {
    marginTop: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.pill,
    overflow: 'hidden',
    ...DesignTokens.shadows.glow,
  },
  aiStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.deepBlack,
  },
  aiStatusText: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.deepBlack,
    fontSize: 12,
  },

  // Primary Actions
  primaryActions: {
    gap: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  halfButton: {
    flex: 1,
  },

  // Stats Section
  statsSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  sectionTitle: {
    ...DesignTokens.typography.headline,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    borderRadius: DesignTokens.borderRadius.lg,
  },
  statCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: DesignTokens.colors.aiGreen,
    opacity: 0.5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignTokens.colors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    ...DesignTokens.typography.title,
    color: DesignTokens.colors.aiGreen,
    marginBottom: DesignTokens.spacing.xs,
  },
  statLabel: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsSection: {
    gap: DesignTokens.spacing.md,
  },
  quickActionWrapper: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    position: 'relative',
    ...DesignTokens.shadows.sm,
  },
  quickActionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DesignTokens.colors.aiGreenGlow,
  },
  quickActionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: DesignTokens.colors.aiGreen,
    opacity: 0.3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  quickActionIconText: {
    fontSize: 28,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    ...DesignTokens.typography.subhead,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.xs,
  },
  quickActionSubtitle: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textTertiary,
  },
  quickActionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: DesignTokens.colors.aiGreen,
  },
});
