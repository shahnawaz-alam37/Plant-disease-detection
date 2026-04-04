import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
    colors: {
        primary: '#059669',
        primaryDark: '#047857',
        primaryLight: '#34D399',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#064E3B',
        textSecondary: '#374151',
        textLight: '#6B7280',
        error: '#EF4444',
        success: '#10B981',
        white: '#FFFFFF',
        border: '#E5E7EB',
        overlay: 'rgba(0, 0, 0, 0.5)',
        cardGradientStart: '#FFFFFF',
        cardGradientEnd: '#F0FDF4',
        heroGradientStart: '#059669',
        heroGradientEnd: '#047857',
        bubbleColor1: 'rgba(16, 185, 129, 0.2)',
        bubbleColor2: 'rgba(52, 211, 153, 0.15)',
        bubbleColor3: 'rgba(245, 158, 11, 0.1)',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        round: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '700' as const,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
            letterSpacing: -0.3,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as const,
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
        },
        caption: {
            fontSize: 14,
        },
        button: {
            fontSize: 16,
            fontWeight: '600' as const,
        },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};

export const darkTheme = {
    ...lightTheme,
    colors: {
        primary: '#10B981',
        primaryDark: '#059669',
        primaryLight: '#34D399',
        secondary: '#34D399',
        accent: '#FBBF24',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F0FDF4',
        textSecondary: '#CBD5E1',
        textLight: '#94A3B8',
        error: '#F87171',
        success: '#34D399',
        white: '#FFFFFF',
        border: '#334155',
        overlay: 'rgba(0, 0, 0, 0.7)',
        cardGradientStart: '#1E293B',
        cardGradientEnd: '#0F172A',
        heroGradientStart: '#047857',
        heroGradientEnd: '#064E3B',
        bubbleColor1: 'rgba(16, 185, 129, 0.3)',
        bubbleColor2: 'rgba(52, 211, 153, 0.25)',
        bubbleColor3: 'rgba(251, 191, 36, 0.15)',
    },
};

type Theme = typeof lightTheme;

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.log('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme preference:', error);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
