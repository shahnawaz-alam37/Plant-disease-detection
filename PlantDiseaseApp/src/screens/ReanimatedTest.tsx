import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function ReanimatedTest() {
    const offset = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: offset.value * 255 }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.box, animatedStyles]} />
            <Button onPress={() => (offset.value = withSpring(Math.random()))} title="Move" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    box: {
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        borderRadius: 20,
        marginBottom: 20,
    },
});
