import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GrowingTree } from '../components/GrowingTree';

const { width, height } = Dimensions.get('window');

// Animated 3D-like background component
const AnimatedBackground = () => {
    const spinValue1 = new Animated.Value(0);
    const spinValue2 = new Animated.Value(0);
    const bounceValue = new Animated.Value(0);

    useEffect(() => {
        // Rotation animation 1
        Animated.loop(
            Animated.timing(spinValue1, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Rotation animation 2 (opposite direction)
        Animated.loop(
            Animated.timing(spinValue2, {
                toValue: 1,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Bounce animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceValue, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceValue, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const spin1 = spinValue1.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spin2 = spinValue2.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'],
    });

    const bounce = bounceValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
    });

    return (
        <View style={styles.backgroundContainer}>
            {/* Gradient background */}
            <View style={styles.gradientBg} />

            {/* Animated organic shapes */}
            <Animated.View
                style={[
                    styles.floatingShape1,
                    {
                        transform: [
                            { rotate: spin1 },
                            { translateY: bounce }
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.floatingShape2,
                    {
                        transform: [
                            { rotate: spin2 },
                            { translateY: bounce }
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.floatingShape3,
                    {
                        transform: [{ translateY: bounce }],
                    },
                ]}
            />

            {/* Leaf particles */}
            {[...Array(6)].map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.leafParticle,
                        {
                            left: `${(i * 100) % 80}%`,
                            top: `${20 + (i * 15) % 40}%`,
                            opacity: 0.15 - (i * 0.02),
                            transform: [{ rotate: `${i * 60}deg` }],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const QuickAction = ({ title, icon, onPress, color }: { title: string; icon: string; onPress: () => void; color: string }) => (
    <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
);

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.statCard}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const FeatureHighlight = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.featureCard}>
        <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>{icon}</Text>
        </View>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

export default function HomeScreen() {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section with Animated Background */}
            <View style={styles.hero}>
                <AnimatedBackground />

                <View style={styles.heroContent}>
                    <Text style={styles.greeting}>Welcome to</Text>
                    <Text style={styles.heroTitle}>Plant Doctor</Text>
                    <Text style={styles.heroSubtitle}>
                        AI-powered disease detection for healthier plants
                    </Text>
                    <TouchableOpacity
                        style={styles.heroButton}
                        onPress={() => navigation.navigate('Capture' as never)}
                    >
                        <Text style={styles.heroButtonIcon}>📷</Text>
                        <Text style={styles.heroButtonText}>Start Detection</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <StatCard label="Diseases" value="30+" icon="🦠" />
                    <StatCard label="Species" value="15+" icon="🌿" />
                    <StatCard label="Accuracy" value="95%" icon="🎯" />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        title="Detect Disease"
                        icon="📷"
                        color={theme.colors.primary}
                        onPress={() => navigation.navigate('Capture' as never)}
                    />
                    <QuickAction
                        title="View History"
                        icon="⏱️"
                        color={theme.colors.accent}
                        onPress={() => navigation.navigate('History' as never)}
                    />
                </View>

                {/* Features Section */}
                <Text style={styles.sectionTitle}>Key Features</Text>
                <FeatureHighlight
                    icon="🤖"
                    title="AI-Powered Detection"
                    description="Advanced AI analyzes leaf images for accurate disease identification"
                />
                <FeatureHighlight
                    icon="💾"
                    title="Detailed Reports"
                    description="Get comprehensive symptom analysis and treatment recommendations"
                />
                <FeatureHighlight
                    icon="📊"
                    title="Confidence Scoring"
                    description="Transparent confidence levels for every diagnosis"
                />
                <FeatureHighlight
                    icon="🌍"
                    title="Global Database"
                    description="Access to 30+ plant diseases across 15+ species"
                />

                {/* Tips Section */}
                <Text style={styles.sectionTitle}>Plant Care Tips</Text>
                <View style={styles.tipCard}>
                    <View style={styles.tipIconBg}>
                        <Text style={styles.tipIcon}>💧</Text>
                    </View>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Watering Wisdom</Text>
                        <Text style={styles.tipText}>
                            Check soil moisture before watering. Most plants prefer slightly moist soil. Overwatering is the #1 cause of plant death.
                        </Text>
                    </View>
                </View>

                <View style={styles.tipCard}>
                    <View style={styles.tipIconBg}>
                        <Text style={styles.tipIcon}>☀️</Text>
                    </View>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Light Matters</Text>
                        <Text style={styles.tipText}>
                            Most plants need indirect, bright light. Place near windows but away from harsh afternoon sun to prevent leaf burn.
                        </Text>
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Start Protecting Your Plants Today</Text>
                    <Text style={styles.ctaDescription}>
                        Use our AI detection system to identify diseases early and save your plants.
                    </Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => navigation.navigate('Capture' as never)}
                    >
                        <Text style={styles.ctaButtonText}>Scan Your Plants Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradientBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
    },
    floatingShape1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        top: -50,
        right: -50,
    },
    floatingShape2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        bottom: 100,
        left: -30,
    },
    floatingShape3: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        bottom: 200,
        right: 20,
    },
    leafParticle: {
        position: 'absolute',
        width: 40,
        height: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 50,
    },
    hero: {
        height: height * 0.55,
        backgroundColor: theme.colors.primary,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'flex-end',
        paddingBottom: theme.spacing.l,
        paddingHorizontal: theme.spacing.l,
    },
    heroContent: {
        zIndex: 10,
    },
    greeting: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: theme.spacing.xs,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroTitle: {
        ...theme.typography.h1,
        color: theme.colors.white,
        marginBottom: theme.spacing.s,
        fontSize: 40,
    },
    heroSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: theme.spacing.l,
        maxWidth: '90%',
        fontSize: 16,
        lineHeight: 24,
    },
    heroButton: {
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        alignSelf: 'flex-start',
        ...theme.shadows.large,
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroButtonIcon: {
        fontSize: 20,
        marginRight: theme.spacing.s,
    },
    heroButtonText: {
        ...theme.typography.button,
        color: theme.colors.primary,
        fontSize: 16,
    },
    content: {
        padding: theme.spacing.l,
        paddingTop: theme.spacing.m,
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
        marginTop: -30,
        gap: theme.spacing.m,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        alignItems: 'center',
        ...theme.shadows.small,
        borderTopWidth: 4,
        borderTopColor: theme.colors.primary,
    },
    statIcon: {
        fontSize: 28,
        marginBottom: theme.spacing.xs,
    },
    statValue: {
        ...theme.typography.h3,
        fontSize: 18,
        color: theme.colors.primary,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 22,
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.l,
        color: theme.colors.text,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    actionCard: {
        flex: 1,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        justifyContent: 'center',
        height: 140,
        ...theme.shadows.medium,
    },
    actionIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.s,
    },
    actionTitle: {
        ...theme.typography.button,
        textAlign: 'center',
        fontSize: 14,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        alignItems: 'flex-start',
        ...theme.shadows.small,
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    featureIconText: {
        fontSize: 28,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
    },
    featureDescription: {
        ...theme.typography.caption,
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    tipCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...theme.shadows.small,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accent,
    },
    tipIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    tipIcon: {
        fontSize: 24,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
    },
    tipText: {
        ...theme.typography.caption,
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    ctaSection: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    ctaTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        color: theme.colors.white,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    ctaDescription: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: theme.spacing.m,
        textAlign: 'center',
        fontSize: 14,
    },
    ctaButton: {
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        ...theme.shadows.medium,
    },
    ctaButtonText: {
        ...theme.typography.button,
        color: theme.colors.primary,
        fontSize: 16,
    },
});
