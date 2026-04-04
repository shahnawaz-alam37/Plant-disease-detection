import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import FewShotCamera from '../components/FewShotCamera';

const { width } = Dimensions.get('window');

interface CapturedImage {
    id: string;
    uri: string;
    timestamp: number;
}

const ArticleCard = ({ 
    icon, 
    title, 
    category, 
    readTime,
    description,
    fullContent
}: { 
    icon: string;
    title: string; 
    category: string; 
    readTime: string;
    description: string;
    fullContent: {
        sections: Array<{
            heading: string;
            content: string;
            bullets?: string[];
        }>;
    };
}) => {
    const { theme } = useTheme();
    const [expanded, setExpanded] = useState(false);
    
    return (
        <View style={[styles.articleCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity 
                style={styles.articleHeader}
                activeOpacity={0.8}
                onPress={() => setExpanded(!expanded)}
            >
                <View style={[styles.articleIconBg, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={styles.articleIcon}>{icon}</Text>
                </View>
                <View style={styles.articleContent}>
                    <View style={styles.articleMeta}>
                        <Text style={[styles.category, { color: theme.colors.primary }]}>{category}</Text>
                        <Text style={[styles.readTime, { color: theme.colors.textSecondary }]}>{readTime}</Text>
                    </View>
                    <Text style={[styles.articleTitle, { color: theme.colors.text }]}>{title}</Text>
                    <Text style={[styles.articleDesc, { color: theme.colors.textSecondary }]} numberOfLines={expanded ? undefined : 2}>
                        {description}
                    </Text>
                </View>
                <Text style={[styles.arrow, { color: theme.colors.primary }]}>
                    {expanded ? '▼' : '→'}
                </Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.expandedContent}>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    {fullContent.sections.map((section, index) => (
                        <View key={index} style={styles.contentSection}>
                            <Text style={[styles.contentHeading, { color: theme.colors.text }]}>
                                {section.heading}
                            </Text>
                            <Text style={[styles.contentText, { color: theme.colors.textSecondary }]}>
                                {section.content}
                            </Text>
                            {section.bullets && (
                                <View style={styles.bulletList}>
                                    {section.bullets.map((bullet, i) => (
                                        <View key={i} style={styles.bulletItem}>
                                            <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
                                            <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                                                {bullet}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default function LearnNewScreen() {
    const { theme } = useTheme();
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [isTraining, setIsTraining] = useState(false);
    const [diseaseName, setDiseaseName] = useState('');

    const handleStartCapture = () => {
        setShowCamera(true);
    };

    const handleCameraComplete = (images: CapturedImage[]) => {
        setCapturedImages(images);
        setShowCamera(false);
        Alert.alert(
            'Images Captured Successfully!',
            `${images.length} images are ready for training. Please enter a name for this disease.`,
            [{ text: 'OK' }]
        );
    };

    const handleCameraCancel = () => {
        setShowCamera(false);
    };

    const handleStartTraining = async () => {
        if (capturedImages.length < 5) {
            Alert.alert('Not Enough Images', 'Please capture at least 5 images to start training');
            return;
        }

        setIsTraining(true);
        
        // Simulate AI training process
        try {
            // In real implementation, send images to backend for training
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            Alert.alert(
                '🎉 Training Complete!',
                `Successfully trained AI model on "${diseaseName || 'new disease'}". The model can now detect this disease in future scans.`,
                [
                    {
                        text: 'Great!',
                        onPress: () => {
                            setCapturedImages([]);
                            setDiseaseName('');
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Training Failed', 'An error occurred during training. Please try again.');
        } finally {
            setIsTraining(false);
        }
    };

    // Show camera interface if active
    if (showCamera) {
        return (
            <FewShotCamera 
                onComplete={handleCameraComplete}
                onCancel={handleCameraCancel}
            />
        );
    }

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.headerIcon}>🧠</Text>
                <Text style={styles.headerTitle}>Few-Shot Learning</Text>
                <Text style={styles.headerSubtitle}>
                    Train AI on new diseases with minimal data
                </Text>
            </View>

            {/* Few-Shot Learning Hero */}
            <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroEmoji}>🚀</Text>
                    <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
                        Revolutionary AI Feature
                    </Text>
                    <Text style={[styles.heroDesc, { color: theme.colors.textSecondary }]}>
                        Our advanced few-shot learning algorithm can identify new plant diseases with just 5-10 example images. Upload photos of an unknown disease, and our AI will learn to detect it!
                    </Text>
                </View>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    🎯 How Few-Shot Learning Works
                </Text>

                <View style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            Collect Sample Images
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                            Take 5-10 clear photos of the new disease from different angles and plants. Ensure good lighting and focus.
                        </Text>
                    </View>
                </View>

                <View style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            Upload & Label
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                            Upload your images and provide a name for the disease. Add optional details about symptoms observed.
                        </Text>
                    </View>
                </View>

                <View style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            AI Training
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                            Our advanced neural network learns the disease patterns from your samples using transfer learning.
                        </Text>
                    </View>
                </View>

                <View style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            AI Analysis & Detection
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                            AI analyzes patterns and generates symptoms, causes, and prevention strategies automatically.
                        </Text>
                    </View>
                </View>

                <View style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>5</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            Instant Detection Ready
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                            Model is now ready! Scan any plant with the same disease and get instant accurate diagnosis.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Training Interface */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    📸 Train on New Disease
                </Text>

                <View style={[styles.trainingCard, { backgroundColor: theme.colors.surface }]}>
                    {capturedImages.length === 0 ? (
                        <View style={[styles.uploadArea, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            <Text style={styles.uploadIcon}>📤</Text>
                            <Text style={[styles.uploadText, { color: theme.colors.text }]}>
                                Capture Disease Images
                            </Text>
                            <Text style={[styles.uploadHint, { color: theme.colors.textSecondary }]}>
                                Use camera to capture 5-10 clear photos
                            </Text>
                            <TouchableOpacity
                                style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleStartCapture}
                            >
                                <Text style={styles.uploadButtonText}>
                                    📷 Open Camera
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.successBox}>
                                <Text style={styles.successIcon}>✓</Text>
                                <View style={styles.successContent}>
                                    <Text style={[styles.successTitle, { color: theme.colors.success }]}>
                                        {capturedImages.length} Images Captured
                                    </Text>
                                    <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
                                        Ready for AI training
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.recaptureButton, { borderColor: theme.colors.border }]}
                                onPress={handleStartCapture}
                            >
                                <Text style={[styles.recaptureText, { color: theme.colors.primary }]}>
                                    📷 Capture More Images
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {capturedImages.length > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            backgroundColor: theme.colors.success,
                                            width: `${(capturedImages.length / 10) * 100}%`
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressText, { color: theme.colors.success }]}>
                                ✓ Ready to train
                            </Text>
                        </View>
                    )}

                    {isTraining ? (
                        <View style={styles.trainingInProgress}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={[styles.trainingText, { color: theme.colors.text }]}>
                                🤖 Training AI Model...
                            </Text>
                            <Text style={[styles.trainingSubtext, { color: theme.colors.textSecondary }]}>
                                This may take a few minutes
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.trainButton,
                                {
                                    backgroundColor: capturedImages.length >= 5 ? theme.colors.primary : theme.colors.border,
                                }
                            ]}
                            onPress={handleStartTraining}
                            disabled={capturedImages.length < 5}
                        >
                            <Text style={[
                                styles.trainButtonText,
                                { color: capturedImages.length >= 5 ? '#FFFFFF' : theme.colors.textLight }
                            ]}>
                                🚀 Start AI Training
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    ✨ Why Few-Shot Learning is Powerful
                </Text>

                <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.benefitIcon}>⚡</Text>
                    <View style={styles.benefitContent}>
                        <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                            Minimal Data Required
                        </Text>
                        <Text style={[styles.benefitDesc, { color: theme.colors.textSecondary }]}>
                            Traditional AI needs thousands of images. Our few-shot learning works with just 5-10 samples.
                        </Text>
                    </View>
                </View>

                <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.benefitIcon}>🔬</Text>
                    <View style={styles.benefitContent}>
                        <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                            Rare Disease Detection
                        </Text>
                        <Text style={[styles.benefitDesc, { color: theme.colors.textSecondary }]}>
                            Identify emerging or rare diseases not in standard databases. Perfect for unique local conditions.
                        </Text>
                    </View>
                </View>

                <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.benefitIcon}>🌍</Text>
                    <View style={styles.benefitContent}>
                        <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                            Community Knowledge
                        </Text>
                        <Text style={[styles.benefitDesc, { color: theme.colors.textSecondary }]}>
                            Help the agricultural community by training models on diseases in your region.
                        </Text>
                    </View>
                </View>

                <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.benefitIcon}>🤖</Text>
                    <View style={styles.benefitContent}>
                        <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                            AI-Powered Insights
                        </Text>
                        <Text style={[styles.benefitDesc, { color: theme.colors.textSecondary }]}>
                            AI automatically generates symptoms, causes, and prevention strategies from learned patterns.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Learning Resources */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    📚 Learn Plant Care & Disease Prevention
                </Text>

                <ArticleCard
                    icon="💧"
                    title="Watering 101: Complete Beginner's Guide"
                    category="Fundamentals"
                    readTime="5 min"
                    description="Master the essential watering techniques for healthy plant growth. Learn when, how much, and the best methods to water your plants."
                    fullContent={{
                        sections: [
                            {
                                heading: "Understanding Plant Water Needs",
                                content: "Different plants have vastly different water requirements. Succulents and cacti need minimal water, while tropical plants require consistent moisture. The key is understanding your specific plant's natural habitat and mimicking those conditions.",
                                bullets: [
                                    "Check soil moisture before watering - stick finger 2 inches deep",
                                    "Water early morning (6-10 AM) for best absorption",
                                    "Use room temperature water to avoid shocking roots",
                                    "Ensure proper drainage to prevent root rot"
                                ]
                            },
                            {
                                heading: "Common Watering Mistakes",
                                content: "Overwatering is the #1 killer of houseplants and crops. Signs include yellowing leaves, wilting despite wet soil, and musty odor. Underwatering shows as dry, crispy leaf edges and drooping.",
                                bullets: [
                                    "Don't water on a fixed schedule - check soil first",
                                    "Avoid watering leaves in evening (promotes fungal growth)",
                                    "Don't use cold tap water directly on roots",
                                    "Never let plants sit in standing water for more than 30 minutes"
                                ]
                            },
                            {
                                heading: "Best Watering Techniques",
                                content: "Deep, infrequent watering encourages strong root systems. Water until it drains from the bottom, then wait until the top 1-2 inches of soil dry out before watering again.",
                                bullets: [
                                    "Bottom watering: Place pot in water tray for 15-20 minutes",
                                    "Drip irrigation: Ideal for consistent moisture in gardens",
                                    "Soaker hoses: Perfect for vegetable beds and rows",
                                    "Self-watering pots: Great for consistent moisture lovers"
                                ]
                            },
                            {
                                heading: "Seasonal Adjustments",
                                content: "Plants need less water in winter when growth slows, and more in summer during active growth. Adjust your watering frequency based on temperature, humidity, and light levels.",
                            }
                        ]
                    }}
                />

                <ArticleCard
                    icon="🌍"
                    title="Understanding Soil pH and Nutrients"
                    category="Soil Health"
                    readTime="6 min"
                    description="Learn how soil composition affects plant nutrition, disease resistance, and overall health. Master the science of soil management."
                    fullContent={{
                        sections: [
                            {
                                heading: "What is Soil pH?",
                                content: "Soil pH measures acidity or alkalinity on a scale of 0-14. Most plants thrive in slightly acidic soil (pH 6.0-7.0). pH affects nutrient availability - wrong pH locks nutrients away from plant roots even when present in soil.",
                                bullets: [
                                    "Acidic soil (pH < 7): Blueberries, azaleas, potatoes prefer this",
                                    "Neutral soil (pH 7): Most vegetables and flowers thrive here",
                                    "Alkaline soil (pH > 7): Lilacs, clematis tolerate higher pH",
                                    "Test pH yearly using simple soil test kits ($10-15)"
                                ]
                            },
                            {
                                heading: "Essential Nutrients (NPK)",
                                content: "N-P-K stands for Nitrogen, Phosphorus, and Potassium - the three primary nutrients all plants need. Each serves specific functions in plant health and disease resistance.",
                                bullets: [
                                    "Nitrogen (N): Promotes leafy green growth, protein synthesis",
                                    "Phosphorus (P): Supports root development, flowering, fruiting",
                                    "Potassium (K): Strengthens disease resistance, stress tolerance",
                                    "Secondary nutrients: Calcium, Magnesium, Sulfur also critical"
                                ]
                            },
                            {
                                heading: "Soil Testing and Amendment",
                                content: "Professional soil tests reveal pH, nutrient levels, and organic matter content. Testing costs $15-50 but saves money on unnecessary fertilizers and prevents nutrient imbalances.",
                                bullets: [
                                    "To raise pH: Add lime (calcium carbonate) - takes 2-3 months",
                                    "To lower pH: Add sulfur or peat moss - work in gradually",
                                    "Add compost annually: Improves structure and nutrient retention",
                                    "Avoid over-fertilizing: Causes salt buildup and weak growth"
                                ]
                            },
                            {
                                heading: "Organic Matter Benefits",
                                content: "Compost, aged manure, and leaf mold improve soil structure, water retention, and beneficial microbe populations. Aim for 5-10% organic matter in garden soil.",
                                bullets: [
                                    "Improves drainage in clay soils",
                                    "Increases water retention in sandy soils",
                                    "Feeds beneficial bacteria and fungi",
                                    "Provides slow-release nutrients naturally"
                                ]
                            }
                        ]
                    }}
                />

                <ArticleCard
                    icon="🦠"
                    title="Common Plant Diseases & Early Detection"
                    category="Disease Prevention"
                    readTime="8 min"
                    description="Identify and prevent the most common plant diseases before they spread. Learn early warning signs and rapid response strategies."
                    fullContent={{
                        sections: [
                            {
                                heading: "Fungal Diseases (Most Common)",
                                content: "Fungal infections cause 85% of plant diseases. They thrive in warm, humid conditions with poor air circulation. Early detection is crucial for control.",
                                bullets: [
                                    "Powdery Mildew: White powdery coating on leaves, stems",
                                    "Early Blight: Brown spots with concentric rings on lower leaves",
                                    "Late Blight: Water-soaked lesions, spreads rapidly in cool, wet weather",
                                    "Downy Mildew: Yellow patches on top, fuzzy growth underneath"
                                ]
                            },
                            {
                                heading: "Bacterial Diseases",
                                content: "Bacteria enter through wounds, natural openings, or insect damage. They multiply rapidly in warm, wet conditions. Often impossible to cure once established.",
                                bullets: [
                                    "Bacterial Leaf Spot: Dark, water-soaked spots with yellow halos",
                                    "Fire Blight: Blackened, scorched-looking branches and flowers",
                                    "Soft Rot: Mushy, foul-smelling tissue breakdown",
                                    "Prevention: Use disease-free seeds, practice crop rotation"
                                ]
                            },
                            {
                                heading: "Viral Diseases",
                                content: "Viruses spread through insects (especially aphids), contaminated tools, or infected plant material. No cure exists - prevention is essential.",
                                bullets: [
                                    "Mosaic Virus: Mottled yellow-green patterns on leaves",
                                    "Leaf Curl: Distorted, curled leaves with abnormal color",
                                    "Stunting: Reduced growth, shortened internodes",
                                    "Control aphids and thrips to prevent virus spread"
                                ]
                            },
                            {
                                heading: "Early Warning Signs",
                                content: "Catching disease early dramatically improves success rates. Inspect plants weekly, especially undersides of leaves and new growth.",
                                bullets: [
                                    "Color changes: Yellowing, browning, or unusual spots",
                                    "Texture changes: Wilting, mushy areas, powdery coatings",
                                    "Growth abnormalities: Stunting, distortion, dieback",
                                    "Immediate action: Isolate affected plants, remove infected parts"
                                ]
                            },
                            {
                                heading: "Prevention Strategies",
                                content: "Prevention is 10x easier than cure. Build disease resistance through cultural practices, plant selection, and environmental management.",
                                bullets: [
                                    "Space plants for air circulation - prevents humidity buildup",
                                    "Water at soil level in morning - leaves dry quickly",
                                    "Sanitize tools between plants - use 10% bleach solution",
                                    "Choose resistant varieties when available",
                                    "Rotate crops annually - breaks disease cycles",
                                    "Remove plant debris promptly - destroys overwintering spores"
                                ]
                            }
                        ]
                    }}
                />

                <ArticleCard
                    icon="🔬"
                    title="Integrated Pest Management (IPM)"
                    category="Advanced"
                    readTime="10 min"
                    description="Holistic approach combining cultural, biological, and chemical controls. Sustainable pest and disease management for long-term success."
                    fullContent={{
                        sections: [
                            {
                                heading: "What is IPM?",
                                content: "Integrated Pest Management uses multiple complementary strategies to control pests and diseases while minimizing environmental impact. Focus on prevention, monitoring, and targeted intervention.",
                                bullets: [
                                    "Step 1: Monitor - Regular scouting and identification",
                                    "Step 2: Set thresholds - When does damage warrant action?",
                                    "Step 3: Prevent - Cultural practices that discourage pests",
                                    "Step 4: Intervene - Use least toxic effective method first"
                                ]
                            },
                            {
                                heading: "Cultural Controls (First Line)",
                                content: "Modify environment and practices to make conditions unfavorable for pests and diseases. Most sustainable and cost-effective approach.",
                                bullets: [
                                    "Crop rotation: 3-4 year cycles prevent pest buildup",
                                    "Proper spacing: Good air circulation reduces disease",
                                    "Timing: Plant when pest pressure is naturally low",
                                    "Sanitation: Remove diseased plants and debris immediately",
                                    "Resistant varieties: Genetic resistance is most reliable"
                                ]
                            },
                            {
                                heading: "Biological Controls",
                                content: "Use natural predators, parasites, and pathogens to control pest populations. Sustainable and builds long-term balance in your garden ecosystem.",
                                bullets: [
                                    "Beneficial insects: Ladybugs eat aphids, lacewings eat mites",
                                    "Parasitic wasps: Lay eggs in pest larvae, killing them",
                                    "Nematodes: Microscopic worms kill soil-dwelling pests",
                                    "Bt (Bacillus thuringiensis): Bacterial spray for caterpillars",
                                    "Encourage birds: Natural predators for many insects"
                                ]
                            },
                            {
                                heading: "Physical and Mechanical Controls",
                                content: "Direct removal or barriers to exclude pests. Labor-intensive but very effective for small-scale operations.",
                                bullets: [
                                    "Hand-picking: Remove pests and diseased leaves manually",
                                    "Row covers: Floating fabric excludes flying insects",
                                    "Traps: Sticky traps, pheromone traps for monitoring and control",
                                    "Barriers: Copper tape for slugs, netting for birds",
                                    "Pruning: Remove infected parts before disease spreads"
                                ]
                            },
                            {
                                heading: "Chemical Controls (Last Resort)",
                                content: "When other methods fail and damage exceeds threshold, use pesticides judiciously. Always choose least toxic option that will be effective.",
                                bullets: [
                                    "Organic options first: Neem oil, insecticidal soap, horticultural oils",
                                    "Target specific pests: Avoid broad-spectrum pesticides",
                                    "Proper timing: Apply when pests are vulnerable (early stages)",
                                    "Follow labels exactly: More is not better - can harm plants",
                                    "Rotate modes of action: Prevents pesticide resistance",
                                    "Protect beneficials: Apply in evening when bees are inactive"
                                ]
                            },
                            {
                                heading: "Monitoring and Record Keeping",
                                content: "Track what works and what doesn't. Data helps refine your IPM program and predict future problems.",
                                bullets: [
                                    "Weekly scouting: Check plants systematically",
                                    "Identify pests correctly: Misidentification wastes time and money",
                                    "Count pest numbers: Helps determine if threshold is reached",
                                    "Record treatments: Date, method, weather, results",
                                    "Note successes and failures for next season"
                                ]
                            }
                        ]
                    }}
                />

                <ArticleCard
                    icon="🌱"
                    title="Organic Disease Prevention Methods"
                    category="Organic Farming"
                    readTime="7 min"
                    description="Natural and sustainable ways to protect your plants from diseases without synthetic chemicals. Build healthy ecosystems."
                    fullContent={{
                        sections: [
                            {
                                heading: "Building Healthy Soil",
                                content: "Healthy soil creates healthy plants with natural disease resistance. Soil biology is your greatest ally in organic disease prevention.",
                                bullets: [
                                    "Add compost regularly: 2-3 inches annually improves microbiology",
                                    "Use cover crops: Protect and enrich soil between plantings",
                                    "Minimize tillage: Preserves beneficial fungi and soil structure",
                                    "Apply mycorrhizal fungi: Forms symbiotic relationship with roots",
                                    "Maintain pH balance: Proper pH optimizes nutrient availability"
                                ]
                            },
                            {
                                heading: "Organic Fungicides",
                                content: "Natural substances that control fungal diseases without synthetic chemistry. Most effective as preventatives, not cures.",
                                bullets: [
                                    "Neem oil: Broad-spectrum, also controls insects and mites",
                                    "Copper fungicides: For bacterial and fungal diseases (use sparingly)",
                                    "Sulfur: Excellent for powdery mildew, black spot",
                                    "Baking soda spray: 1 tbsp per gallon for mild powdery mildew",
                                    "Compost tea: Beneficial microbes outcompete pathogens",
                                    "Garlic spray: Antifungal and repels insects"
                                ]
                            },
                            {
                                heading: "Companion Planting for Disease Control",
                                content: "Strategic plant combinations that confuse pests, attract beneficials, or suppress diseases through root exudates and aromatic compounds.",
                                bullets: [
                                    "Marigolds: Suppress soil nematodes with root exudates",
                                    "Alliums (garlic, onions): Antifungal properties benefit neighbors",
                                    "Basil: Repels aphids and thrips from tomatoes",
                                    "Nasturtiums: Trap crop for aphids, protects main crops",
                                    "Herbs (thyme, sage): Aromatic oils deter many pests"
                                ]
                            },
                            {
                                heading: "Organic Fertilization",
                                content: "Feed the soil, not the plant. Organic fertilizers release nutrients slowly, promoting steady growth and strong disease resistance.",
                                bullets: [
                                    "Compost: Complete nutrient source, improves soil structure",
                                    "Fish emulsion: Quick nitrogen boost (5-1-1 NPK)",
                                    "Bone meal: Slow-release phosphorus for roots and blooms",
                                    "Kelp meal: Micronutrients and growth hormones",
                                    "Worm castings: Rich in beneficial microbes and enzymes",
                                    "Green manure: Grow then till in nitrogen-fixing crops"
                                ]
                            },
                            {
                                heading: "Water Management",
                                content: "Proper watering is crucial for organic disease prevention. Many diseases thrive in moisture, while water stress weakens plants.",
                                bullets: [
                                    "Drip irrigation: Keeps foliage dry, reduces fungal diseases",
                                    "Water deeply but infrequently: Encourages deep roots",
                                    "Morning watering: Foliage dries quickly in sunlight",
                                    "Mulch: Conserves moisture, prevents soil splash onto leaves",
                                    "Monitor soil moisture: Don't water on fixed schedule"
                                ]
                            },
                            {
                                heading: "Biodiversity and Ecosystem Health",
                                content: "Diverse plantings create balanced ecosystems where pests and diseases are naturally regulated by predators and competition.",
                                bullets: [
                                    "Polyculture over monoculture: Mixed plantings confuse pests",
                                    "Native plants: Support beneficial insects and pollinators",
                                    "Hedgerows: Habitat for pest predators and parasitoids",
                                    "Perennial borders: Year-round homes for beneficial insects",
                                    "Water features: Attract frogs and birds that eat pests"
                                ]
                            }
                        ]
                    }}
                />
            </View>

            {/* Expert Tips */}
            <View style={[styles.tipsSection, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.tipsSectionTitle, { color: theme.colors.text }]}>
                    💡 Expert Tips for Success
                </Text>
                
                <View style={styles.tipItem}>
                    <Text style={styles.tipIcon}>📸</Text>
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                            Capture Clear Symptoms
                        </Text>
                        <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                            Ensure disease symptoms are clearly visible in all uploaded images. Use good lighting and focus.
                        </Text>
                    </View>
                </View>

                <View style={styles.tipItem}>
                    <Text style={styles.tipIcon}>🔄</Text>
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                            Multiple Angles
                        </Text>
                        <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                            Take photos from different angles and stages of disease progression for better AI learning.
                        </Text>
                    </View>
                </View>

                <View style={styles.tipItem}>
                    <Text style={styles.tipIcon}>✅</Text>
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                            Quality Over Quantity
                        </Text>
                        <Text style={[styles.tipDesc, { color: theme.colors.textSecondary }]}>
                            5-7 high-quality, clear images are better than 10 blurry or poorly lit photos.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerIcon: {
        fontSize: 56,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    heroCard: {
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    heroContent: {
        padding: 24,
        alignItems: 'center',
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroDesc: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    stepCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    stepDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    trainingCard: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    uploadArea: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    uploadIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    uploadHint: {
        fontSize: 14,
        marginBottom: 20,
    },
    uploadButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
    },
    successIcon: {
        fontSize: 48,
        marginRight: 16,
        color: '#10B981',
    },
    successContent: {
        flex: 1,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    successText: {
        fontSize: 14,
    },
    recaptureButton: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        marginBottom: 16,
    },
    recaptureText: {
        fontSize: 15,
        fontWeight: '600',
    },
    trainingInProgress: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    trainingText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 6,
    },
    trainingSubtext: {
        fontSize: 14,
    },
    progressContainer: {
        marginTop: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '600',
    },
    trainButton: {
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    trainButtonText: {
        fontSize: 18,
        fontWeight: '700',
    },
    benefitCard: {
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
    benefitIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    benefitDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    articleCard: {
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    articleHeader: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    articleIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    articleIcon: {
        fontSize: 28,
    },
    articleContent: {
        flex: 1,
    },
    articleMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    category: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    readTime: {
        fontSize: 11,
    },
    articleTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    articleDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 8,
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    contentSection: {
        marginBottom: 20,
    },
    contentHeading: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    contentText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    bulletList: {
        marginTop: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    tipsSection: {
        marginHorizontal: 24,
        marginTop: 32,
        marginBottom: 48,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    tipsSectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
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
