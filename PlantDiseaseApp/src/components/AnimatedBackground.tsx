import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground: React.FC = () => {
    const { theme } = useTheme();
    
    const bubble1 = new Animated.Value(0);
    const bubble2 = new Animated.Value(0);
    const bubble3 = new Animated.Value(0);
    const bubble4 = new Animated.Value(0);
    const glow = new Animated.Value(0);

    useEffect(() => {
        // Floating bubbles animations
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(bubble1, {
                        toValue: 1,
                        duration: 8000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(bubble1, {
                        toValue: 0,
                        duration: 8000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bubble2, {
                    toValue: 1,
                    duration: 10000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bubble2, {
                    toValue: 0,
                    duration: 10000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bubble3, {
                    toValue: 1,
                    duration: 12000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bubble3, {
                    toValue: 0,
                    duration: 12000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bubble4, {
                    toValue: 1,
                    duration: 9000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bubble4, {
                    toValue: 0,
                    duration: 9000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glowing effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glow, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glow, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const bubble1Y = bubble1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });

    const bubble2Y = bubble2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 40],
    });

    const bubble3Y = bubble3.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -30],
    });

    const bubble4Y = bubble4.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 35],
    });

    const glowOpacity = glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const glowScale = glow.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });

    return (
        <View style={styles.container}>
            {/* Gradient background */}
            <View style={[styles.gradientBg, { backgroundColor: theme.colors.heroGradientStart }]} />

            {/* Animated bubbles */}
            <Animated.View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.bubbleColor1,
                        width: 200,
                        height: 200,
                        top: height * 0.1,
                        right: -50,
                        transform: [{ translateY: bubble1Y }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.bubbleColor2,
                        width: 150,
                        height: 150,
                        bottom: height * 0.2,
                        left: -30,
                        transform: [{ translateY: bubble2Y }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.bubbleColor3,
                        width: 180,
                        height: 180,
                        top: height * 0.3,
                        left: width * 0.2,
                        transform: [{ translateY: bubble3Y }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: theme.colors.bubbleColor1,
                        width: 120,
                        height: 120,
                        bottom: height * 0.4,
                        right: width * 0.15,
                        transform: [{ translateY: bubble4Y }],
                    },
                ]}
            />

            {/* Glowing orbs */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: theme.colors.primaryLight,
                        top: height * 0.15,
                        left: width * 0.3,
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: theme.colors.accent,
                        bottom: height * 0.25,
                        right: width * 0.25,
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />

            {/* Particle effects */}
            {[...Array(8)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            backgroundColor: theme.colors.primaryLight,
                            left: `${(i * 15 + 10) % 90}%`,
                            top: `${(i * 12 + 15) % 70}%`,
                            opacity: 0.15 - i * 0.015,
                            width: 8 + (i % 3) * 4,
                            height: 8 + (i % 3) * 4,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradientBg: {
        ...StyleSheet.absoluteFillObject,
    },
    bubble: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.4,
    },
    glow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.3,
    },
    particle: {
        position: 'absolute',
        borderRadius: 9999,
    },
});
