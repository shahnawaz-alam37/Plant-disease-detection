import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import RealisticHeroFallback from '../components/RealisticHeroFallback';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    const handleDetectPress = () => {
        navigation.navigate('DetectTab');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView 
                style={[styles.container, { backgroundColor: theme.colors.background }]} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Realistic Hero Section with Fallback */}
                <RealisticHeroFallback 
                    onScanPress={handleDetectPress}
                    theme={theme}
                />

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.primary }]}>
                    <Text style={styles.statEmoji}>🦠</Text>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>38+</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Diseases</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.accent }]}>
                    <Text style={styles.statEmoji}>🌿</Text>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>15+</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Species</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.success }]}>
                    <Text style={styles.statEmoji}>🎯</Text>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>95%</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Accuracy</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                {/* Watch Demo Video Button - Temporarily Disabled
                <TouchableOpacity
                    style={[styles.demoVideoCard, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('DemoVideo' as never)}
                    activeOpacity={0.9}
                >
                    <View style={styles.demoIconContainer}>
                        <Text style={styles.demoIcon}>🎬</Text>
                        <View style={styles.playIndicator}>
                            <Text style={styles.playIcon}>▶</Text>
                        </View>
                    </View>
                    <View style={styles.demoTextContainer}>
                        <Text style={styles.demoTitle}>Watch How It Works</Text>
                        <Text style={styles.demoSubtitle}>
                            See AI detecting plant diseases in real farming environment
                        </Text>
                    </View>
                    <View style={styles.demoArrow}>
                        <Text style={styles.arrowIcon}>→</Text>
                    </View>
                </TouchableOpacity>
                */}

                {/* Features Grid */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    ✨ Powerful Features
                </Text>
                
                <View style={styles.featuresGrid}>
                    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.featureIcon}>🤖</Text>
                        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                            AI Detection
                        </Text>
                        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                            Advanced deep learning model
                        </Text>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.featureIcon}>⚡</Text>
                        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                            Instant Results
                        </Text>
                        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                            Get diagnosis in seconds
                        </Text>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.featureIcon}>💊</Text>
                        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                            Treatment Tips
                        </Text>
                        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                            Detailed prevention guide
                        </Text>
                    </View>

                    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.featureIcon}>📚</Text>
                        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                            Learn & Grow
                        </Text>
                        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                            Expert gardening tips
                        </Text>
                    </View>
                </View>

                {/* Quick Access */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    🚀 Quick Access
                </Text>

                <TouchableOpacity
                    style={[styles.quickCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Knowledge Hub' as never)}
                >
                    <View style={[styles.quickIconBg, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={styles.quickIcon}>🌾</Text>
                    </View>
                    <View style={styles.quickContent}>
                        <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
                            Disease Knowledge Hub
                        </Text>
                        <Text style={[styles.quickDesc, { color: theme.colors.textSecondary }]}>
                            Learn about diseases, pests, and plant health
                        </Text>
                    </View>
                    <Text style={[styles.arrow, { color: theme.colors.primary }]}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Learn New' as never)}
                >
                    <View style={[styles.quickIconBg, { backgroundColor: theme.colors.accent + '20' }]}>
                        <Text style={styles.quickIcon}>🧠</Text>
                    </View>
                    <View style={styles.quickContent}>
                        <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
                            Few-Shot Learning
                        </Text>
                        <Text style={[styles.quickDesc, { color: theme.colors.textSecondary }]}>
                            Train AI on new diseases with just 5-10 images
                        </Text>
                    </View>
                    <Text style={[styles.arrow, { color: theme.colors.accent }]}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('AboutTab')}
                >
                    <View style={[styles.quickIconBg, { backgroundColor: theme.colors.success + '20' }]}>
                        <Text style={styles.quickIcon}>📖</Text>
                    </View>
                    <View style={styles.quickContent}>
                        <Text style={[styles.quickTitle, { color: theme.colors.text }]}>
                            How to Use
                        </Text>
                        <Text style={[styles.quickDesc, { color: theme.colors.textSecondary }]}>
                            Watch demo video and step-by-step guide
                        </Text>
                    </View>
                    <Text style={[styles.arrow, { color: theme.colors.success }]}>→</Text>
                </TouchableOpacity>

                {/* Plant Care Tips */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    💚 Daily Plant Care Tips
                </Text>

                <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.tipEmoji}>💧</Text>
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                            Watering Wisdom
                        </Text>
                        <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                            Check soil moisture before watering. Most plants prefer slightly moist soil. Overwatering is the #1 cause of plant death.
                        </Text>
                    </View>
                </View>

                <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.tipEmoji}>☀️</Text>
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                            Perfect Lighting
                        </Text>
                        <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                            Most plants thrive in bright, indirect light. Rotate plants weekly for even growth.
                        </Text>
                    </View>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100, // Extra padding for bottom tab bar
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 0,
        gap: 10,
        zIndex: 20,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderTopWidth: 3,
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 6,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    demoVideoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    demoIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    demoIcon: {
        fontSize: 32,
    },
    playIndicator: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    playIcon: {
        fontSize: 12,
        color: '#00916E',
        marginLeft: 2,
    },
    demoTextContainer: {
        flex: 1,
    },
    demoTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    demoSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        lineHeight: 16,
    },
    demoArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    arrowIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 16,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    featureCard: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    quickCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    quickIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    quickIcon: {
        fontSize: 28,
    },
    quickContent: {
        flex: 1,
    },
    quickTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    quickDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 8,
    },
    tipCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    tipEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    tipText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
