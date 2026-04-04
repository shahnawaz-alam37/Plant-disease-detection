import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AIDetectionVideoBackground from './AIDetectionVideoBackground';

const { width, height } = Dimensions.get('window');

// Calculate safe area top padding for Android (iOS handled by SafeAreaView)
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
const SAFE_TOP_PADDING = Platform.OS === 'android' ? ANDROID_STATUS_BAR_HEIGHT + 20 : 60;

interface RealisticHeroFallbackProps {
    onScanPress: () => void;
    theme: any;
}

export default function RealisticHeroFallback({ onScanPress, theme }: RealisticHeroFallbackProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Subtle breathing animation for scan button
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* AI Detection Video Background - Realistic Animation */}
            <AIDetectionVideoBackground theme={theme} />

            {/* Content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                    {/* Professional Badge */}
                    <View style={styles.badge}>
                        <View style={[styles.badgeDot, { backgroundColor: theme.colors.success || '#10B981' }]} />
                        <Text style={styles.badgeText}>AI-Powered Plant Health</Text>
                        <View style={styles.badgePulse} />
                    </View>

                    {/* Main Heading - More Natural */}
                    <Text style={styles.heading}>
                        Protect Your Plants{'\n'}
                        <Text style={styles.headingAccent}>with AI Technology</Text>
                    </Text>

                    {/* Subheading - Professional Copy */}
                    <Text style={styles.subheading}>
                        Get instant disease diagnosis and expert treatment plans. 
                        Our machine learning model analyzes leaf patterns to detect issues early.
                    </Text>

                    {/* Premium CTA Button */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={onScanPress}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[
                                    theme.colors.primary,
                                    theme.colors.primaryDark || theme.colors.primary
                                ]}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.buttonContent}>
                                    <View style={styles.iconCircle}>
                                        <Text style={styles.buttonIcon}>🔍</Text>
                                    </View>
                                    <View style={styles.buttonTextContainer}>
                                        <Text style={styles.buttonText}>Start Plant Scan</Text>
                                        <Text style={styles.buttonSubtext}>Free • Instant Results • 95% Accurate</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                            {/* Button Glow Effect */}
                            <View style={[styles.buttonGlow, { backgroundColor: theme.colors.primary }]} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Trust Indicators - Professional Stats */}
                    <View style={styles.trustIndicators}>
                        <View style={styles.trustItem}>
                            <Text style={styles.trustNumber}>95%+</Text>
                            <Text style={styles.trustLabel}>Accuracy</Text>
                            <View style={styles.trustBar}>
                                <View style={[styles.trustFill, { width: '95%', backgroundColor: theme.colors.success || '#10B981' }]} />
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.trustItem}>
                            <Text style={styles.trustNumber}>50K+</Text>
                            <Text style={styles.trustLabel}>Plants Scanned</Text>
                            <View style={styles.trustBar}>
                                <View style={[styles.trustFill, { width: '100%', backgroundColor: theme.colors.primary }]} />
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.trustItem}>
                            <Text style={styles.trustNumber}>38+</Text>
                            <Text style={styles.trustLabel}>Diseases</Text>
                            <View style={styles.trustBar}>
                                <View style={[styles.trustFill, { width: '85%', backgroundColor: theme.colors.accent || '#3B82F6' }]} />
                            </View>
                        </View>
                    </View>

                    {/* Social Proof */}
                    <View style={styles.socialProof}>
                        <View style={styles.avatarGroup}>
                            <View style={[styles.avatar, styles.avatar1]}>
                                <Text style={styles.avatarText}>👨‍🌾</Text>
                            </View>
                            <View style={[styles.avatar, styles.avatar2]}>
                                <Text style={styles.avatarText}>👩‍🔬</Text>
                            </View>
                            <View style={[styles.avatar, styles.avatar3]}>
                                <Text style={styles.avatarText}>🧑‍🎓</Text>
                            </View>
                        </View>
                        <Text style={styles.socialProofText}>
                            Trusted by farmers, researchers, and students worldwide
                        </Text>
                    </View>
                </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: height * 0.65,
        position: 'relative',
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: SAFE_TOP_PADDING,
        paddingBottom: 30,
        zIndex: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative',
    },
    badgeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    badgePulse: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
        left: 18,
        opacity: 0.5,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    heading: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 40,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    headingAccent: {
        color: '#10B981',
    },
    subheading: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.92)',
        marginBottom: 24,
        lineHeight: 20,
        fontWeight: '500',
        maxWidth: width - 50,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        position: 'relative',
    },
    buttonGlow: {
        position: 'absolute',
        bottom: -30,
        left: '10%',
        right: '10%',
        height: 60,
        opacity: 0.3,
        borderRadius: 30,
        filter: 'blur(20px)',
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonIcon: {
        fontSize: 24,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 3,
        letterSpacing: 0.3,
    },
    buttonSubtext: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.88)',
        fontWeight: '600',
    },
    trustIndicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 16,
    },
    trustItem: {
        alignItems: 'center',
        flex: 1,
    },
    trustNumber: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    trustLabel: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    trustBar: {
        width: '80%',
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    trustFill: {
        height: '100%',
        borderRadius: 2,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    socialProof: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    avatarGroup: {
        flexDirection: 'row',
        marginRight: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatar1: {
        zIndex: 3,
    },
    avatar2: {
        marginLeft: -12,
        zIndex: 2,
    },
    avatar3: {
        marginLeft: -12,
        zIndex: 1,
    },
    avatarText: {
        fontSize: 16,
    },
    socialProofText: {
        flex: 1,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 14,
    },
});
