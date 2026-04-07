import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    Alert, 
    FlatList, 
    Dimensions,
    Modal,
    ScrollView 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const MAX_IMAGES = 10;
const MIN_IMAGES = 5;

interface CapturedImage {
    id: string;
    uri: string;
    timestamp: number;
}

interface FewShotCameraProps {
    onComplete: (images: CapturedImage[]) => void;
    onCancel: () => void;
}

export default function FewShotCamera({ onComplete, onCancel }: FewShotCameraProps) {
    const { theme } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [showReview, setShowReview] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const cameraRef = useRef<any>(null);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.permissionContent}>
                    <Ionicons name="camera-outline" size={64} color="#6B7280" style={{ marginBottom: 24 }} />
                    <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
                        Camera Access Required
                    </Text>
                    <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
                        We need camera access to capture disease samples for AI training
                    </Text>
                    <TouchableOpacity 
                        style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]} 
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const takePicture = async () => {
        if (capturedImages.length >= MAX_IMAGES) {
            Alert.alert('Maximum Reached', `You can capture up to ${MAX_IMAGES} images`);
            return;
        }

        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                });
                
                const newImage: CapturedImage = {
                    id: Date.now().toString(),
                    uri: photo.uri,
                    timestamp: Date.now()
                };
                
                setCapturedImages(prev => [...prev, newImage]);
                
                // Show success feedback
                Alert.alert(
                    '✓ Image Captured', 
                    `${capturedImages.length + 1}/${MIN_IMAGES} minimum images captured`,
                    [{ text: 'OK' }]
                );
            } catch (error) {
                Alert.alert("Error", "Failed to capture image");
            }
        }
    };

    const pickFromGallery = async () => {
        if (capturedImages.length >= MAX_IMAGES) {
            Alert.alert('Maximum Reached', `You can select up to ${MAX_IMAGES} images`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [ImagePicker.MediaType.IMAGE],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newImages = result.assets.slice(0, MAX_IMAGES - capturedImages.length).map(asset => ({
                id: Date.now().toString() + Math.random(),
                uri: asset.uri,
                timestamp: Date.now()
            }));
            
            setCapturedImages(prev => [...prev, ...newImages]);
            Alert.alert('✓ Images Added', `${newImages.length} image(s) added successfully`);
        }
    };

    const removeImage = (id: string) => {
        Alert.alert(
            'Remove Image?',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setCapturedImages(prev => prev.filter(img => img.id !== id));
                    }
                }
            ]
        );
    };

    const handleReview = () => {
        if (capturedImages.length < MIN_IMAGES) {
            Alert.alert(
                'Not Enough Images',
                `Please capture at least ${MIN_IMAGES} images to proceed with training`
            );
            return;
        }
        setShowReview(true);
    };

    const handleSubmit = () => {
        setShowReview(false);
        onComplete(capturedImages);
    };

    const renderImageThumbnail = ({ item }: { item: CapturedImage }) => (
        <TouchableOpacity
            style={styles.thumbnail}
            onPress={() => setSelectedImage(item.uri)}
        >
            <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
            <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: theme.colors.error || '#EF4444' }]}
                onPress={() => removeImage(item.id)}
            >
                <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Camera View */}
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                {/* Capture Frame Guide */}
                <View style={styles.frameGuide}>
                    <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />
                </View>

                {/* Instructions Overlay */}
                <View style={styles.instructionsOverlay}>
                    <View style={styles.instructionBox}>
                        <Text style={styles.instructionText}>
                            Capture {MIN_IMAGES}-{MAX_IMAGES} clear photos of the diseased plant
                        </Text>
                        <Text style={styles.instructionSubtext}>
                            Different angles • Good lighting • Focus on symptoms
                        </Text>
                    </View>
                </View>
            </CameraView>

            {/* Image Counter */}
            <View style={[styles.counterContainer, { backgroundColor: theme.colors.background }]}>
                <View style={styles.counterContent}>
                    <Text style={[styles.counterNumber, { color: theme.colors.primary }]}>
                        {capturedImages.length}
                    </Text>
                    <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>
                        / {MAX_IMAGES} images
                    </Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View 
                        style={[
                            styles.progressBar, 
                            { 
                                backgroundColor: capturedImages.length >= MIN_IMAGES 
                                    ? theme.colors.success 
                                    : theme.colors.primary,
                                width: `${(capturedImages.length / MAX_IMAGES) * 100}%`
                            }
                        ]} 
                    />
                </View>
                {capturedImages.length >= MIN_IMAGES && (
                    <Text style={[styles.readyText, { color: theme.colors.success }]}>
                        ✓ Ready to submit for training
                    </Text>
                )}
            </View>

            {/* Thumbnail Gallery */}
            {capturedImages.length > 0 && (
                <View style={[styles.thumbnailContainer, { backgroundColor: theme.colors.background }]}>
                    <FlatList
                        horizontal
                        data={capturedImages}
                        renderItem={renderImageThumbnail}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailList}
                    />
                </View>
            )}

            {/* Camera Controls */}
            <View style={[styles.controlsContainer, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                    <Text style={styles.secondaryButtonIcon}>✕</Text>
                    <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.captureButton, { borderColor: theme.colors.primary }]}
                    onPress={takePicture}
                >
                    <View style={[styles.captureInner, { backgroundColor: theme.colors.primary }]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
                    <Ionicons name="images-outline" size={28} color="#FFFFFF" />
                    <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                        Gallery
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Review Button */}
            {capturedImages.length >= MIN_IMAGES && (
                <TouchableOpacity
                    style={[styles.reviewButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleReview}
                >
                    <Text style={styles.reviewButtonText}>
                        Review & Submit ({capturedImages.length} images)
                    </Text>
                </TouchableOpacity>
            )}

            {/* Image Preview Modal */}
            <Modal
                visible={selectedImage !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalClose}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image 
                            source={{ uri: selectedImage }} 
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

            {/* Review Modal */}
            <Modal
                visible={showReview}
                animationType="slide"
                onRequestClose={() => setShowReview(false)}
            >
                <View style={[styles.reviewModal, { backgroundColor: theme.colors.background }]}>
                    {/* Header */}
                    <View style={[styles.reviewHeader, { backgroundColor: theme.colors.primary }]}>
                        <TouchableOpacity onPress={() => setShowReview(false)}>
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.reviewTitle}>Review Images</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    {/* Review Content */}
                    <ScrollView style={styles.reviewContent}>
                        <View style={styles.reviewInfo}>
                            <Text style={[styles.reviewInfoTitle, { color: theme.colors.text }]}>
                                ✓ {capturedImages.length} Images Ready
                            </Text>
                            <Text style={[styles.reviewInfoText, { color: theme.colors.textSecondary }]}>
                                Review your images before submitting for AI training. 
                                Make sure each image clearly shows the disease symptoms.
                            </Text>
                        </View>

                        {/* Image Grid */}
                        <View style={styles.reviewGrid}>
                            {capturedImages.map((image, index) => (
                                <View key={image.id} style={styles.reviewImageContainer}>
                                    <Image 
                                        source={{ uri: image.uri }} 
                                        style={styles.reviewImage} 
                                    />
                                    <Text style={[styles.reviewImageLabel, { color: theme.colors.text }]}>
                                        Image {index + 1}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.reviewRemoveButton, { backgroundColor: theme.colors.error || '#EF4444' }]}
                                        onPress={() => {
                                            removeImage(image.id);
                                            if (capturedImages.length - 1 < MIN_IMAGES) {
                                                setShowReview(false);
                                            }
                                        }}
                                    >
                                        <Text style={styles.reviewRemoveText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* Quality Checklist */}
                        <View style={[styles.checklistContainer, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                                ✓ Quality Checklist
                            </Text>
                            <View style={styles.checklistItem}>
                                <Text style={styles.checklistIcon}>✓</Text>
                                <Text style={[styles.checklistText, { color: theme.colors.textSecondary }]}>
                                    Images show clear disease symptoms
                                </Text>
                            </View>
                            <View style={styles.checklistItem}>
                                <Text style={styles.checklistIcon}>✓</Text>
                                <Text style={[styles.checklistText, { color: theme.colors.textSecondary }]}>
                                    Good lighting and focus
                                </Text>
                            </View>
                            <View style={styles.checklistItem}>
                                <Text style={styles.checklistIcon}>✓</Text>
                                <Text style={[styles.checklistText, { color: theme.colors.textSecondary }]}>
                                    Multiple angles captured
                                </Text>
                            </View>
                            <View style={styles.checklistItem}>
                                <Text style={styles.checklistIcon}>✓</Text>
                                <Text style={[styles.checklistText, { color: theme.colors.textSecondary }]}>
                                    Minimum {MIN_IMAGES} images provided
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <View style={[styles.reviewFooter, { backgroundColor: theme.colors.background }]}>
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSubmit}
                        >
                            <Ionicons name="arrow-forward-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 12 }} />
                            <Text style={styles.submitButtonText}>
                                Submit for Training
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 32,
    },
    permissionIcon: {
        fontSize: 72,
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 15,
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    permissionButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    camera: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameGuide: {
        width: width * 0.8,
        height: width * 0.8,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    instructionsOverlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    instructionBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
    },
    instructionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 6,
    },
    instructionSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        textAlign: 'center',
    },
    counterContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    counterContent: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 8,
    },
    counterNumber: {
        fontSize: 32,
        fontWeight: '800',
    },
    counterLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    readyText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
    thumbnailContainer: {
        paddingVertical: 12,
    },
    thumbnailList: {
        paddingHorizontal: 16,
    },
    thumbnail: {
        marginHorizontal: 6,
        position: 'relative',
    },
    thumbnailImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 24,
    },
    captureButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    secondaryButton: {
        alignItems: 'center',
        width: 70,
    },
    secondaryButtonIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    secondaryButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reviewButton: {
        marginHorizontal: 24,
        marginBottom: 16,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modalCloseText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    fullImage: {
        width: width,
        height: height,
    },
    reviewModal: {
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 50,
    },
    backButton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    reviewTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    reviewContent: {
        flex: 1,
    },
    reviewInfo: {
        padding: 24,
        alignItems: 'center',
    },
    reviewInfoTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    reviewInfoText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    reviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'space-between',
    },
    reviewImageContainer: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    reviewImage: {
        width: '100%',
        height: (width - 48) / 2,
        borderRadius: 12,
    },
    reviewImageLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 6,
    },
    reviewRemoveButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    reviewRemoveText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    checklistContainer: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
    },
    checklistTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    checklistIcon: {
        fontSize: 20,
        marginRight: 12,
        color: '#10B981',
    },
    checklistText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    reviewFooter: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 24,
    },
    submitButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
