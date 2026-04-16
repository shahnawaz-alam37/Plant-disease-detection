import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface TabIconProps {
    name: 'home' | 'camera' | 'info';
    focused: boolean;
    color: string;
    size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color, size }) => {
    const iconMap = {
        home: focused ? 'home' : 'home-outline',
        camera: focused ? 'camera' : 'camera-outline',
        info: focused ? 'information-circle' : 'information-circle-outline',
    };

    return (
        <Ionicons 
            name={iconMap[name] as any} 
            size={size} 
            color={color} 
        />
    );
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    const tabConfig = [
        { name: 'HomeTab', icon: 'home' as const },
        { name: 'DetectTab', icon: 'camera' as const, isPrimary: true },
        { name: 'AboutTab', icon: 'info' as const },
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, 8),
                },
            ]}
        >
            {/* Navbar background with curved top and green border */}
            <View
                style={[
                    styles.navbarBg,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        borderTopWidth: 3,
                        borderTopColor: theme.colors.primary,
                    },
                ]}
            />

            <View style={styles.tabsContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const config = tabConfig[index];
                    const isFocused = state.index === index;
                    const isPrimary = config?.isPrimary;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    if (isPrimary) {
                        // Primary action button (Camera/Detect)
                        return (
                            <TouchableOpacity
                                key={route.key}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={styles.primaryButtonContainer}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.primaryButton,
                                        {
                                            backgroundColor: theme.colors.primary,
                                        },
                                    ]}
                                >
                                    <TabIcon
                                        name={config?.icon || 'camera'}
                                        focused={isFocused}
                                        color={theme.colors.white}
                                        size={24}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    // Regular tab button
                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tabIconContainer}>
                                <TabIcon
                                    name={config?.icon || 'home'}
                                    focused={isFocused}
                                    color={isFocused ? theme.colors.primary : theme.colors.textLight}
                                    size={24}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },
    navbarBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    tabIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
    },
    primaryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BottomTabBar;
