import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [expanded, setExpanded] = React.useState(false);
    const { theme } = useTheme();

    return (
        <View style={[styles.faqItem, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{question}</Text>
                <Text style={[styles.faqIcon, expanded && styles.faqIconExpanded, { color: theme.colors.primary }]}>▼</Text>
            </TouchableOpacity>
            {expanded && <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{answer}</Text>}
        </View>
    );
};

const InstructionStep = ({ step, icon, title, description, images }: { 
    step: number; 
    icon: string; 
    title: string; 
    description: string;
    images?: string[];
}) => {
    const { theme } = useTheme();
    
    return (
        <View style={styles.instructionStep}>
            <View style={styles.stepLeft}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.stepNumberText}>{step}</Text>
                </View>
                {step < 5 && <View style={[styles.stepLine, { backgroundColor: theme.colors.border }]} />}
            </View>
            <View style={[styles.stepRight, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.stepIcon}>{step}</Text>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
                {images && images.length > 0 && (
                    <View style={styles.imagesContainer}>
                        {images.map((img, idx) => (
                            <View key={idx} style={[styles.imagePlaceholder, { backgroundColor: theme.colors.background }]}>
                                <Text style={styles.imagePlaceholderText}>{img}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

export default function AboutScreen() {
    const { theme } = useTheme();

    const openDemoVideo = () => {
        // Placeholder - you can add actual video URL
        Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]} 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="leaf" size={48} color="#FFFFFF" style={{ marginBottom: 16 }} />
                <Text style={styles.title}>Plant Doctor</Text>
                <Text style={styles.subtitle}>Instant Plant Disease Diagnosis</Text>
                <Text style={styles.description}>
                    Identify plant diseases from a photo and get clear treatment recommendations, backed by a model trained on thousands of real samples.
                </Text>
            </View>

            {/* Demo Video Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Watch How It Works
                </Text>
                <TouchableOpacity 
                    style={[styles.videoCard, { backgroundColor: theme.colors.surface }]}
                    onPress={openDemoVideo}
                    activeOpacity={0.8}
                >
                    <View style={[styles.videoThumbnail, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.playButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.playIcon}>▶</Text>
                        </View>
                        <Text style={styles.videoOverlay}>Demo Video</Text>
                    </View>
                    <View style={styles.videoInfo}>
                        <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
                            Complete App Tutorial
                        </Text>
                        <Text style={[styles.videoDesc, { color: theme.colors.textSecondary }]}>
                            Learn how to scan plants, interpret results, and apply treatments • 3:45 min
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Step-by-Step Instructions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    How to Use
                </Text>
                <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                    Follow these simple steps to get accurate disease diagnosis
                </Text>

                <View style={styles.instructionsContainer}>
                    <InstructionStep
                        step={1}
                        icon=""
                        title="Take a Clear Photo"
                        description="Ensure good natural lighting. Center the affected leaf area. Avoid shadows and blurry images for best results."
                        images={['Good Light', 'Close-up', 'Clear Focus']}
                    />
                    
                    <InstructionStep
                        step={2}
                        icon=""
                        title="Tap Scan"
                        description="The model analyzes your image against thousands of labeled plant disease samples to find the best match."
                    />
                    
                    <InstructionStep
                        step={3}
                        icon=""
                        title="Review Diagnosis"
                        description="Check the disease name, confidence score, and affected plant species. Higher confidence means more accurate results."
                        images={['Results View']}
                    />
                    
                    <InstructionStep
                        step={4}
                        icon=""
                        title="Read Treatment Plan"
                        description="Get detailed symptoms, causes, and step-by-step treatment recommendations based on agricultural research."
                    />
                    
                    <InstructionStep
                        step={5}
                        icon=""
                        title="Take Action"
                        description="Apply the recommended treatments. Save the report for future reference. Monitor plant health improvement."
                    />
                </View>
            </View>

            {/* Best Practices Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Tips for Better Results
                </Text>
                
                <View style={[styles.practiceCard, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="sunny-outline" size={28} color={theme.colors.primary} style={{ marginRight: 16 }} />
                    <View style={styles.practiceContent}>
                        <Text style={[styles.practiceTitle, { color: theme.colors.text }]}>
                            Use Natural Daylight
                        </Text>
                        <Text style={[styles.practiceDesc, { color: theme.colors.textSecondary }]}>
                            Take photos in morning or afternoon sunlight. Avoid artificial lighting and shadows.
                        </Text>
                    </View>
                </View>

                <View style={[styles.practiceCard, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="crop-outline" size={28} color={theme.colors.primary} style={{ marginRight: 16 }} />
                    <View style={styles.practiceContent}>
                        <Text style={[styles.practiceTitle, { color: theme.colors.text }]}>
                            Capture Affected Area
                        </Text>
                        <Text style={[styles.practiceDesc, { color: theme.colors.textSecondary }]}>
                            Focus on diseased parts. Fill the frame with the leaf showing symptoms.
                        </Text>
                    </View>
                </View>

                <View style={[styles.practiceCard, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="phone-portrait-outline" size={28} color={theme.colors.primary} style={{ marginRight: 16 }} />
                    <View style={styles.practiceContent}>
                        <Text style={[styles.practiceTitle, { color: theme.colors.text }]}>
                            Stable & Clear Shot
                        </Text>
                        <Text style={[styles.practiceDesc, { color: theme.colors.textSecondary }]}>
                            Hold phone steady. Ensure image is in focus and not blurry.
                        </Text>
                    </View>
                </View>

                <View style={[styles.practiceCard, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="wifi-outline" size={28} color={theme.colors.primary} style={{ marginRight: 16 }} />
                    <View style={styles.practiceContent}>
                        <Text style={[styles.practiceTitle, { color: theme.colors.text }]}>
                            Active Internet Required
                        </Text>
                        <Text style={[styles.practiceDesc, { color: theme.colors.textSecondary }]}>
                            AI analysis requires internet connection to our servers.
                        </Text>
                    </View>
                </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Common Questions
                </Text>
                <FAQItem
                    question="How accurate is the AI detection?"
                    answer="Our deep learning model achieves over 95% accuracy on common plant diseases. The system is continuously trained on thousands of expert-labeled plant images for improved results."
                />
                <FAQItem
                    question="What plants are supported?"
                    answer="We currently support 15+ major agricultural and garden plant species including tomato, potato, corn, apple, grape, pepper, cherry, and more. Over 38 different diseases can be detected."
                />
                <FAQItem
                    question="Is my data private and secure?"
                    answer="Absolutely. Your photos are used only for disease analysis and are not stored permanently or shared. We respect your privacy and data security."
                />
                <FAQItem
                    question="Can I use the app offline?"
                    answer="Disease diagnosis requires internet connection to access our AI servers. However, you can view your saved history and past results offline anytime."
                />
                <FAQItem
                    question="What if the diagnosis seems wrong?"
                    answer="AI is highly accurate but not perfect. If results seem incorrect, try retaking the photo with better lighting and clarity. For critical decisions, consult agricultural experts."
                />
                <FAQItem
                    question="How do I improve detection accuracy?"
                    answer="Use natural daylight, focus on affected areas, avoid shadows, keep the image clear and stable, and ensure the symptoms are clearly visible in the photo."
                />
            </View>

            {/* Stats Section */}
            <View style={styles.section}>
                <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>38+</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Diseases</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>15+</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Plants</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>95%</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Accuracy</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.footerTitle, { color: theme.colors.text }]}>About Plant Doctor</Text>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                    Plant Doctor is an AI-powered application designed to help farmers, gardeners, and plant enthusiasts quickly identify plant diseases and receive expert treatment recommendations.
                </Text>
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                    Powered by advanced deep learning and computer vision technology.
                </Text>
                <Text style={[styles.footerVersion, { color: theme.colors.textLight }]}>
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 100, // Extra padding for bottom tab bar
    },
    heroSection: {
        paddingVertical: 48,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    section: {
        marginHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionDesc: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    videoCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    videoThumbnail: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    playIcon: {
        color: '#FFFFFF',
        fontSize: 28,
        marginLeft: 4,
    },
    videoOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    videoInfo: {
        padding: 20,
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    videoDesc: {
        fontSize: 13,
        lineHeight: 20,
    },
    instructionsContainer: {
        marginTop: 8,
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    stepLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    stepLine: {
        width: 2,
        flex: 1,
        minHeight: 40,
    },
    stepRight: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    stepIcon: {
        fontSize: 36,
        marginBottom: 12,
    },
    stepTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    imagesContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    imagePlaceholder: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 11,
        fontWeight: '600',
    },
    practiceCard: {
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
    practiceIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    practiceContent: {
        flex: 1,
    },
    practiceTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    practiceDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    faqItem: {
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    faqIcon: {
        fontSize: 14,
        marginLeft: 16,
        fontWeight: '600',
    },
    faqIconExpanded: {
        transform: [{ rotate: '180deg' }],
    },
    faqAnswer: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    footer: {
        marginHorizontal: 24,
        marginTop: 32,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 22,
    },
    footerVersion: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});
