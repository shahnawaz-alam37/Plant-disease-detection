import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { predict } from '../services/mlService';
import { useStore } from '../store';

const { width, height } = Dimensions.get('window');

export default function CaptureScreen() {
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<any>(null);
    const setLastPrediction = useStore((state) => state.setLastPrediction);
    const addToHistory = useStore((state) => state.addToHistory);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!imageUri) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(focusAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(focusAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [imageUri]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContent}>
                    <Ionicons name="camera-outline" size={64} color="#6B7280" style={{ marginBottom: 24 }} />
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        We need access to your camera to analyze plant leaves and detect diseases.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setImageUri(photo.uri);
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    };

    const pickImage = async () => {
        try {
            // Request gallery permission first
            if (galleryPermission && !galleryPermission.granted) {
                const { granted } = await requestGalleryPermission();
                if (!granted) {
                    Alert.alert(
                        "Gallery Permission Required",
                        "Please allow access to your photo library to upload plant images."
                    );
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log("Gallery image selected:", result.assets[0].uri);
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Gallery picker error:", error);
            Alert.alert("Error", "Failed to pick image from gallery. Please try again.");
        }
    };

    const analyzeImage = async () => {
        if (!imageUri) return;

        // Capture the current imageUri to ensure we use the same image throughout
        const currentImageUri = imageUri;
        
        setLoading(true);
        try {
            console.log("=" .repeat(50));
            console.log("STARTING ANALYSIS");
            console.log("=" .repeat(50));
            console.log("Image URI:", currentImageUri);
            
            const result = await predict(currentImageUri);
            console.log("Raw prediction result:", JSON.stringify(result));

            // Server returns confidence as 0-100, ensure it's properly formatted
            let confidence = typeof result.confidence === 'number' ? result.confidence : 0;
            
            // If confidence is between 0-1 (normalized), convert to percentage
            if (confidence > 0 && confidence <= 1) {
                confidence = confidence * 100;
            }
            
            // Clamp confidence between 0-100
            confidence = Math.max(0, Math.min(100, confidence));
            
            console.log("Processed confidence:", confidence);

            const prediction = {
                id: Date.now().toString(),
                imageUri: currentImageUri, // Use the captured URI
                class: String(result.class || 'Unknown').trim(),
                confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
                date: new Date().toISOString(),
                symptoms: Array.isArray(result.symptoms) ? result.symptoms.filter(s => s && s.trim()) : [],
                prevention: Array.isArray(result.prevention) ? result.prevention.filter(p => p && p.trim()) : [],
                quality: result.quality || null,
                topPredictions: result.topPredictions || null
            };

            console.log("Final prediction:", prediction.class, `(${prediction.confidence}%)`);
            console.log("=" .repeat(50));
            
            setLastPrediction(prediction);
            addToHistory(prediction);

            // Navigate to Result screen within the DetectStack
            navigation.navigate('Result', {
                imageUri: currentImageUri,
                prediction: prediction
            });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Analysis error:", errorMsg);
            
            let helpText = "\n\nTroubleshooting:\n";
            if (errorMsg.includes('Network request failed') || errorMsg.includes('Cannot reach server')) {
                helpText += "1. Ensure Flask server is running (python server.py)\n";
                helpText += "2. Check Windows Firewall allows port 5000\n";
                helpText += "3. Device and PC on same WiFi network\n";
                helpText += "4. Server URL is correct (192.168.0.6:5000)";
            } else {
                helpText += "1. Use a clear, well-lit photo of a plant leaf\n";
                helpText += "2. Make sure the leaf fills most of the frame\n";
                helpText += "3. Try retaking the photo with better lighting";
            }
            
            Alert.alert("Analysis Failed", errorMsg + helpText);
        } finally {
            setLoading(false);
        }
    };

    const focusScale = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    const focusOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0],
    });

    return (
        <View style={styles.container}>
            {imageUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.preview} />
                    <TouchableOpacity style={styles.retakeButton} onPress={() => setImageUri(null)}>
                        <Text style={styles.retakeText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.previewInfo}>
                        <Text style={styles.previewInfoText}>Image ready for analysis</Text>
                    </View>
                </View>
            ) : (
                <CameraView style={styles.camera} ref={cameraRef} facing="back" />
            )}

            {/* Overlays - positioned absolutely outside CameraView */}
            {!imageUri && (
                <>
                    {/* Focus indicator animation */}
                    <Animated.View
                        style={[
                            styles.focusRing,
                            {
                                transform: [{ scale: focusAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.5],
                                }) }],
                                opacity: focusAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 0],
                                }),
                            },
                        ]}
                    />

                    {/* Grid overlay */}
                    <View style={styles.gridOverlay}>
                        <View style={styles.gridColumn} />
                        <View style={styles.gridColumn} />
                        <View style={styles.gridRow} />
                        <View style={styles.gridRow} />
                    </View>

                    {/* Tips text */}
                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsText}>Center the leaf in the frame</Text>
                    </View>
                </>
            )}

            {/* Camera controls - positioned at bottom */}
            {!imageUri && (
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Ionicons name="images-outline" size={28} color="white" />
                        <Text style={styles.galleryLabel}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>

                    <View style={styles.spacer} />
                </View>
            )}

            {/* Footer with analyze button */}
            <View style={styles.footer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Analyzing image...</Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            style={[styles.analyzeButton, !imageUri && styles.disabledButton]}
                            onPress={analyzeImage}
                            disabled={!imageUri}
                        >
                            <Ionicons name="search-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.analyzeText}>DETECT DISEASE</Text>
                        </TouchableOpacity>
                        {!imageUri && (
                            <Text style={styles.footerHint}>Take or upload a photo to begin</Text>
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.l,
    },
    permissionTitle: {
        ...theme.typography.h2,
        color: 'white',
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    permissionText: {
        ...theme.typography.body,
        color: '#ccc',
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        ...theme.shadows.large,
    },
    permissionButtonText: {
        ...theme.typography.button,
        color: 'white',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    focusRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        top: '50%',
        left: '50%',
        marginTop: -50,
        marginLeft: -50,
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-around',
        alignItems: 'center',
        opacity: 0.2,
    },
    gridColumn: {
        position: 'absolute',
        width: 1,
        height: '100%',
        backgroundColor: 'white',
        left: '33.33%',
    },
    gridRow: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: 'white',
        top: '33.33%',
    },
    tipsContainer: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    tipsText: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.round,
        fontSize: 14,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.l,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    galleryButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 30,
    },
    galleryText: {
        fontSize: 28,
    },
    galleryLabel: {
        color: 'white',
        fontSize: 11,
        marginTop: 2,
        textAlign: 'center',
    },
    spacer: {
        width: 60,
    },
    previewContainer: {
        flex: 1,
        maxHeight: height * 0.6,
        position: 'relative',
        backgroundColor: 'black',
    },
    preview: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    previewInfo: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    previewInfoText: {
        backgroundColor: 'rgba(5, 150, 105, 0.8)',
        color: 'white',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.round,
        fontSize: 14,
        fontWeight: '600',
    },
    retakeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    retakeText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.l,
        paddingTop: theme.spacing.m,
        paddingBottom: 90, // Space for bottom tab bar
        borderTopLeftRadius: theme.borderRadius.l,
        borderTopRightRadius: theme.borderRadius.l,
        ...theme.shadows.large,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.l,
    },
    loadingText: {
        marginTop: theme.spacing.m,
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    analyzeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
    disabledButton: {
        backgroundColor: theme.colors.gray || '#D1D5DB',
        opacity: 0.6,
    },
    analyzeIcon: {
        fontSize: 20,
        marginRight: theme.spacing.s,
    },
    analyzeText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    footerHint: {
        textAlign: 'center',
        marginTop: theme.spacing.s,
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
});
