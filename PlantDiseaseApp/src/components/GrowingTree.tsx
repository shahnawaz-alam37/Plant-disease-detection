import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const GrowingTree: React.FC<{ size?: number }> = ({ size = 200 }) => {
    const { theme } = useTheme();
    const growAnim = new Animated.Value(0);
    const glowAnim = new Animated.Value(0);
    const leafAnim = new Animated.Value(0);

    useEffect(() => {
        // Tree growing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(growAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(growAnim, {
                    toValue: 0,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glowing effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Leaf waving
        Animated.loop(
            Animated.sequence([
                Animated.timing(leafAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(leafAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const scale = growAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1.05],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    const leafRotate = leafAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Glow effect */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        backgroundColor: theme.colors.primaryLight,
                        opacity: glowOpacity,
                        width: size,
                        height: size,
                    },
                ]}
            />

            {/* Tree */}
            <Animated.View
                style={[
                    styles.tree,
                    {
                        transform: [{ scale }],
                    },
                ]}
            >
                <Text style={[styles.emoji, { fontSize: size * 0.8 }]}>🌳</Text>
            </Animated.View>

            {/* Animated leaves */}
            <Animated.View
                style={[
                    styles.leaf,
                    {
                        top: size * 0.2,
                        left: size * 0.15,
                        transform: [{ rotate: leafRotate }],
                    },
                ]}
            >
                <Text style={[styles.emoji, { fontSize: size * 0.2 }]}>🍃</Text>
            </Animated.View>

            <Animated.View
                style={[
                    styles.leaf,
                    {
                        top: size * 0.25,
                        right: size * 0.2,
                        transform: [{ rotate: leafRotate }],
                    },
                ]}
            >
                <Text style={[styles.emoji, { fontSize: size * 0.18 }]}>🍃</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.3,
    },
    tree: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaf: {
        position: 'absolute',
    },
    emoji: {
        textAlign: 'center',
    },
});
