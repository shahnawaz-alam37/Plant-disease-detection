import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface RealisticHeroProps {
    onScanPress: () => void;
    theme: any;
}

export default function RealisticHero({ onScanPress, theme }: RealisticHeroProps) {
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
            {/* Background Video - Replace with actual video file */}
            <Video
                source={require('../../assets/plant-hero-video.mp4')} // You'll need to add this
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
                rate={0.8} // Slightly slower for calming effect
            />

            {/* Gradient Overlay for better text readability */}
            <LinearGradient
                colors={[
                    'rgba(10, 14, 20, 0.3)',
                    'rgba(10, 14, 20, 0.5)',
                    'rgba(10, 14, 20, 0.85)',
                    'rgba(10, 14, 20, 0.95)',
                ]}
                style={styles.gradient}
            />

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
                {/* Subtle Badge */}
                <View style={styles.badge}>
                    <View style={[styles.badgeDot, { backgroundColor: theme.colors.success || '#10B981' }]} />
                    <Text style={styles.badgeText}>AI-Powered Plant Health</Text>
                </View>

                {/* Main Heading */}
                <Text style={styles.heading}>
                    Protect Your Plants{'\n'}with Artificial Intelligence
                </Text>

                {/* Subheading */}
                <Text style={styles.subheading}>
                    Instant disease detection and expert treatment recommendations 
                    powered by advanced machine learning
                </Text>

                {/* CTA Button */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
                        onPress={onScanPress}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.iconCircle}>
                                    <Text style={styles.buttonIcon}>📱</Text>
                                </View>
                                <View style={styles.buttonTextContainer}>
                                    <Text style={styles.buttonText}>Scan Plant Now</Text>
                                    <Text style={styles.buttonSubtext}>Free • Instant Results</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Trust Indicators */}
                <View style={styles.trustIndicators}>
                    <View style={styles.trustItem}>
                        <Text style={styles.trustNumber}>95%+</Text>
                        <Text style={styles.trustLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.trustItem}>
                        <Text style={styles.trustNumber}>50K+</Text>
                        <Text style={styles.trustLabel}>Scans</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.trustItem}>
                        <Text style={styles.trustNumber}>38+</Text>
                        <Text style={styles.trustLabel}>Diseases</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Floating Elements */}
            <View style={styles.floatingElements}>
                {/* Particle effect overlay */}
                <View style={styles.particle1} />
                <View style={styles.particle2} />
                <View style={styles.particle3} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: height * 0.75,
        position: 'relative',
        overflow: 'hidden',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 60,
        zIndex: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
        backdropFilter: 'blur(10px)',
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    heading: {
        fontSize: 38,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 46,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subheading: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 32,
        lineHeight: 24,
        fontWeight: '400',
        maxWidth: width - 80,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonGradient: {
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonIcon: {
        fontSize: 26,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
        letterSpacing: 0.3,
    },
    buttonSubtext: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500',
    },
    trustIndicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
    },
    trustItem: {
        alignItems: 'center',
        flex: 1,
    },
    trustNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    trustLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    floatingElements: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    particle1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        top: '15%',
        left: '10%',
        opacity: 0.6,
    },
    particle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        top: '30%',
        right: '5%',
        opacity: 0.5,
    },
    particle3: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        bottom: '20%',
        left: '15%',
        opacity: 0.4,
    },
});
