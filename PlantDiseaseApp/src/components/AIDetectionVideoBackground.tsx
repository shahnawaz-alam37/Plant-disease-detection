import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AIDetectionVideoBackgroundProps {
    theme: any;
}

export default function AIDetectionVideoBackground({ theme }: AIDetectionVideoBackgroundProps) {
    // Animation values
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const gridOpacityAnim = useRef(new Animated.Value(0)).current;
    const particleAnim1 = useRef(new Animated.Value(0)).current;
    const particleAnim2 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const detectionBoxAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Scanning line animation - vertical movement
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Grid fade in/out
        Animated.loop(
            Animated.sequence([
                Animated.timing(gridOpacityAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(gridOpacityAnim, {
                    toValue: 0.3,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Particle animations
        Animated.loop(
            Animated.timing(particleAnim1, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.timing(particleAnim2, {
                toValue: 1,
                duration: 5000,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotation animation for scanning effect
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            })
        ).start();

        // Detection box animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(detectionBoxAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.delay(500),
                Animated.timing(detectionBoxAnim, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Interpolations
    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, height * 0.78],
    });

    const particle1TranslateY = particleAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height * 0.4],
    });

    const particle1Opacity = particleAnim1.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
    });

    const particle2TranslateX = particleAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.3, width * 0.3],
    });

    const particle2Opacity = particleAnim2.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
    });

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const detectionBoxScale = detectionBoxAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    const detectionBoxOpacity = detectionBoxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
    });

    return (
        <View style={styles.container}>
            {/* Base gradient background - realistic field/plant environment */}
            <LinearGradient
                colors={[
                    '#1a472a', // Deep forest green
                    '#0f291a', // Darker green
                    '#0a1612', // Almost black green
                    '#0A0E14', // Deep black
                ]}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.gradient}
            />

            {/* Animated grid overlay - AI scanning grid */}
            <Animated.View
                style={[
                    styles.gridContainer,
                    { opacity: gridOpacityAnim }
                ]}
            >
                {/* Horizontal grid lines */}
                {[...Array(8)].map((_, i) => (
                    <View
                        key={`h-${i}`}
                        style={[
                            styles.gridLine,
                            {
                                top: `${(i + 1) * 12.5}%`,
                                width: '100%',
                                height: 1,
                                backgroundColor: theme.colors.primary + '40',
                            },
                        ]}
                    />
                ))}
                {/* Vertical grid lines */}
                {[...Array(6)].map((_, i) => (
                    <View
                        key={`v-${i}`}
                        style={[
                            styles.gridLine,
                            {
                                left: `${(i + 1) * 16.67}%`,
                                height: '100%',
                                width: 1,
                                backgroundColor: theme.colors.primary + '40',
                            },
                        ]}
                    />
                ))}
            </Animated.View>

            {/* Scanning line - AI detection sweep */}
            <Animated.View
                style={[
                    styles.scanLine,
                    {
                        transform: [{ translateY: scanLineTranslateY }],
                        backgroundColor: theme.colors.accent || '#3B82F6',
                    },
                ]}
            >
                <View style={[styles.scanLineGlow, { backgroundColor: theme.colors.accent || '#3B82F6' }]} />
            </Animated.View>

            {/* AI Detection boxes - simulating pest/disease detection */}
            <Animated.View
                style={[
                    styles.detectionBox,
                    {
                        top: '25%',
                        left: '15%',
                        opacity: detectionBoxOpacity,
                        transform: [{ scale: detectionBoxScale }],
                        borderColor: theme.colors.success || '#10B981',
                    },
                ]}
            >
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.detectionBox,
                    {
                        top: '50%',
                        right: '20%',
                        width: 80,
                        height: 80,
                        opacity: detectionBoxOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.8],
                        }),
                        transform: [{ scale: detectionBoxScale }],
                        borderColor: '#F59E0B',
                    },
                ]}
            >
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
            </Animated.View>

            {/* Rotating scanner effect */}
            <Animated.View
                style={[
                    styles.rotatingScanner,
                    {
                        transform: [{ rotate: rotation }],
                    },
                ]}
            >
                <LinearGradient
                    colors={[
                        'transparent',
                        theme.colors.primary + '20',
                        'transparent',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scannerBeam}
                />
            </Animated.View>

            {/* Floating particles - simulating data processing */}
            <Animated.View
                style={[
                    styles.particle,
                    {
                        bottom: '10%',
                        left: '20%',
                        transform: [{ translateY: particle1TranslateY }],
                        opacity: particle1Opacity,
                        backgroundColor: theme.colors.primary + '80',
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.particle,
                    {
                        bottom: '20%',
                        left: '40%',
                        transform: [{ translateY: particle1TranslateY }],
                        opacity: particle1Opacity,
                        backgroundColor: theme.colors.accent + '80',
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.particle,
                    {
                        bottom: '30%',
                        right: '30%',
                        transform: [{ translateX: particle2TranslateX }],
                        opacity: particle2Opacity,
                        backgroundColor: theme.colors.success + '80',
                    },
                ]}
            />

            {/* AI processing indicators - corner markers */}
            <Animated.View
                style={[
                    styles.cornerMarker,
                    styles.cornerMarkerTopLeft,
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <View style={[styles.cornerLine, styles.cornerLineH, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.cornerLine, styles.cornerLineV, { backgroundColor: theme.colors.primary }]} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.cornerMarker,
                    styles.cornerMarkerTopRight,
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <View style={[styles.cornerLine, styles.cornerLineH, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.cornerLine, styles.cornerLineV, { backgroundColor: theme.colors.primary }]} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.cornerMarker,
                    styles.cornerMarkerBottomLeft,
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <View style={[styles.cornerLine, styles.cornerLineH, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.cornerLine, styles.cornerLineV, { backgroundColor: theme.colors.primary }]} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.cornerMarker,
                    styles.cornerMarkerBottomRight,
                    { transform: [{ scale: pulseAnim }] },
                ]}
            >
                <View style={[styles.cornerLine, styles.cornerLineH, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.cornerLine, styles.cornerLineV, { backgroundColor: theme.colors.primary }]} />
            </Animated.View>

            {/* Overlay for better text readability */}
            <LinearGradient
                colors={[
                    'rgba(10, 14, 20, 0.2)',
                    'rgba(10, 14, 20, 0.4)',
                    'rgba(10, 14, 20, 0.7)',
                    'rgba(10, 14, 20, 0.9)',
                ]}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.overlay}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    gridLine: {
        position: 'absolute',
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    scanLineGlow: {
        height: 20,
        marginTop: -8,
        opacity: 0.3,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    detectionBox: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderWidth: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    corner: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderColor: 'inherit',
        top: -2,
        left: -2,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    cornerTopRight: {
        left: 'auto',
        right: -2,
        borderLeftWidth: 0,
        borderRightWidth: 3,
    },
    cornerBottomLeft: {
        top: 'auto',
        bottom: -2,
        borderTopWidth: 0,
        borderBottomWidth: 3,
    },
    cornerBottomRight: {
        top: 'auto',
        left: 'auto',
        bottom: -2,
        right: -2,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    rotatingScanner: {
        position: 'absolute',
        top: '20%',
        left: '50%',
        width: width * 1.5,
        height: 2,
        marginLeft: -(width * 0.75),
        zIndex: 1,
    },
    scannerBeam: {
        flex: 1,
    },
    particle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 1,
    },
    cornerMarker: {
        position: 'absolute',
        width: 40,
        height: 40,
        zIndex: 2,
    },
    cornerMarkerTopLeft: {
        top: 20,
        left: 20,
    },
    cornerMarkerTopRight: {
        top: 20,
        right: 20,
    },
    cornerMarkerBottomLeft: {
        bottom: 100,
        left: 20,
    },
    cornerMarkerBottomRight: {
        bottom: 100,
        right: 20,
    },
    cornerLine: {
        position: 'absolute',
    },
    cornerLineH: {
        width: 30,
        height: 3,
        top: 0,
        left: 0,
    },
    cornerLineV: {
        width: 3,
        height: 30,
        top: 0,
        left: 0,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 3,
    },
});
