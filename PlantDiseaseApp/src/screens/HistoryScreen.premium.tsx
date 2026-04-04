/**
 * 📜 PREMIUM HISTORY SCREEN
 * Timeline-based history with:
 * - Parallax scroll effects
 * - Swipe-to-expand cards
 * - Elastic spring animations
 * - Smooth list performance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '../design/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HistoryItem {
  id: string;
  disease: string;
  confidence: number;
  date: string;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: number;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    disease: 'Tomato Late Blight',
    confidence: 96.8,
    date: 'Today, 2:30 PM',
    severity: 'High',
    timestamp: Date.now(),
  },
  {
    id: '2',
    disease: 'Potato Early Blight',
    confidence: 94.2,
    date: 'Yesterday, 4:15 PM',
    severity: 'Medium',
    timestamp: Date.now() - 86400000,
  },
  {
    id: '3',
    disease: 'Apple Scab',
    confidence: 98.5,
    date: '2 days ago',
    severity: 'Medium',
    timestamp: Date.now() - 172800000,
  },
  {
    id: '4',
    disease: 'Grape Black Rot',
    confidence: 91.3,
    date: '3 days ago',
    severity: 'Low',
    timestamp: Date.now() - 259200000,
  },
  {
    id: '5',
    disease: 'Corn Common Rust',
    confidence: 89.7,
    date: '5 days ago',
    severity: 'Low',
    timestamp: Date.now() - 432000000,
  },
];

interface HistoryCardProps {
  item: HistoryItem;
  index: number;
  scrollY: Animated.SharedValue<number>;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, index, scrollY }) => {
  const [expanded, setExpanded] = useState(false);
  const expandedHeight = useSharedValue(0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return DesignTokens.colors.error;
      case 'Medium':
        return DesignTokens.colors.warning;
      case 'Low':
        return DesignTokens.colors.success;
      default:
        return DesignTokens.colors.info;
    }
  };

  const handlePress = () => {
    setExpanded(!expanded);
    expandedHeight.value = withSpring(
      expanded ? 0 : 120,
      DesignTokens.animation.spring.bouncy
    );
  };

  // Parallax effect based on scroll position
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * 150,
      index * 150,
      (index + 1) * 150,
    ];

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [20, 0, -20],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.95, 1, 0.95],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const expandedAnimatedStyle = useAnimatedStyle(() => ({
    height: expandedHeight.value,
    opacity: expandedHeight.value / 120,
  }));

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      style={[styles.cardContainer, cardAnimatedStyle]}
    >
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={[
            DesignTokens.colors.surfaceElevated,
            DesignTokens.colors.surfaceDark,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Timeline Indicator */}
          <View style={styles.timelineIndicator}>
            <View style={[styles.timelineDot, { backgroundColor: getSeverityColor(item.severity) }]} />
            <View style={styles.timelineLine} />
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.diseaseText}>{item.disease}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.confidenceBadge}>
                <LinearGradient
                  colors={[
                    DesignTokens.colors.aiGreen,
                    DesignTokens.colors.aiGreenDark,
                  ]}
                  style={styles.confidenceBadgeGradient}
                >
                  <Text style={styles.confidenceText}>{item.confidence}%</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Severity Badge */}
            <View style={styles.severityContainer}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(item.severity) + '20' },
                ]}
              >
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: getSeverityColor(item.severity) },
                  ]}
                />
                <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
                  {item.severity} Severity
                </Text>
              </View>
            </View>

            {/* Expanded Details */}
            <Animated.View style={[styles.expandedContent, expandedAnimatedStyle]}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Treatment Status:</Text>
                <Text style={styles.detailValue}>In Progress</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Follow-up:</Text>
                <Text style={styles.detailValue}>3 days</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>Field A - Row 12</Text>
              </View>
            </Animated.View>

            {/* Expand Indicator */}
            <View style={styles.expandIndicator}>
              <Text style={styles.expandText}>{expanded ? '▲' : '▼'}</Text>
            </View>
          </View>

          {/* Top Border Accent */}
          <View style={[styles.cardBorder, { backgroundColor: getSeverityColor(item.severity) }]} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default function HistoryPremiumScreen() {
  const scrollY = useSharedValue(0);

  const handleScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={DesignTokens.gradients.deepSpace}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <Text style={styles.headerSubtitle}>{mockHistory.length} diagnoses recorded</Text>
      </Animated.View>

      {/* Timeline List */}
      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HistoryCard item={item} index={index} scrollY={scrollY} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Floating Stats */}
      <Animated.View entering={FadeIn.delay(400)} style={styles.floatingStats}>
        <LinearGradient
          colors={[
            DesignTokens.colors.glassMedium,
            DesignTokens.colors.glassDark,
          ]}
          style={styles.floatingStatsContent}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>94.5%</Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.deepBlack,
  },

  // Header
  header: {
    padding: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.xxl,
  },
  headerTitle: {
    ...DesignTokens.typography.title,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.xs,
  },
  headerSubtitle: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
  },

  // List
  listContent: {
    padding: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
  },

  // Card
  cardContainer: {
    marginBottom: DesignTokens.spacing.lg,
  },
  card: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing.md,
    paddingLeft: DesignTokens.spacing.xl + 20,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    position: 'relative',
    ...DesignTokens.shadows.md,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: DesignTokens.borderRadius.xl,
    borderTopRightRadius: DesignTokens.borderRadius.xl,
  },

  // Timeline
  timelineIndicator: {
    position: 'absolute',
    left: 16,
    top: DesignTokens.spacing.md,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: DesignTokens.colors.deepBlack,
    ...DesignTokens.shadows.glow,
  },
  timelineLine: {
    width: 2,
    height: 80,
    backgroundColor: DesignTokens.colors.borderSubtle,
    marginTop: 4,
  },

  // Card Content
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  diseaseText: {
    ...DesignTokens.typography.subhead,
    color: DesignTokens.colors.textPrimary,
    marginBottom: DesignTokens.spacing.xs,
  },
  dateText: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textTertiary,
  },

  // Confidence Badge
  confidenceBadge: {
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
    ...DesignTokens.shadows.glow,
  },
  confidenceBadgeGradient: {
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
  },
  confidenceText: {
    ...DesignTokens.typography.mono,
    color: DesignTokens.colors.deepBlack,
    fontWeight: '700',
    fontSize: 14,
  },

  // Severity
  severityContainer: {
    marginBottom: DesignTokens.spacing.sm,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing.xs,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    ...DesignTokens.typography.caption,
    fontWeight: '600',
  },

  // Expanded Content
  expandedContent: {
    overflow: 'hidden',
    marginTop: DesignTokens.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing.xs,
  },
  detailLabel: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
  },
  detailValue: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textPrimary,
    fontWeight: '600',
  },

  // Expand Indicator
  expandIndicator: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing.xs,
  },
  expandText: {
    color: DesignTokens.colors.aiGreen,
    fontSize: 12,
  },

  // Floating Stats
  floatingStats: {
    position: 'absolute',
    bottom: DesignTokens.spacing.lg,
    left: DesignTokens.spacing.lg,
    right: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadows.lg,
  },
  floatingStatsContent: {
    flexDirection: 'row',
    padding: DesignTokens.spacing.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.borderSubtle,
    borderRadius: DesignTokens.borderRadius.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...DesignTokens.typography.headline,
    color: DesignTokens.colors.aiGreen,
    marginBottom: DesignTokens.spacing.xs,
  },
  statLabel: {
    ...DesignTokens.typography.caption,
    color: DesignTokens.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: DesignTokens.colors.borderSubtle,
    marginHorizontal: DesignTokens.spacing.md,
  },
});
