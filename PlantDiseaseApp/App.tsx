import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Platform, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AboutScreen from './src/screens/AboutScreen';
import LearnNewScreen from './src/screens/LearnNewScreen';
import SpeciesScreen from './src/screens/SpeciesScreen';
// import DemoVideoScreen from './src/screens/DemoVideoScreen'; // Temporarily disabled until video file is added

// Components
import BottomTabBar from './src/components/BottomTabBar';

import { loadModel } from './src/services/mlService';
import { useStore } from './src/store';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Floating Theme Toggle Button Component - Always Visible
const FloatingThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset rotation after animation
    setTimeout(() => {
      rotateAnim.setValue(0);
    }, 350);

    toggleTheme();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingToggleContainer,
        {
          transform: [{ scale: scaleAnim }, { rotate: rotation }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.floatingToggleButton,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E5E7EB',
            shadowColor: isDark ? '#10B981' : '#059669',
          },
        ]}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={22}
          color={isDark ? '#FBBF24' : '#6366F1'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Header Theme Toggle Button (for screens with visible headers)
const HeaderThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={20}
        color={isDark ? '#FBBF24' : '#6366F1'}
      />
    </TouchableOpacity>
  );
};

// Stack for the Home tab (Home -> other screens within home flow)
function HomeStack() {
  const { theme, isDark } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <HeaderThemeToggle />,
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Plant Doctor',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Knowledge Hub" 
        component={SpeciesScreen} 
        options={{ 
          title: 'Knowledge Hub',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Learn New" 
        component={LearnNewScreen} 
        options={{ 
          title: 'Few-Shot Learning',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'History' }} 
      />
    </Stack.Navigator>
  );
}

// Stack for the Detect tab (Capture -> Result flow)
function DetectStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="CaptureScreen" 
        component={CaptureScreen} 
        options={{ 
          title: 'Analyze Leaf',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{ 
          title: 'Diagnosis',
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
}

// Stack for the About tab
function AboutStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <HeaderThemeToggle />,
      }}
    >
      <Stack.Screen 
        name="AboutScreen" 
        component={AboutScreen} 
        options={{ 
          title: 'About & Guide',
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const setModelReady = useStore((state) => state.setModelReady);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const init = async () => {
      const success = await loadModel();
      setModelReady(success);
    };
    init();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Tab.Navigator
          tabBar={(props) => <BottomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{
              title: 'Home',
            }}
          />
          <Tab.Screen
            name="DetectTab"
            component={DetectStack}
            options={{
              title: 'Detect',
            }}
          />
          <Tab.Screen
            name="AboutTab"
            component={AboutStack}
            options={{
              title: 'About',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      {/* Floating Theme Toggle - Always Visible */}
      <FloatingThemeToggle />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  floatingToggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  floatingToggleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
