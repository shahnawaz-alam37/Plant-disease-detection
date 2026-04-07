import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
// @ts-ignore
import * as Print from 'expo-print';
// @ts-ignore
import * as Sharing from 'expo-sharing';
// @ts-ignore
import * as FileSystem from 'expo-file-system';

export default function ResultScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    
    // Get prediction from route params with detailed fallback
    let prediction = route.params?.prediction || {};
    let imageUri = route.params?.imageUri || prediction?.imageUri;
    
    // Log for debugging
    console.log("ResultScreen received:", JSON.stringify({ imageUri, prediction }));
    
    // Ensure prediction object has all required fields
    prediction = {
        class: prediction?.class || 'Unable to diagnose',
        confidence: typeof prediction?.confidence === 'number' ? prediction.confidence : 0,
        symptoms: Array.isArray(prediction?.symptoms) ? prediction.symptoms : [],
        prevention: Array.isArray(prediction?.prevention) ? prediction.prevention : [],
        quality: prediction?.quality || null,
        topPredictions: prediction?.topPredictions || null,
        ...prediction
    };

    // Calculate confidence with proper type checking
    const confidence = Math.max(0, Math.min(100, prediction.confidence || 0));
    const confidencePercentage = confidence > 100 ? Math.round((confidence / 100) * 100) : Math.round(confidence);
    const isHealthy = prediction.class?.toLowerCase().includes('healthy');
    const diseaseSeverity = confidencePercentage > 80 ? 'High' : confidencePercentage > 50 ? 'Medium' : 'Low';
    
    // Quality score
    const qualityScore = prediction.quality?.score ?? null;
    const qualityIssues = prediction.quality?.issues || [];
    const qualitySuggestions = prediction.quality?.suggestions || [];
    
    // Top predictions
    const topPredictions = prediction.topPredictions || [];
    
    console.log("Confidence calculation:", { raw: prediction.confidence, percentage: confidencePercentage });

    const getConfidenceColor = (pct: number) => {
        if (pct > 80) return '#10B981';
        if (pct > 50) return '#F59E0B';
        return '#EF4444';
    };

    const getQualityColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getQualityLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const generatePDF = async () => {
        try {
            // Convert image to base64 for embedding in PDF
            let imageBase64 = '';
            if (imageUri) {
                try {
                    const base64 = await FileSystem.readAsStringAsync(imageUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    imageBase64 = `data:image/jpeg;base64,${base64}`;
                } catch (imgError) {
                    console.log('Could not embed image in PDF:', imgError);
                }
            }

            const dateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const confColor = getConfidenceColor(confidencePercentage);
            const qualColor = qualityScore !== null ? getQualityColor(qualityScore) : '#888';

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            background: #F0FDF4;
                            color: #1F2937;
                            padding: 0;
                            line-height: 1.5;
                        }
                        .page {
                            max-width: 595px;
                            margin: 0 auto;
                            background: white;
                            min-height: 842px;
                        }
                        
                        /* Header */
                        .header {
                            background: linear-gradient(135deg, #059669, #047857);
                            color: white;
                            padding: 24px 30px;
                            text-align: center;
                        }
                        .header-title {
                            font-size: 24px;
                            font-weight: 700;
                            margin-bottom: 4px;
                            letter-spacing: -0.3px;
                        }
                        .header-subtitle {
                            font-size: 12px;
                            opacity: 0.85;
                            font-weight: 400;
                        }
                        .header-date {
                            font-size: 11px;
                            opacity: 0.7;
                            margin-top: 8px;
                        }
                        
                        /* Image Section */
                        .image-section {
                            padding: 20px 30px;
                            text-align: center;
                            background: #F9FAFB;
                            border-bottom: 1px solid #E5E7EB;
                        }
                        .image-section img {
                            width: 260px;
                            height: 260px;
                            object-fit: cover;
                            border-radius: 12px;
                            border: 3px solid #E5E7EB;
                            display: block;
                            margin: 0 auto;
                        }
                        .image-caption {
                            font-size: 11px;
                            color: #6B7280;
                            margin-top: 8px;
                        }
                        
                        /* Content */
                        .content {
                            padding: 24px 30px;
                        }
                        
                        /* Status Badge */
                        .status-badge {
                            display: inline-block;
                            padding: 6px 16px;
                            border-radius: 20px;
                            font-size: 13px;
                            font-weight: 600;
                            margin-bottom: 20px;
                        }
                        .status-healthy {
                            background: #DCFCE7;
                            color: #166534;
                        }
                        .status-diseased {
                            background: #FEE2E2;
                            color: #991B1B;
                        }
                        
                        /* Diagnosis Box */
                        .diagnosis-box {
                            background: #F9FAFB;
                            border-left: 4px solid #059669;
                            padding: 16px 20px;
                            border-radius: 0 8px 8px 0;
                            margin-bottom: 20px;
                        }
                        .diagnosis-label {
                            font-size: 10px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #6B7280;
                            margin-bottom: 4px;
                            font-weight: 600;
                        }
                        .diagnosis-name {
                            font-size: 20px;
                            font-weight: 700;
                            color: ${isHealthy ? '#059669' : '#DC2626'};
                        }
                        
                        /* Metrics Row */
                        .metrics-row {
                            display: flex;
                            gap: 16px;
                            margin-bottom: 24px;
                        }
                        .metric-card {
                            flex: 1;
                            background: #F9FAFB;
                            border-radius: 8px;
                            padding: 14px 16px;
                            border: 1px solid #E5E7EB;
                        }
                        .metric-label {
                            font-size: 10px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #6B7280;
                            margin-bottom: 6px;
                            font-weight: 600;
                        }
                        .metric-value {
                            font-size: 24px;
                            font-weight: 700;
                        }
                        .metric-sublabel {
                            font-size: 11px;
                            color: #6B7280;
                            margin-top: 2px;
                        }
                        
                        /* Progress bar */
                        .progress-bar {
                            width: 100%;
                            height: 8px;
                            background: #E5E7EB;
                            border-radius: 4px;
                            margin-top: 8px;
                            overflow: hidden;
                        }
                        .progress-fill {
                            height: 100%;
                            border-radius: 4px;
                        }
                        
                        /* Section */
                        .section {
                            margin-bottom: 20px;
                        }
                        .section-title {
                            font-size: 14px;
                            font-weight: 700;
                            color: #064E3B;
                            margin-bottom: 12px;
                            padding-bottom: 6px;
                            border-bottom: 2px solid #D1FAE5;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        
                        /* List items */
                        .list-item {
                            display: flex;
                            align-items: flex-start;
                            margin-bottom: 10px;
                            padding: 8px 12px;
                            background: #FEF2F2;
                            border-radius: 6px;
                            border-left: 3px solid #EF4444;
                        }
                        .list-item.prevention {
                            background: #F0FDF4;
                            border-left-color: #10B981;
                        }
                        .list-number {
                            width: 22px;
                            height: 22px;
                            border-radius: 11px;
                            background: #059669;
                            color: white;
                            font-size: 11px;
                            font-weight: 700;
                            text-align: center;
                            line-height: 22px;
                            margin-right: 10px;
                            flex-shrink: 0;
                        }
                        .list-text {
                            font-size: 13px;
                            color: #374151;
                            line-height: 1.5;
                            flex: 1;
                        }
                        .bullet {
                            color: #EF4444;
                            margin-right: 8px;
                            font-weight: 700;
                            flex-shrink: 0;
                        }
                        
                        /* Top Predictions */
                        .predictions-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 8px;
                        }
                        .predictions-table th {
                            background: #F3F4F6;
                            padding: 8px 12px;
                            text-align: left;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            color: #6B7280;
                            font-weight: 600;
                            border-bottom: 2px solid #E5E7EB;
                        }
                        .predictions-table td {
                            padding: 8px 12px;
                            font-size: 12px;
                            border-bottom: 1px solid #F3F4F6;
                        }
                        .predictions-table tr:first-child td {
                            font-weight: 600;
                            background: #F0FDF4;
                        }
                        
                        /* Quality Issues */
                        .quality-issue {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 4px 0;
                            font-size: 12px;
                            color: #92400E;
                        }
                        
                        /* Footer */
                        .footer {
                            background: #F9FAFB;
                            padding: 16px 30px;
                            text-align: center;
                            border-top: 1px solid #E5E7EB;
                            margin-top: 20px;
                        }
                        .footer-text {
                            font-size: 11px;
                            color: #9CA3AF;
                        }
                        .footer-brand {
                            font-size: 12px;
                            color: #059669;
                            font-weight: 600;
                            margin-bottom: 4px;
                        }
                        .disclaimer {
                            font-size: 9px;
                            color: #9CA3AF;
                            margin-top: 8px;
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <!-- Header -->
                        <div class="header">
                            <div class="header-title">Plant Disease Detection Report</div>
                            <div class="header-subtitle">Plant Health Analysis</div>
                            <div class="header-date">Generated on ${dateStr} at ${timeStr}</div>
                        </div>
                        
                        <!-- Image -->
                        ${imageBase64 ? `
                        <div class="image-section">
                            <img src="${imageBase64}" alt="Analyzed plant image" />
                            <div class="image-caption">Captured plant specimen for analysis</div>
                        </div>
                        ` : ''}
                        
                        <div class="content">
                            <!-- Status -->
                            <div style="text-align: center;">
                                <span class="status-badge ${isHealthy ? 'status-healthy' : 'status-diseased'}">
                                    ${isHealthy ? 'Healthy Plant' : 'Disease Detected'}
                                </span>
                            </div>
                            
                            <!-- Diagnosis -->
                            <div class="diagnosis-box">
                                <div class="diagnosis-label">Diagnosis</div>
                                <div class="diagnosis-name">${prediction.class || 'Unknown'}</div>
                            </div>
                            
                            <!-- Metrics -->
                            <div class="metrics-row">
                                <div class="metric-card">
                                    <div class="metric-label">Confidence</div>
                                    <div class="metric-value" style="color: ${confColor}">${confidencePercentage}%</div>
                                    <div class="metric-sublabel">${diseaseSeverity} Confidence</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${Math.min(confidencePercentage, 100)}%; background: ${confColor}"></div>
                                    </div>
                                </div>
                                ${qualityScore !== null ? `
                                <div class="metric-card">
                                    <div class="metric-label">Image Quality</div>
                                    <div class="metric-value" style="color: ${qualColor}">${qualityScore}%</div>
                                    <div class="metric-sublabel">${getQualityLabel(qualityScore)}</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${qualityScore}%; background: ${qualColor}"></div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                            
                            ${qualityIssues.length > 0 ? `
                            <div class="section">
                                <div class="section-title">Image Quality Notes</div>
                                ${qualityIssues.map((issue: string) => `
                                    <div class="quality-issue">${issue}</div>
                                `).join('')}
                            </div>
                            ` : ''}
                            
                            <!-- Top Predictions -->
                            ${topPredictions.length > 0 ? `
                            <div class="section">
                                <div class="section-title">Top Predictions</div>
                                <table class="predictions-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Disease</th>
                                            <th>Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${topPredictions.map((p: any, i: number) => `
                                            <tr>
                                                <td>${i + 1}</td>
                                                <td>${p.class}</td>
                                                <td>${typeof p.confidence === 'number' ? p.confidence.toFixed(1) : p.confidence}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : ''}
                            
                            <!-- Symptoms -->
                            ${prediction.symptoms && prediction.symptoms.length > 0 ? `
                            <div class="section">
                                <div class="section-title">Symptoms</div>
                                ${prediction.symptoms.map((s: string) => `
                                    <div class="list-item">
                                        <span class="bullet">•</span>
                                        <span class="list-text">${s}</span>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}
                            
                            <!-- Prevention & Treatment -->
                            ${prediction.prevention && prediction.prevention.length > 0 ? `
                            <div class="section">
                                <div class="section-title">Prevention and Treatment</div>
                                ${prediction.prevention.map((p: string, i: number) => `
                                    <div class="list-item prevention">
                                        <span class="list-number">${i + 1}</span>
                                        <span class="list-text">${p}</span>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <div class="footer-brand">Plant Doctor</div>
                            <div class="footer-text">Helping you grow healthier plants</div>
                            <div class="disclaimer">
                                This report is generated by an AI model and is for informational purposes only. 
                                Please consult a qualified agricultural expert for professional advice.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ 
                html,
                width: 595,
                height: 842,
            });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

        } catch (error) {
            Alert.alert("Error", "Could not generate PDF report.");
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            <View style={styles.resultContainer}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, isHealthy ? styles.healthyBadge : styles.diseasedBadge]}>
                    <Ionicons name={isHealthy ? 'checkmark-circle' : 'alert-circle'} size={24} color={isHealthy ? '#059669' : '#DC2626'} style={{ marginRight: 8 }} />
                    <Text style={styles.statusText}>{isHealthy ? 'Healthy' : 'Disease Detected'}</Text>
                </View>

                {/* Prediction */}
                <View style={styles.predictionCard}>
                    <Text style={styles.label}>DIAGNOSIS</Text>
                    <Text style={[styles.predictionText, isHealthy ? styles.healthyText : styles.diseaseText]}>
                        {prediction.class || 'Unable to diagnose'}
                    </Text>
                </View>

                {/* Confidence */}
                <View style={styles.confidenceCard}>
                    <Text style={styles.label}>CONFIDENCE LEVEL</Text>
                    <View style={styles.progressBarBg}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { 
                                    width: `${Math.min(confidencePercentage, 100)}%`,
                                    backgroundColor: getConfidenceColor(confidencePercentage)
                                }
                            ]} 
                        />
                    </View>
                    <View style={styles.confidenceRow}>
                        <Text style={[styles.confidenceText, { color: getConfidenceColor(confidencePercentage) }]}>
                            {confidencePercentage}%
                        </Text>
                        <Text style={[styles.severityText, { color: getConfidenceColor(confidencePercentage) }]}>
                            {diseaseSeverity} Confidence
                        </Text>
                    </View>
                </View>

                {/* Image Quality Score */}
                {qualityScore !== null && (
                    <View style={[styles.qualityCard]}>
                        <Text style={styles.label}>IMAGE QUALITY</Text>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${qualityScore}%`,
                                        backgroundColor: getQualityColor(qualityScore)
                                    }
                                ]} 
                            />
                        </View>
                        <View style={styles.confidenceRow}>
                            <Text style={[styles.confidenceText, { color: getQualityColor(qualityScore) }]}>
                                {qualityScore}%
                            </Text>
                            <Text style={[styles.severityText, { color: getQualityColor(qualityScore) }]}>
                                {getQualityLabel(qualityScore)}
                            </Text>
                        </View>
                        {qualityIssues.length > 0 && (
                            <View style={styles.qualityIssuesContainer}>
                                {qualityIssues.map((issue: string, i: number) => (
                                    <Text key={i} style={styles.qualityIssueText}>{issue}</Text>
                                ))}
                            </View>
                        )}
                        {qualitySuggestions.length > 0 && (
                            <View style={styles.qualitySuggestionsContainer}>
                                {qualitySuggestions.map((s: string, i: number) => (
                                    <Text key={i} style={styles.qualitySuggestionText}>{s}</Text>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Top Predictions */}
                {topPredictions.length > 1 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Predictions</Text>
                        {topPredictions.map((p: any, i: number) => (
                            <View key={i} style={[styles.topPredictionItem, i === 0 && styles.topPredictionFirst]}>
                                <View style={styles.topPredictionRank}>
                                    <Text style={styles.topPredictionRankText}>{i + 1}</Text>
                                </View>
                                <View style={styles.topPredictionInfo}>
                                    <Text style={[styles.topPredictionName, i === 0 && styles.topPredictionNameBold]}>
                                        {p.class}
                                    </Text>
                                    <View style={styles.topPredictionBarBg}>
                                        <View style={[
                                            styles.topPredictionBarFill,
                                            { 
                                                width: `${Math.min(p.confidence, 100)}%`,
                                                backgroundColor: i === 0 ? '#059669' : i === 1 ? '#F59E0B' : '#9CA3AF'
                                            }
                                        ]} />
                                    </View>
                                </View>
                                <Text style={[styles.topPredictionConf, { color: i === 0 ? '#059669' : '#6B7280' }]}>
                                    {typeof p.confidence === 'number' ? p.confidence.toFixed(1) : p.confidence}%
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Symptoms */}
                {prediction.symptoms && prediction.symptoms.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Symptoms</Text>
                        <View style={styles.symptomsContainer}>
                            {prediction.symptoms.map((s: string, i: number) => (
                                <View key={i} style={styles.symptomChip}>
                                    <Text style={styles.symptomText}>• {s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Prevention & Treatment */}
                {prediction.prevention && prediction.prevention.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Prevention and Treatment</Text>
                        {prediction.prevention.map((p: string, i: number) => (
                            <View key={i} style={styles.preventionItem}>
                                <Text style={styles.preventionNumber}>{i + 1}</Text>
                                <Text style={styles.preventionText}>{p}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
                        <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.pdfButtonText}>Download Report</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeTab')}>
                        <Text style={styles.buttonText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.secondaryButton]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.secondaryButtonText}>Analyze Another</Text>
                    </TouchableOpacity>
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
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    resultContainer: {
        padding: theme.spacing.l,
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        marginTop: -20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.borderRadius.round,
        marginBottom: theme.spacing.l,
    },
    healthyBadge: {
        backgroundColor: '#DCFCE7',
    },
    diseasedBadge: {
        backgroundColor: '#FEE2E2',
    },
    statusIcon: {
        fontSize: 24,
        marginRight: theme.spacing.s,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
        fontWeight: '600' as const,
    },
    predictionCard: {
        backgroundColor: '#F9FAFB',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    predictionText: {
        fontSize: 24,
        fontWeight: '700' as const,
        marginBottom: theme.spacing.s,
    },
    healthyText: {
        color: theme.colors.success,
    },
    diseaseText: {
        color: theme.colors.error,
    },
    confidenceCard: {
        backgroundColor: '#F9FAFB',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accent,
    },
    qualityCard: {
        backgroundColor: '#F9FAFB',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: theme.spacing.m,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    confidenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    confidenceText: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: theme.colors.primary,
    },
    severityText: {
        fontSize: 14,
        fontWeight: '600' as const,
    },
    qualityIssuesContainer: {
        marginTop: theme.spacing.s,
        paddingTop: theme.spacing.s,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    qualityIssueText: {
        fontSize: 13,
        color: '#92400E',
        marginBottom: 4,
    },
    qualitySuggestionsContainer: {
        marginTop: theme.spacing.xs,
    },
    qualitySuggestionText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 3,
    },
    section: {
        marginBottom: theme.spacing.l,
        backgroundColor: '#F9FAFB',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    symptomsContainer: {
        flexDirection: 'column',
        gap: theme.spacing.s,
    },
    symptomChip: {
        backgroundColor: '#FEF2F2',
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    symptomText: {
        fontSize: 14,
        color: '#7F1D1D',
    },
    preventionItem: {
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
        alignItems: 'flex-start',
    },
    preventionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        color: 'white',
        textAlign: 'center' as const,
        lineHeight: 28,
        fontWeight: '700' as const,
        marginRight: theme.spacing.m,
        fontSize: 14,
        overflow: 'hidden',
    },
    preventionText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
        marginTop: 2,
        lineHeight: 20,
    },
    topPredictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    topPredictionFirst: {
        backgroundColor: '#F0FDF4',
        borderColor: '#D1FAE5',
    },
    topPredictionRank: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    topPredictionRankText: {
        fontSize: 12,
        fontWeight: '700' as const,
        color: '#374151',
    },
    topPredictionInfo: {
        flex: 1,
        marginRight: 10,
    },
    topPredictionName: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 4,
    },
    topPredictionNameBold: {
        fontWeight: '600' as const,
        color: '#064E3B',
    },
    topPredictionBarBg: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    topPredictionBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    topPredictionConf: {
        fontSize: 14,
        fontWeight: '700' as const,
    },
    buttonsContainer: {
        gap: theme.spacing.m,
        marginTop: theme.spacing.l,
        marginBottom: 100,
    },
    pdfButton: {
        backgroundColor: theme.colors.secondary,
        flexDirection: 'row',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
    pdfButtonIcon: {
        fontSize: 20,
        marginRight: theme.spacing.s,
    },
    pdfButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    secondaryButton: {
        backgroundColor: theme.colors.primaryLight,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontWeight: '600' as const,
        fontSize: 16,
    },
});
