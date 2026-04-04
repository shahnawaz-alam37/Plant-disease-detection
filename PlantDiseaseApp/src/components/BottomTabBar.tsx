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
        { name: 'HomeTab', icon: 'home' as const, label: 'Home' },
        { name: 'DetectTab', icon: 'camera' as const, label: 'Detect', isPrimary: true },
        { name: 'AboutTab', icon: 'info' as const, label: 'About' },
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, 8),
                    backgroundColor: theme.colors.surface,
                    borderTopColor: isDark ? theme.colors.border : 'transparent',
                },
            ]}
        >
            {/* Background shadow layer */}
            <View
                style={[
                    styles.shadowLayer,
                    {
                        backgroundColor: theme.colors.surface,
                        shadowColor: isDark ? '#000' : theme.colors.primary,
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
                                            shadowColor: theme.colors.primary,
                                        },
                                    ]}
                                >
                                    <View style={styles.primaryIconContainer}>
                                        <TabIcon
                                            name={config?.icon || 'camera'}
                                            focused={isFocused}
                                            color={theme.colors.white}
                                            size={28}
                                        />
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        styles.primaryLabel,
                                        { color: theme.colors.primary },
                                    ]}
                                >
                                    {config?.label || 'Detect'}
                                </Text>
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
                            <View
                                style={[
                                    styles.tabIconContainer,
                                    isFocused && {
                                        backgroundColor: theme.colors.primary + '15',
                                    },
                                ]}
                            >
                                <TabIcon
                                    name={config?.icon || 'home'}
                                    focused={isFocused}
                                    color={isFocused ? theme.colors.primary : theme.colors.textLight}
                                    size={24}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused
                                            ? theme.colors.primary
                                            : theme.colors.textLight,
                                        fontWeight: isFocused ? '600' : '500',
                                    },
                                ]}
                            >
                                {config?.label || route.name}
                            </Text>
                            {isFocused && (
                                <View
                                    style={[
                                        styles.activeIndicator,
                                        { backgroundColor: theme.colors.primary },
                                    ]}
                                />
                            )}
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
        elevation: 20,
        borderTopWidth: Platform.OS === 'android' ? 0 : StyleSheet.hairlineWidth,
    },
    shadowLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        minWidth: 64,
    },
    tabIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 2,
        textAlign: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: 24,
        height: 3,
        borderRadius: 1.5,
    },
    primaryButtonContainer: {
        alignItems: 'center',
        marginTop: -28,
        paddingHorizontal: 8,
    },
    primaryButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    primaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 6,
        textAlign: 'center',
    },
});

export default BottomTabBar;
