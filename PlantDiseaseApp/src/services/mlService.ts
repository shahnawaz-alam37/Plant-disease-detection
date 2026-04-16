import * as ImageManipulator from 'expo-image-manipulator';
import { 
  loadOfflineModel, 
  isOfflineModelReady, 
  predictOffline, 
  formatClassName,
  getDiseaseInfo 
} from './LocalMLService';

// =============================================================================
// MODE CONFIGURATION
// =============================================================================
// Set to 'offline' for fully offline operation, 'online' for server, 'auto' for hybrid
type InferenceMode = 'offline' | 'online' | 'auto';
let INFERENCE_MODE: InferenceMode = 'online'; // Default to online for best accuracy with enhanced server

// SERVER CONFIGURATION (used when INFERENCE_MODE is 'online' or 'auto' fails offline)
let SERVER_URL = "http://192.168.0.119:5000/predict";  // Current PC LAN IP

// Fallback URLs to try in order
const FALLBACK_URLS = [
    "http://192.168.0.119:5000/predict",
    "http://192.168.0.119:5000/predict",  // Android emulator
    "http://localhost:5000/predict",
    "http://127.0.0.1:5000/predict",
];

// Enhanced options
const USE_TTA = false; // Test-Time Augmentation (slower but more accurate)
const ENHANCED_PREPROCESSING = true;

// Track if offline model is loaded
let offlineModelLoaded = false;
let serverAvailable = false;

// =============================================================================
// CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Set inference mode
 * @param mode - 'offline' for local TFLite, 'online' for server, 'auto' for hybrid
 */
export const setInferenceMode = (mode: InferenceMode) => {
    INFERENCE_MODE = mode;
    console.log(`Inference mode set to: ${mode}`);
};

export const getInferenceMode = () => INFERENCE_MODE;

export const setServerURL = (url: string) => {
    SERVER_URL = url;
    console.log("Server URL updated to:", SERVER_URL);
};

export const getServerURL = () => SERVER_URL;

// =============================================================================
// MODEL LOADING
// =============================================================================

export const loadModel = async (): Promise<boolean> => {
    console.log("=" .repeat(60));
    console.log(`Plant Disease ML Service - Mode: ${INFERENCE_MODE}`);
    console.log("=" .repeat(60));
    
    // Always try to load offline model first
    console.log("\nLoading offline prediction engine...");
    try {
        offlineModelLoaded = await loadOfflineModel();
        if (offlineModelLoaded) {
            console.log("Offline prediction engine ready");
            console.log("   Using color-based image analysis");
        }
    } catch (e: any) {
        console.warn("Offline engine load failed:", e.message);
        offlineModelLoaded = false;
    }
    
    // Check server if needed
    if (INFERENCE_MODE === 'online' || INFERENCE_MODE === 'auto') {
        console.log("\nChecking server connectivity...");
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(SERVER_URL, {
                method: 'HEAD',
                signal: controller.signal,
            }).catch(() => ({ ok: false }));
            
            clearTimeout(timeoutId);
            serverAvailable = response.ok;
            
            if (serverAvailable) {
                console.log(`Server available at ${SERVER_URL}`);
            } else {
                console.log(`Server not reachable at ${SERVER_URL}`);
            }
        } catch (e) {
            serverAvailable = false;
            console.warn("Server check failed");
        }
    }
    
    // Summary
    console.log("\n" + "=" .repeat(60));
    console.log("ML Service Status:");
    console.log(`   • Mode: ${INFERENCE_MODE}`);
    console.log(`   • Offline Engine: ${offlineModelLoaded ? 'Ready' : 'Not loaded'}`);
    console.log(`   • Server: ${serverAvailable ? 'Available' : 'Not available'}`);
    console.log("=" .repeat(60) + "\n");
    
    return offlineModelLoaded || serverAvailable;
};

// =============================================================================
// PREDICTION FUNCTION
// =============================================================================

export const predict = async (imageUri: string): Promise<{
    class: string;
    confidence: number;
    symptoms: string[];
    prevention: string[];
    treatment?: string[];
    formattedName?: string;
    isHealthy?: boolean;
    mode?: string;
    quality?: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
    topPredictions?: Array<{ class: string; confidence: number; raw_class?: string }>;
}> => {
    console.log("\nStarting prediction...");
    console.log(`   Mode: ${INFERENCE_MODE}`);
    console.log(`   Image: ${imageUri.substring(0, 50)}...`);
    
    // In online mode, always try server first (don't rely on cached availability)
    if (INFERENCE_MODE === 'online') {
        console.log("Using ONLINE inference (Server)");
        try {
            return await predictOnServer(imageUri);
        } catch (error: any) {
            console.error("Server prediction failed:", error.message);
            // Try offline as fallback
            if (offlineModelLoaded) {
                console.log("Falling back to offline mode...");
                const result = await predictOffline(imageUri);
                return { ...result, mode: 'offline' };
            }
            throw error;
        }
    }
    
    // Determine which method to use for other modes
    const useOffline = INFERENCE_MODE === 'offline' || 
                       (INFERENCE_MODE === 'auto' && offlineModelLoaded);
    
    if (useOffline && offlineModelLoaded) {
        console.log("Using OFFLINE inference (TFLite)");
        try {
            const result = await predictOffline(imageUri);
            return {
                ...result,
                mode: 'offline'
            };
        } catch (error: any) {
            console.error("Offline prediction failed:", error.message);
            
            // Fall back to server if in auto mode
            if (INFERENCE_MODE === 'auto') {
                console.log("Falling back to server...");
                return await predictOnServer(imageUri);
            }
            throw error;
        }
    } else if (INFERENCE_MODE === 'auto') {
        console.log("Using ONLINE inference (Server)");
        return await predictOnServer(imageUri);
    } else {
        throw new Error('No inference method available. Check model/server.');
    }
};

/**
 * Server-based prediction with enhanced preprocessing
 */
const predictOnServer = async (imageUri: string): Promise<{
    class: string;
    confidence: number;
    symptoms: string[];
    prevention: string[];
    mode: string;
    quality?: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
    topPredictions?: Array<{ class: string; confidence: number }>;
}> => {
    try {
        // Build URL with TTA option
        const url = USE_TTA ? `${SERVER_URL}?tta=true` : SERVER_URL;
        console.log(`Sending image to ${url}...`);
        console.log(`Original image URI: ${imageUri}`);

        // Enhanced preprocessing - larger resize with better quality
        // Add timestamp to prevent caching issues
        const timestamp = Date.now();
        const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [
                // Resize to slightly larger to preserve details
                { resize: { width: 256, height: 256 } },
            ],
            { 
                format: ImageManipulator.SaveFormat.JPEG, 
                compress: 0.95  // Higher quality compression
            }
        );
        console.log("Image preprocessed:", manipResult.uri);

        const formData = new FormData();
        // Use unique filename with timestamp to prevent caching
        formData.append('image', {
            uri: manipResult.uri,
            name: `photo_${timestamp}.jpg`,
            type: 'image/jpeg',
        } as any);

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for TTA

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Server response status:", response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error("Server error response:", text);
            throw new Error(`Server Error: ${response.status} - ${text}`);
        }

        const result = await response.json();
        console.log("Raw server result:", JSON.stringify(result));

        // Extract confidence (use calibrated if available)
        let confidence = Number(result.confidence) || Number(result.raw_confidence) || 0;
        confidence = Math.max(0, Math.min(100, confidence));
        
        // Build normalized result with quality info
        const normalizedResult: any = {
            class: String(result.class || 'Unknown').trim(),
            confidence: confidence,
            symptoms: Array.isArray(result.symptoms) 
                ? result.symptoms.filter((s: any) => typeof s === 'string' && s.trim().length > 0) 
                : [],
            prevention: Array.isArray(result.prevention) 
                ? result.prevention.filter((p: any) => typeof p === 'string' && p.trim().length > 0) 
                : [],
            mode: 'online'
        };
        
        // Add quality information if available
        if (result.quality) {
            normalizedResult.quality = result.quality;
            
            // Log quality issues
            if (result.quality.issues && result.quality.issues.length > 0) {
                console.log(`Image quality issues: ${result.quality.issues.join(', ')}`);
            }
        }
        
        // Add top predictions if available
        if (result.top_predictions) {
            normalizedResult.topPredictions = result.top_predictions;
        }
        
        console.log("Server prediction:", normalizedResult.class, `(${normalizedResult.confidence}%)`);
        return normalizedResult;

    } catch (error: any) {
        console.error("Server prediction error:", error);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server took too long to respond');
        }
        
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
            throw new Error(`Cannot reach server at ${SERVER_URL}. Try offline mode.`);
        }
        
        throw error;
    }
};

// Re-export LocalMLService functions for convenience
export { formatClassName, getDiseaseInfo } from './LocalMLService';
