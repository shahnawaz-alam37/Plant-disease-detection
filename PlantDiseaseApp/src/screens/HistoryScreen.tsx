import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useStore } from '../store';

const { width } = Dimensions.get('window');

interface HistoryItem {
    id: string;
    imageUri: string;
    predictedClass: string;
    confidence: number;
    date: string;
}

export default function HistoryScreen() {
    const history = useStore((state) => state.history);
    const setLastPrediction = useStore((state) => state.setLastPrediction);
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const isHealthy = item.predictedClass?.toLowerCase().includes('healthy');
        const confidencePercent = Math.round((item.confidence || 0) * 100);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    setLastPrediction(item);
                    navigation.navigate('Result', { 
                        imageUri: item.imageUri,
                        prediction: {
                            class: item.predictedClass,
                            confidence: item.confidence,
                            symptoms: [],
                            prevention: []
                        }
                    });
                }}
                activeOpacity={0.7}
            >
                {/* Thumbnail */}
                <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
                    {/* Health indicator badge */}
                    <View style={[styles.healthBadge, isHealthy ? styles.healthyBadge : styles.diseasedbadge]}>
                        <Text style={styles.healthBadgeText}>{isHealthy ? '✓' : '⚠'}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.predictedClass?.replace(/_/g, ' ') || 'Unknown'}
                    </Text>
                    <Text style={styles.cardDate}>
                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* Confidence Indicator */}
                <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceRing}>
                        <Text style={styles.confidenceText}>{confidencePercent}%</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const emptyComponent = (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
                Start analyzing plant leaves to build your detection history.
            </Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Capture' as never)}
            >
                <Text style={styles.emptyButtonText}>Analyze First Plant</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detection History</Text>
                <Text style={styles.headerSubtitle}>
                    {history.length} detection{history.length !== 1 ? 's' : ''} saved
                </Text>
            </View>

            {history.length === 0 ? (
                emptyComponent
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.l,
        paddingTop: theme.spacing.l,
        paddingBottom: theme.spacing.l,
        borderBottomLeftRadius: theme.borderRadius.l,
        borderBottomRightRadius: theme.borderRadius.l,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.white,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    list: {
        padding: theme.spacing.l,
        paddingBottom: 100, // Extra padding for bottom tab bar
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        alignItems: 'center',
        ...theme.shadows.small,
    },
    thumbnailContainer: {
        position: 'relative',
        marginRight: theme.spacing.m,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.lightGray || '#E5E7EB',
    },
    healthBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.white,
    },
    healthyBadge: {
        backgroundColor: theme.colors.success,
    },
    diseasedbadge: {
        backgroundColor: theme.colors.error,
    },
    healthBadgeText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.h3,
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    cardDate: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    confidenceContainer: {
        marginLeft: theme.spacing.m,
    },
    confidenceRing: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    confidenceText: {
        ...theme.typography.button,
        fontSize: 13,
        color: theme.colors.primary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.m,
    },
    emptyTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.l,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    emptyButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        ...theme.shadows.medium,
    },
    emptyButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
});
