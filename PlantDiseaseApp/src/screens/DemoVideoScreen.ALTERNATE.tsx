import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// CONFIGURATION: Choose your video source
const USE_LOCAL_VIDEO = true; // Set to false to use network URL for testing

// Option 1: Local video file (recommended for production)
const LOCAL_VIDEO = require('../../assets/videos/demo-video.mp4');

// Option 2: Network URL (for testing or remote hosting)
// Replace with your video URL if you host it online
const NETWORK_VIDEO_URL = 'https://your-video-url.com/demo-video.mp4';

export default function DemoVideoScreen({ navigation }: any) {
    const { theme } = useTheme();
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsLoading(false);
            setVideoError(false);
            setPlaybackPosition(status.positionMillis);
            setPlaybackDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);

            // Auto-loop when video ends
            if (status.didJustFinish) {
                videoRef.current?.replayAsync();
            }
        } else if (status.error) {
            setIsLoading(false);
            setVideoError(true);
            console.error('Video error:', status.error);
        }
    };

    const togglePlayPause = async () => {
        if (videoError) return;
        
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
    };

    const toggleMute = async () => {
        await videoRef.current?.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
    };

    const restartVideo = async () => {
        if (videoError) {
            setVideoError(false);
            setIsLoading(true);
            await videoRef.current?.replayAsync();
        } else {
            await videoRef.current?.replayAsync();
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = playbackDuration > 0 
        ? (playbackPosition / playbackDuration) * 100 
        : 0;

    // Determine video source based on configuration
    const videoSource = USE_LOCAL_VIDEO 
        ? LOCAL_VIDEO 
        : { uri: NETWORK_VIDEO_URL };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    🎬 How It Works - Demo Video
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Video Player Container */}
            <View style={styles.videoContainer}>
                {!videoError ? (
                    <Video
                        ref={videoRef}
                        source={videoSource}
                        style={styles.video}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={isMuted}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        useNativeControls={false}
                    />
                ) : (
                    <View style={styles.errorContainer}>
                        <Ionicons name="videocam-off" size={64} color="#FF6B6B" />
                        <Text style={styles.errorTitle}>Video Not Available</Text>
                        <Text style={styles.errorMessage}>
                            Please add demo-video.mp4 to assets/videos/
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                            onPress={restartVideo}
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Loading Indicator */}
                {isLoading && !videoError && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading Demo Video...</Text>
                    </View>
                )}

                {/* Video Controls Overlay */}
                {!videoError && (
                    <View style={styles.controlsOverlay}>
                        {/* Top Info */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'transparent']}
                            style={styles.topGradient}
                        >
                            <View style={styles.videoInfo}>
                                <View style={styles.liveBadge}>
                                    <View style={styles.liveIndicator} />
                                    <Text style={styles.liveText}>DEMO</Text>
                                </View>
                                <Text style={styles.videoTitle}>
                                    AI-Powered Plant Disease Detection Journey
                                </Text>
                            </View>
                        </LinearGradient>

                        {/* Center Play/Pause Button */}
                        <TouchableOpacity
                            onPress={togglePlayPause}
                            style={styles.centerPlayButton}
                            activeOpacity={0.8}
                        >
                            <View style={styles.playButtonCircle}>
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={48}
                                    color="#FFFFFF"
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Bottom Controls */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.bottomGradient}
                        >
                            {/* Progress Bar */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${progressPercentage}%`,
                                                backgroundColor: theme.colors.primary,
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>
                                        {formatTime(playbackPosition)}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {formatTime(playbackDuration)}
                                    </Text>
                                </View>
                            </View>

                            {/* Control Buttons */}
                            <View style={styles.controlButtons}>
                                <TouchableOpacity
                                    onPress={restartVideo}
                                    style={styles.controlButton}
                                >
                                    <Ionicons name="refresh" size={28} color="#FFFFFF" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={togglePlayPause}
                                    style={[styles.controlButton, styles.mainControlButton]}
                                >
                                    <Ionicons
                                        name={isPlaying ? 'pause-circle' : 'play-circle'}
                                        size={56}
                                        color={theme.colors.primary}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={toggleMute}
                                    style={styles.controlButton}
                                >
                                    <Ionicons
                                        name={isMuted ? 'volume-mute' : 'volume-high'}
                                        size={28}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </View>

            {/* Description Section */}
            <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.descriptionHeader}>
                    <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
                        📖 About This Demo
                    </Text>
                </View>
                
                <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                    Watch how our AI technology helps farmers protect their crops! This cinematic journey shows:
                </Text>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🌾</Text>
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Real-time disease detection using AI camera
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🎯</Text>
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Instant diagnosis with 95% accuracy
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>💊</Text>
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Expert treatment recommendations
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>🌱</Text>
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Transforming farming with technology
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('Capture')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                    <Text style={styles.ctaButtonText}>
                        Try It Yourself - Scan Your Plant
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    videoContainer: {
        width: width,
        height: height * 0.5,
        backgroundColor: '#000000',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#AAAAAA',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    topGradient: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    videoInfo: {
        paddingTop: 12,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        marginRight: 6,
    },
    liveText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    videoTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    centerPlayButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -40 }, { translateY: -40 }],
    },
    playButtonCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    bottomGradient: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    controlButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainControlButton: {
        transform: [{ scale: 1.2 }],
    },
    descriptionContainer: {
        flex: 1,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
    },
    descriptionHeader: {
        marginBottom: 12,
    },
    descriptionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    featuresList: {
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    featureBullet: {
        fontSize: 20,
        marginRight: 12,
        marginTop: -2,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});
