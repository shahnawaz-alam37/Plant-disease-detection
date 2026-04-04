import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Disease Knowledge Database
const DISEASE_CATEGORIES = [
    {
        id: '1',
        category: 'Fungal Diseases',
        icon: '🍄',
        color: '#8B5CF6',
        diseases: [
            {
                name: 'Early Blight',
                plants: ['Tomato', 'Potato'],
                severity: 'Moderate',
                symptoms: 'Dark brown spots with concentric rings on leaves',
                causes: 'Alternaria solani fungus, warm humid conditions',
                prevention: 'Crop rotation, remove infected debris, fungicide application',
                icon: '🟤'
            },
            {
                name: 'Late Blight',
                plants: ['Tomato', 'Potato'],
                severity: 'Severe',
                symptoms: 'Water-soaked spots, white mold on leaf undersides',
                causes: 'Phytophthora infestans, cool wet weather',
                prevention: 'Resistant varieties, copper fungicides, good air circulation',
                icon: '⚫'
            },
            {
                name: 'Powdery Mildew',
                plants: ['Grape', 'Apple', 'Cherry'],
                severity: 'Moderate',
                symptoms: 'White powdery coating on leaves and stems',
                causes: 'Various fungal species, high humidity',
                prevention: 'Prune for airflow, sulfur sprays, resistant varieties',
                icon: '⚪'
            },
        ]
    },
    {
        id: '2',
        category: 'Bacterial Diseases',
        icon: '🦠',
        color: '#EF4444',
        diseases: [
            {
                name: 'Bacterial Spot',
                plants: ['Tomato', 'Pepper'],
                severity: 'Moderate',
                symptoms: 'Small dark spots with yellow halos on leaves',
                causes: 'Xanthomonas bacteria, splash from rain or irrigation',
                prevention: 'Disease-free seeds, copper sprays, avoid overhead watering',
                icon: '🔴'
            },
            {
                name: 'Bacterial Canker',
                plants: ['Tomato'],
                severity: 'Severe',
                symptoms: 'Wilting, stem cankers, bird\'s eye spots on fruit',
                causes: 'Clavibacter michiganensis, contaminated tools',
                prevention: 'Sanitation, resistant varieties, avoid plant stress',
                icon: '🟠'
            },
        ]
    },
    {
        id: '3',
        category: 'Viral Diseases',
        icon: '🧬',
        color: '#10B981',
        diseases: [
            {
                name: 'Tomato Mosaic Virus',
                plants: ['Tomato', 'Pepper'],
                severity: 'High',
                symptoms: 'Mottled leaves, stunted growth, reduced yield',
                causes: 'TMV virus, transmitted through handling',
                prevention: 'Resistant varieties, hand washing, tool sterilization',
                icon: '🟢'
            },
            {
                name: 'Leaf Curl',
                plants: ['Tomato'],
                severity: 'High',
                symptoms: 'Upward curling leaves, purple veins, stunted plants',
                causes: 'Whitefly-transmitted virus',
                prevention: 'Control whiteflies, remove infected plants, resistant varieties',
                icon: '🟣'
            },
        ]
    },
    {
        id: '4',
        category: 'Pest Damage',
        icon: '🐛',
        color: '#F59E0B',
        diseases: [
            {
                name: 'Spider Mites',
                plants: ['All Plants'],
                severity: 'Moderate',
                symptoms: 'Tiny yellow/white spots, fine webbing, leaf bronzing',
                causes: 'Hot dry conditions favor mite populations',
                prevention: 'Increase humidity, neem oil, predatory mites',
                icon: '🕷️'
            },
            {
                name: 'Aphids',
                plants: ['All Plants'],
                severity: 'Low-Moderate',
                symptoms: 'Clustered small insects, sticky honeydew, curled leaves',
                causes: 'Rapid reproduction in spring, attracted to new growth',
                prevention: 'Beneficial insects, insecticidal soap, strong water spray',
                icon: '🐜'
            },
            {
                name: 'Whiteflies',
                plants: ['Tomato', 'Pepper', 'Cucumber'],
                severity: 'Moderate',
                symptoms: 'Tiny white flying insects, sticky leaves, yellowing',
                causes: 'Warm greenhouse conditions, dense plantings',
                prevention: 'Yellow sticky traps, neem oil, parasitic wasps',
                icon: '🦟'
            },
        ]
    },
    {
        id: '5',
        category: 'Nutrient Deficiencies',
        icon: '⚗️',
        color: '#3B82F6',
        diseases: [
            {
                name: 'Nitrogen Deficiency',
                plants: ['All Plants'],
                severity: 'Moderate',
                symptoms: 'Yellowing of older leaves, stunted growth',
                causes: 'Poor soil, heavy rain leaching, rapid growth',
                prevention: 'Balanced fertilizer, compost, legume cover crops',
                icon: '💛'
            },
            {
                name: 'Calcium Deficiency',
                plants: ['Tomato', 'Pepper'],
                severity: 'Moderate',
                symptoms: 'Blossom end rot, tip burn on leaves',
                causes: 'Irregular watering, low soil calcium, high soil salt',
                prevention: 'Consistent watering, lime addition, mulching',
                icon: '🤎'
            },
        ]
    },
];

const COMMON_INSECTS = [
    {
        name: 'Japanese Beetle',
        icon: '🪲',
        damage: 'Skeletonizes leaves, damages flowers',
        control: 'Hand picking, neem oil, milky spore disease'
    },
    {
        name: 'Caterpillars',
        icon: '🐛',
        damage: 'Chewing holes in leaves and fruit',
        control: 'Bt spray, hand picking, beneficial wasps'
    },
    {
        name: 'Thrips',
        icon: '🦟',
        damage: 'Silver streaks on leaves, deformed flowers',
        control: 'Blue sticky traps, neem oil, predatory mites'
    },
    {
        name: 'Leafminers',
        icon: '🪰',
        damage: 'Winding trails inside leaves',
        control: 'Remove affected leaves, row covers, parasitic wasps'
    },
];

const DiseaseCard = ({ disease, color }: { disease: any; color: string }) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useTheme();

    return (
        <View style={[styles.diseaseCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.diseaseHeader}>
                    <View style={styles.diseaseHeaderLeft}>
                        <Text style={styles.diseaseIcon}>{disease.icon}</Text>
                        <View>
                            <Text style={[styles.diseaseName, { color: theme.colors.text }]}>
                                {disease.name}
                            </Text>
                            <Text style={[styles.diseasePlants, { color: theme.colors.textSecondary }]}>
                                Affects: {disease.plants.join(', ')}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.severityText, { color: color }]}>
                            {disease.severity}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            
            {expanded && (
                <View style={styles.diseaseDetails}>
                    <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                            🔍 Symptoms
                        </Text>
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {disease.symptoms}
                        </Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                            ⚠️ Causes
                        </Text>
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {disease.causes}
                        </Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                            💊 Prevention & Treatment
                        </Text>
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                            {disease.prevention}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const InsectCard = ({ insect }: { insect: any }) => {
    const { theme } = useTheme();
    
    return (
        <View style={[styles.insectCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.insectIcon}>{insect.icon}</Text>
            <View style={styles.insectContent}>
                <Text style={[styles.insectName, { color: theme.colors.text }]}>
                    {insect.name}
                </Text>
                <Text style={[styles.insectDamage, { color: theme.colors.textSecondary }]}>
                    {insect.damage}
                </Text>
                <Text style={[styles.insectControl, { color: theme.colors.primary }]}>
                    ✓ {insect.control}
                </Text>
            </View>
        </View>
    );
};

export default function SpeciesScreen() {
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState(DISEASE_CATEGORIES[0].id);

    const currentCategory = DISEASE_CATEGORIES.find(cat => cat.id === selectedCategory);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.headerIcon}>🌾</Text>
                <Text style={styles.title}>Disease Knowledge Hub</Text>
                <Text style={styles.subtitle}>
                    Complete guide to plant diseases, pests, and prevention
                </Text>
            </View>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categories}
            >
                {DISEASE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryTab,
                            {
                                backgroundColor: selectedCategory === cat.id ? cat.color : theme.colors.surface,
                            }
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text
                            style={[
                                styles.categoryText,
                                {
                                    color: selectedCategory === cat.id ? '#FFFFFF' : theme.colors.text
                                }
                            ]}
                        >
                            {cat.category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Disease List */}
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {currentCategory?.icon} {currentCategory?.category}
                </Text>
                <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                    {currentCategory?.diseases.length} diseases in this category
                </Text>

                {currentCategory?.diseases.map((disease, idx) => (
                    <DiseaseCard
                        key={idx}
                        disease={disease}
                        color={currentCategory.color}
                    />
                ))}

                {/* Common Insects Section */}
                {selectedCategory === '4' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 32 }]}>
                            🐛 Common Agricultural Insects
                        </Text>
                        <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                            Identify and control common garden pests
                        </Text>

                        {COMMON_INSECTS.map((insect, idx) => (
                            <InsectCard key={idx} insect={insect} />
                        ))}
                    </>
                )}

                {/* Gardening Tips for Beginners */}
                <View style={[styles.tipsSection, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.tipsSectionTitle, { color: theme.colors.text }]}>
                        🌱 Gardening Tips for Beginners
                    </Text>
                    
                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>💧</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Water Wisely
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Water deeply but infrequently. Early morning is best. Check soil moisture before watering.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🌍</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Soil Health First
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Add compost regularly. Test soil pH. Good drainage is essential for healthy roots.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🔄</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Crop Rotation
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Rotate plant families yearly. Prevents disease buildup and maintains soil nutrients.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🦋</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Encourage Beneficials
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Plant flowers to attract pollinators and predatory insects. Avoid broad-spectrum pesticides.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>📅</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Know Your Zone
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Plant at the right time for your climate. Follow frost dates. Choose adapted varieties.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>✂️</Text>
                        <View style={styles.tipContent}>
                            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                                Prune Properly
                            </Text>
                            <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                                Remove dead/diseased growth promptly. Prune for airflow. Sterilize tools between cuts.
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
    header: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 18,
    },
    categoriesScroll: {
        maxHeight: 120,
        paddingVertical: 16,
    },
    categories: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryTab: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        height: 90,
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 12,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 100, // Extra padding for bottom tab bar
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
        marginTop: 0,
    },
    sectionDesc: {
        fontSize: 13,
        marginBottom: 14,
        opacity: 0.7,
    },
    diseaseCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    diseaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diseaseHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    diseaseIcon: {
        fontSize: 28,
        marginRight: 14,
    },
    diseaseName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    diseasePlants: {
        fontSize: 12,
        opacity: 0.8,
    },
    severityBadge: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    severityText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    diseaseDetails: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    detailSection: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 5,
        letterSpacing: 0.2,
    },
    detailText: {
        fontSize: 13,
        lineHeight: 19,
        opacity: 0.85,
    },
    insectCard: {
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
    insectIcon: {
        fontSize: 36,
        marginRight: 16,
    },
    insectContent: {
        flex: 1,
    },
    insectName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    insectDamage: {
        fontSize: 13,
        marginBottom: 6,
        lineHeight: 18,
    },
    insectControl: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '600',
    },
    tipsSection: {
        marginTop: 20,
        marginBottom: 0,
        padding: 18,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    tipsSectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    tipIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    tipDesc: {
        fontSize: 13,
        lineHeight: 20,
    },
});
