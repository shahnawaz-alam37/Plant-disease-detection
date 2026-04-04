import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.faqQuestion}>{question}</Text>
                <Text style={[styles.faqIcon, expanded && styles.faqIconExpanded]}>▼</Text>
            </TouchableOpacity>
            {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
        </View>
    );
};

const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>{icon}</Text>
        </View>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{description}</Text>
        </View>
    </View>
);

export default function AboutScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroIcon}>🌿</Text>
                <Text style={styles.title}>Plant Doctor</Text>
                <Text style={styles.subtitle}>AI-Powered Plant Disease Detection</Text>
                <Text style={styles.description}>
                    Your personal plant pathologist in your pocket. Identify diseases in seconds and get actionable treatment recommendations.
                </Text>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Key Features</Text>
                <FeatureItem
                    icon="🤖"
                    title="Advanced AI Analysis"
                    description="Powered by cutting-edge computer vision and deep learning models"
                />
                <FeatureItem
                    icon="⚡"
                    title="Instant Results"
                    description="Get diagnosis and treatment recommendations in seconds"
                />
                <FeatureItem
                    icon="📊"
                    title="Confidence Scoring"
                    description="See exactly how confident the AI is in each diagnosis"
                />
                <FeatureItem
                    icon="💾"
                    title="Complete History"
                    description="Keep track of all your plant diagnoses for reference"
                />
            </View>

            {/* How to Use Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📸 How to Use</Text>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Take Clear Photo</Text>
                        <Text style={styles.stepDesc}>Center the affected area of the leaf. Ensure good natural lighting.</Text>
                    </View>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Run Analysis</Text>
                        <Text style={styles.stepDesc}>Tap "Detect Disease" to send the image to our AI server.</Text>
                    </View>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Review Results</Text>
                        <Text style={styles.stepDesc}>Check the diagnosis, confidence level, and detailed treatment steps.</Text>
                    </View>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Take Action</Text>
                        <Text style={styles.stepDesc}>Follow the recommendations to treat your plant. Download the full report if needed.</Text>
                    </View>
                </View>
            </View>

            {/* Tips Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>🔦</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Good Lighting is Key</Text>
                        <Text style={styles.tipDesc}>Use natural daylight for best results. Avoid shadows.</Text>
                    </View>
                </View>
                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>📍</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Focus on the Problem</Text>
                        <Text style={styles.tipDesc}>Capture the affected area clearly, not the whole plant.</Text>
                    </View>
                </View>
                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>📱</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Internet Required</Text>
                        <Text style={styles.tipDesc}>AI analysis requires active internet connection.</Text>
                    </View>
                </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>❓ FAQ</Text>
                <FAQItem
                    question="How accurate is the AI?"
                    answer="Our system achieves over 95% accuracy on common plant diseases through continuous training on thousands of labeled plant images."
                />
                <FAQItem
                    question="Is my data private?"
                    answer="Your photos are used only for analysis and are not stored permanently. We respect your privacy completely."
                />
                <FAQItem
                    question="What plants are supported?"
                    answer="We support analysis of 15+ major plant species and over 30 common diseases. Coverage is continuously expanding."
                />
                <FAQItem
                    question="Can I use it offline?"
                    answer="The diagnosis requires internet connection, but you can view your history and past results offline."
                />
                <FAQItem
                    question="What if the diagnosis is wrong?"
                    answer="If results seem incorrect, try again with a clearer, better-lit photo. Consult agricultural experts for critical decisions."
                />
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>30+</Text>
                        <Text style={styles.statLabel}>Diseases</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>15+</Text>
                        <Text style={styles.statLabel}>Plants</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>95%</Text>
                        <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                </View>

                <View style={styles.footerContent}>
                    <Text style={styles.footerTitle}>About Plant Doctor</Text>
                    <Text style={styles.footerText}>
                        Plant Doctor is an AI-powered application designed to help plant enthusiasts and farmers quickly identify plant diseases and get actionable treatment recommendations.
                    </Text>
                    <Text style={styles.footerText}>
                        Version 1.0.0 • Made with 🌱 for healthy plants
                    </Text>
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
    heroSection: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.l,
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    heroIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.m,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.white,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: theme.spacing.m,
        fontSize: 16,
    },
    description: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginHorizontal: theme.spacing.l,
        marginVertical: theme.spacing.l,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.small,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        marginBottom: theme.spacing.l,
        color: theme.colors.text,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: theme.spacing.l,
        alignItems: 'flex-start',
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    featureIconText: {
        fontSize: 28,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
    },
    featureDesc: {
        ...theme.typography.caption,
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    step: {
        flexDirection: 'row',
        marginBottom: theme.spacing.l,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    stepNumberText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        marginBottom: 4,
        color: theme.colors.text,
    },
    stepDesc: {
        ...theme.typography.body,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(5, 150, 105, 0.05)',
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    tipIcon: {
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
        ...theme.typography.body,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: theme.spacing.m,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        ...theme.typography.body,
        fontWeight: '600',
        flex: 1,
        fontSize: 15,
        color: theme.colors.text,
    },
    faqIcon: {
        fontSize: 14,
        color: theme.colors.primary,
        marginLeft: theme.spacing.m,
        fontWeight: '600',
    },
    faqIconExpanded: {
        transform: [{ rotate: '180deg' }],
    },
    faqAnswer: {
        marginTop: theme.spacing.m,
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        marginHorizontal: theme.spacing.l,
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.small,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.l,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        ...theme.typography.h2,
        fontSize: 28,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: theme.colors.border,
    },
    footerContent: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.small,
    },
    footerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    footerText: {
        ...theme.typography.body,
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
        lineHeight: 20,
    },
});
