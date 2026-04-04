import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { theme } from '../theme';

const SPECIES_DATA = [
    { 
        id: '1', 
        name: 'Tomato', 
        icon: '🍅',
        scientificName: 'Solanum lycopersicum', 
        diseases: 10,
        color: '#EF4444'
    },
    { 
        id: '2', 
        name: 'Potato', 
        icon: '🥔',
        scientificName: 'Solanum tuberosum', 
        diseases: 5,
        color: '#A78BFA'
    },
    { 
        id: '3', 
        name: 'Corn', 
        icon: '🌽',
        scientificName: 'Zea mays', 
        diseases: 4,
        color: '#FBBF24'
    },
    { 
        id: '4', 
        name: 'Apple', 
        icon: '🍎',
        scientificName: 'Malus domestica', 
        diseases: 4,
        color: '#10B981'
    },
    { 
        id: '5', 
        name: 'Grape', 
        icon: '🍇',
        scientificName: 'Vitis vinifera', 
        diseases: 4,
        color: '#8B5CF6'
    },
    { 
        id: '6', 
        name: 'Pepper', 
        icon: '🌶️',
        scientificName: 'Capsicum annuum', 
        diseases: 2,
        color: '#F59E0B'
    },
    { 
        id: '7', 
        name: 'Cherry', 
        icon: '🍒',
        scientificName: 'Prunus avium', 
        diseases: 3,
        color: '#EC4899'
    },
    { 
        id: '8', 
        name: 'Blueberry', 
        icon: '🫐',
        scientificName: 'Vaccinium spp.', 
        diseases: 2,
        color: '#3B82F6'
    },
];

const SpeciesItem = ({ 
    item, 
    onPress 
}: { 
    item: typeof SPECIES_DATA[0];
    onPress: () => void;
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = new Animated.Value(1);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
                style={styles.item} 
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={[styles.iconPlaceholder, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.scientific}>{item.scientificName}</Text>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Plant Species</Text>
                        <Text style={[styles.details, { color: item.color }]}>
                            {item.diseases} Diseases
                        </Text>
                    </View>
                </View>
                <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: item.color }]}>
                        {item.diseases}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const StatCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.statCard}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export default function SpeciesScreen() {
    const totalDiseases = SPECIES_DATA.reduce((sum, s) => sum + s.diseases, 0);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Supported Species</Text>
                <Text style={styles.subtitle}>Plants our AI can diagnose</Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
                <StatCard icon="🌿" label="Species" value={SPECIES_DATA.length.toString()} />
                <StatCard icon="🦠" label="Diseases" value={totalDiseases.toString()} />
                <StatCard icon="✓" label="Coverage" value="95%" />
            </View>

            {/* Species List */}
            <FlatList
                data={SPECIES_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SpeciesItem 
                        item={item}
                        onPress={() => {
                            // Could navigate to species detail screen
                        }}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>💡</Text>
                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Coverage Expanding</Text>
                    <Text style={styles.infoText}>
                        More plants and diseases are being added regularly to our database.
                    </Text>
                </View>
            </View>
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
        paddingVertical: theme.spacing.xl,
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.white,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 15,
    },
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.l,
        gap: theme.spacing.m,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        alignItems: 'center',
        ...theme.shadows.small,
        borderTopWidth: 3,
        borderTopColor: theme.colors.primary,
    },
    statIcon: {
        fontSize: 28,
        marginBottom: theme.spacing.xs,
    },
    statValue: {
        ...theme.typography.h3,
        fontSize: 20,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.l,
        paddingBottom: theme.spacing.l,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        ...theme.shadows.small,
    },
    iconPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    iconText: {
        fontSize: 32,
    },
    info: {
        flex: 1,
    },
    name: {
        ...theme.typography.h3,
        fontSize: 17,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    scientific: {
        ...theme.typography.caption,
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: theme.spacing.xs,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    details: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    badge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing.m,
    },
    badgeText: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        marginHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.l,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        alignItems: 'flex-start',
        ...theme.shadows.small,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accent,
    },
    infoIcon: {
        fontSize: 24,
        marginRight: theme.spacing.m,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        ...theme.typography.h3,
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    infoText: {
        ...theme.typography.caption,
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
});
