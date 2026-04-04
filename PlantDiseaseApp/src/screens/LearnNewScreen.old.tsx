import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { theme } from '../theme';

const ArticleCard = ({ 
    icon, 
    title, 
    category, 
    readTime,
    description 
}: { 
    icon: string;
    title: string; 
    category: string; 
    readTime: string;
    description: string;
}) => {
    const scaleAnim = new Animated.Value(1);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
                style={styles.cardTouchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>{icon}</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.category}>{category}</Text>
                        <Text style={styles.readTime}>{readTime}</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const TopicBadge = ({ icon, label }: { icon: string; label: string }) => (
    <View style={styles.topicBadge}>
        <Text style={styles.topicIcon}>{icon}</Text>
        <Text style={styles.topicLabel}>{label}</Text>
    </View>
);

export default function LearnNewScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerIcon}>📚</Text>
                <Text style={styles.headerTitle}>Learn & Grow</Text>
                <Text style={styles.headerSubtitle}>Master plant care and disease prevention</Text>
            </View>

            {/* Popular Topics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Topics</Text>
                <View style={styles.topicsGrid}>
                    <TopicBadge icon="💧" label="Watering" />
                    <TopicBadge icon="☀️" label="Lighting" />
                    <TopicBadge icon="🌍" label="Soil" />
                    <TopicBadge icon="🦠" label="Diseases" />
                    <TopicBadge icon="🐛" label="Pests" />
                    <TopicBadge icon="🌱" label="Growth" />
                </View>
            </View>

            {/* Featured Articles */}
            <Text style={styles.sectionTitle}>Featured Articles</Text>
            
            <ArticleCard
                icon="💧"
                title="Watering 101: The Complete Guide"
                category="Fundamentals"
                readTime="5 min"
                description="Learn the essential watering techniques for healthy plant growth"
            />

            <ArticleCard
                icon="🌍"
                title="Understanding Soil pH and Nutrients"
                category="Soil Health"
                readTime="6 min"
                description="Discover how soil composition affects plant nutrition"
            />

            <ArticleCard
                icon="☀️"
                title="Light Conditions: Indoor vs Outdoor"
                category="Care Guide"
                readTime="4 min"
                description="Optimize plant growth with proper lighting conditions"
            />

            <ArticleCard
                icon="🦠"
                title="Common Plant Diseases & Prevention"
                category="Disease Control"
                readTime="8 min"
                description="Identify and prevent the most common plant diseases"
            />

            <ArticleCard
                icon="🐛"
                title="Natural Pest Control Methods"
                category="Pest Management"
                readTime="7 min"
                description="Safely eliminate pests without harmful chemicals"
            />

            <ArticleCard
                icon="🧪"
                title="Plant Nutrition: NPK Explained"
                category="Science"
                readTime="6 min"
                description="Understand nitrogen, phosphorus, and potassium for plants"
            />

            {/* Expert Tips Section */}
            <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Expert Tips</Text>
                <View style={styles.tipBox}>
                    <Text style={styles.tipNumber}>💡</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Check Before You Water</Text>
                        <Text style={styles.tipDesc}>Stick your finger 1 inch into soil. Water only if dry.</Text>
                    </View>
                </View>
                <View style={styles.tipBox}>
                    <Text style={styles.tipNumber}>💡</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Observe Your Plant</Text>
                        <Text style={styles.tipDesc}>Yellow leaves often mean overwatering, brown tips mean underwatering.</Text>
                    </View>
                </View>
                <View style={styles.tipBox}>
                    <Text style={styles.tipNumber}>💡</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Rotate for Even Growth</Text>
                        <Text style={styles.tipDesc}>Turn your plant 90° weekly for balanced light exposure.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingBottom: theme.spacing.xxl,
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    headerIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.m,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.white,
        marginBottom: theme.spacing.s,
    },
    headerSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 15,
    },
    section: {
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
        paddingHorizontal: theme.spacing.l,
    },
    topicBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.round,
        ...theme.shadows.small,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    topicIcon: {
        fontSize: 18,
        marginRight: theme.spacing.xs,
    },
    topicLabel: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: theme.colors.text,
    },
    card: {
        marginHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
    },
    cardTouchable: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    cardIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    cardIcon: {
        fontSize: 32,
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    category: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 11,
    },
    readTime: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontSize: 11,
    },
    cardTitle: {
        ...theme.typography.h3,
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    cardDesc: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 16,
    },
    arrowIcon: {
        fontSize: 20,
        color: theme.colors.primary,
        marginLeft: theme.spacing.s,
    },
    tipsSection: {
        paddingHorizontal: theme.spacing.l,
        marginVertical: theme.spacing.l,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        alignItems: 'flex-start',
        ...theme.shadows.small,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accent,
    },
    tipNumber: {
        fontSize: 28,
        marginRight: theme.spacing.m,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        ...theme.typography.h3,
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    tipDesc: {
        ...theme.typography.caption,
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
});
