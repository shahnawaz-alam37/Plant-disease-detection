"""
Plant Disease Detection Server - OFFLINE VERSION (ENHANCED)
Uses locally trained TensorFlow model with advanced preprocessing
Includes image quality validation and confidence calibration
"""

import flask
from flask import request, jsonify
from flask_cors import CORS
import numpy as np
import os
import json
from io import BytesIO
from PIL import Image, ImageFilter, ImageEnhance, ImageStat
import tensorflow as tf
import cv2
import warnings
warnings.filterwarnings('ignore')

app = flask.Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = "plant_disease_model_plantvillage.keras"
CLASS_NAMES_PATH = "class_names_plantvillage.json"
IMAGE_SIZE = (224, 224)

# Image quality - ideal ranges for graduated scoring
# Brightness: ideal range 100-170 on 0-255 scale
IDEAL_BRIGHTNESS_LOW = 100
IDEAL_BRIGHTNESS_HIGH = 170
# Contrast: ideal is 50+ standard deviation
IDEAL_CONTRAST = 55
# Sharpness: ideal is 500+ Laplacian variance (phone cameras typically 200-2000)
IDEAL_SHARPNESS = 500
# Green content: ideal is 25%+ for a well-framed leaf photo
IDEAL_GREEN_CONTENT = 25
# Resolution: ideal is 400+ pixels on shortest side
IDEAL_RESOLUTION = 400
MIN_IMAGE_SIZE = 50  # Absolute minimum

# Disease information database (symptoms and prevention for each class)
DISEASE_INFO = {
    "Apple___Apple_scab": {
        "symptoms": ["Olive-green or brown spots on leaves", "Velvety texture on leaf spots", "Leaves may curl and drop early", "Dark scabby lesions on fruit"],
        "prevention": ["Apply fungicides in early spring", "Remove fallen leaves in autumn", "Prune trees for better air circulation", "Plant resistant apple varieties"]
    },
    "Apple___Black_rot": {
        "symptoms": ["Brown rotting spots on fruit", "Frogeye leaf spots with purple border", "Cankers on branches", "Mummified fruit remains on tree"],
        "prevention": ["Remove infected fruit and branches", "Apply fungicide during growing season", "Maintain good tree hygiene", "Ensure proper pruning practices"]
    },
    "Apple___Cedar_apple_rust": {
        "symptoms": ["Bright orange-yellow spots on leaves", "Raised spots with orange spores", "Small orange cups under leaves", "Premature leaf drop"],
        "prevention": ["Remove nearby cedar trees if possible", "Apply fungicide in spring", "Plant rust-resistant varieties", "Rake and destroy fallen leaves"]
    },
    "Apple___healthy": {
        "symptoms": ["No disease symptoms present", "Leaves are green and healthy", "Normal growth pattern", "Fruit developing normally"],
        "prevention": ["Continue regular maintenance", "Monitor for early signs of disease", "Maintain proper watering schedule", "Apply preventive fungicides seasonally"]
    },
    "Blueberry___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy green foliage", "Normal berry development", "Strong branch structure"],
        "prevention": ["Maintain acidic soil pH", "Provide adequate mulching", "Ensure proper drainage", "Regular pruning for plant health"]
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "symptoms": ["White powdery coating on leaves", "Curled or distorted leaves", "Stunted new growth", "Premature leaf drop"],
        "prevention": ["Apply fungicide at first sign", "Improve air circulation", "Avoid overhead watering", "Remove infected plant parts"]
    },
    "Cherry_(including_sour)___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy dark green leaves", "Normal fruit development", "Strong branch growth"],
        "prevention": ["Regular monitoring for pests", "Maintain proper watering", "Annual pruning recommended", "Apply dormant spray in winter"]
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "symptoms": ["Rectangular gray-tan lesions", "Lesions parallel to leaf veins", "Leaves may turn yellow and die", "Reduced yield potential"],
        "prevention": ["Rotate crops yearly", "Plant resistant hybrids", "Apply foliar fungicides", "Remove crop residue after harvest"]
    },
    "Corn_(maize)___Common_rust_": {
        "symptoms": ["Small reddish-brown pustules on leaves", "Pustules on both leaf surfaces", "Severe cases cause leaf death", "Reduced photosynthesis"],
        "prevention": ["Plant rust-resistant varieties", "Apply fungicides if severe", "Early planting helps avoid", "Monitor fields regularly"]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "symptoms": ["Long elliptical gray-green lesions", "Lesions 1-6 inches long", "Lesions may merge together", "Lower leaves affected first"],
        "prevention": ["Use resistant hybrids", "Rotate with non-host crops", "Apply fungicides early", "Tillage to bury residue"]
    },
    "Corn_(maize)___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy green leaves", "Normal stalk development", "Good ear formation"],
        "prevention": ["Maintain soil fertility", "Proper plant spacing", "Adequate irrigation", "Regular scouting for pests"]
    },
    "Grape___Black_rot": {
        "symptoms": ["Brown circular spots on leaves", "Black shriveled mummified fruit", "Tan spots with dark borders", "Fruit rot occurs rapidly"],
        "prevention": ["Remove mummified fruit", "Apply fungicides early season", "Prune for air circulation", "Remove infected plant materials"]
    },
    "Grape___Esca_(Black_Measles)": {
        "symptoms": ["Tiger-stripe pattern on leaves", "Interveinal discoloration", "Dark spots on berries", "Wood decay inside trunk"],
        "prevention": ["Protect pruning wounds", "Remove infected vines", "Avoid stress to plants", "Practice good vineyard sanitation"]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "symptoms": ["Angular reddish-brown spots", "Yellow halo around spots", "Spots may merge together", "Premature leaf drop"],
        "prevention": ["Apply copper-based fungicides", "Improve air circulation", "Remove fallen leaves", "Avoid overhead irrigation"]
    },
    "Grape___healthy": {
        "symptoms": ["No disease symptoms present", "Vibrant green foliage", "Normal grape cluster development", "Strong vine growth"],
        "prevention": ["Regular pruning schedule", "Balanced fertilization", "Monitor for pests", "Maintain good drainage"]
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "symptoms": ["Yellowing of leaf veins", "Lopsided bitter fruit", "Small misshapen fruit", "Overall tree decline"],
        "prevention": ["Control Asian citrus psyllid", "Remove infected trees", "Plant certified disease-free trees", "Regular insecticide applications"]
    },
    "Peach___Bacterial_spot": {
        "symptoms": ["Small dark spots on leaves", "Spots may fall out creating holes", "Cracked and spotted fruit", "Twig cankers may form"],
        "prevention": ["Plant resistant varieties", "Apply copper sprays", "Avoid overhead irrigation", "Remove infected branches"]
    },
    "Peach___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy green leaves", "Normal fruit development", "Strong branch structure"],
        "prevention": ["Annual dormant spraying", "Proper pruning techniques", "Adequate fertilization", "Regular pest monitoring"]
    },
    "Pepper,_bell___Bacterial_spot": {
        "symptoms": ["Small water-soaked spots on leaves", "Spots turn brown with yellow halo", "Raised scab-like spots on fruit", "Leaf drop in severe cases"],
        "prevention": ["Use disease-free seeds", "Rotate crops 2-3 years", "Apply copper-based sprays", "Avoid working with wet plants"]
    },
    "Pepper,_bell___healthy": {
        "symptoms": ["No disease symptoms present", "Dark green healthy leaves", "Normal fruit development", "Strong plant structure"],
        "prevention": ["Maintain proper spacing", "Balanced watering schedule", "Regular fertilization", "Monitor for pest insects"]
    },
    "Potato___Early_blight": {
        "symptoms": ["Brown spots with concentric rings", "Target-like appearance on leaves", "Lower leaves affected first", "Lesions may have yellow halo"],
        "prevention": ["Rotate crops 2-3 years", "Apply fungicides preventively", "Remove plant debris", "Plant certified disease-free seed"]
    },
    "Potato___Late_blight": {
        "symptoms": ["Water-soaked spots on leaves", "White fuzzy growth underneath", "Rapid plant collapse possible", "Brown firm rot on tubers"],
        "prevention": ["Plant resistant varieties", "Apply fungicides regularly", "Destroy infected plants immediately", "Improve air circulation"]
    },
    "Potato___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy dark green foliage", "Normal tuber development", "Strong stem growth"],
        "prevention": ["Use certified seed potatoes", "Proper hilling technique", "Adequate water management", "Regular field scouting"]
    },
    "Raspberry___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy green canes", "Normal fruit development", "Strong root system"],
        "prevention": ["Annual cane pruning", "Good air circulation", "Proper watering practices", "Mulch around plants"]
    },
    "Soybean___healthy": {
        "symptoms": ["No disease symptoms present", "Green healthy trifoliate leaves", "Normal pod development", "Good plant vigor"],
        "prevention": ["Crop rotation practices", "Use treated seeds", "Scout fields regularly", "Manage soil fertility"]
    },
    "Squash___Powdery_mildew": {
        "symptoms": ["White powdery spots on leaves", "Spots spread across leaf surface", "Leaves may yellow and die", "Reduced fruit production"],
        "prevention": ["Plant resistant varieties", "Apply fungicides early", "Improve air circulation", "Avoid overhead watering"]
    },
    "Strawberry___Leaf_scorch": {
        "symptoms": ["Purple spots on leaves", "Spots develop tan centers", "Leaf edges appear burned", "Severe cases cause defoliation"],
        "prevention": ["Remove infected leaves", "Apply fungicides preventively", "Avoid overhead irrigation", "Maintain proper plant spacing"]
    },
    "Strawberry___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy green trifoliate leaves", "Normal fruit production", "Vigorous runner growth"],
        "prevention": ["Renew beds regularly", "Proper mulching practices", "Balanced fertilization", "Monitor for pests"]
    },
    "Tomato___Bacterial_spot": {
        "symptoms": ["Small dark greasy spots on leaves", "Spots may have yellow halo", "Raised scabby spots on fruit", "Leaf drop in wet weather"],
        "prevention": ["Use disease-free transplants", "Apply copper fungicides", "Rotate crops 2-3 years", "Avoid overhead watering"]
    },
    "Tomato___Early_blight": {
        "symptoms": ["Brown spots with target rings", "Lower leaves affected first", "Stem lesions possible", "Fruit may develop dark spots"],
        "prevention": ["Rotate crops yearly", "Mulch around plants", "Apply fungicides preventively", "Remove lower leaves"]
    },
    "Tomato___Late_blight": {
        "symptoms": ["Water-soaked gray-green spots", "White mold on leaf undersides", "Rapid plant death possible", "Brown firm rot on fruit"],
        "prevention": ["Plant resistant varieties", "Apply fungicides regularly", "Remove infected plants immediately", "Avoid overhead irrigation"]
    },
    "Tomato___Leaf_Mold": {
        "symptoms": ["Yellow spots on upper leaf surface", "Olive-green mold underneath", "Leaves curl and die", "Usually in greenhouse conditions"],
        "prevention": ["Improve ventilation", "Reduce humidity levels", "Space plants properly", "Apply fungicides as needed"]
    },
    "Tomato___Septoria_leaf_spot": {
        "symptoms": ["Small circular spots with dark borders", "Gray centers with tiny black dots", "Lower leaves affected first", "Severe defoliation possible"],
        "prevention": ["Remove infected debris", "Apply fungicides early", "Rotate crops 3 years", "Stake plants for airflow"]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "symptoms": ["Tiny yellow speckling on leaves", "Fine webbing on undersides", "Leaves turn bronze and dry", "Severe infestations kill plants"],
        "prevention": ["Spray with water to dislodge", "Apply miticides if severe", "Encourage natural predators", "Avoid dusty conditions"]
    },
    "Tomato___Target_Spot": {
        "symptoms": ["Brown spots with concentric rings", "Spots on leaves stems and fruit", "Lesions may crack open", "Defoliation in humid conditions"],
        "prevention": ["Improve air circulation", "Apply fungicides preventively", "Remove plant debris", "Rotate crops regularly"]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "symptoms": ["Leaves curl upward and yellow", "Plant growth is stunted", "Flower drop occurs", "Little to no fruit production"],
        "prevention": ["Control whitefly vectors", "Use resistant varieties", "Remove infected plants", "Apply insecticides to control pests"]
    },
    "Tomato___Tomato_mosaic_virus": {
        "symptoms": ["Mottled light and dark green leaves", "Distorted leaf growth", "Stunted plant development", "Reduced fruit yield and quality"],
        "prevention": ["Use virus-free seed", "Disinfect tools regularly", "Control aphid vectors", "Remove infected plants promptly"]
    },
    "Tomato___healthy": {
        "symptoms": ["No disease symptoms present", "Healthy dark green leaves", "Normal fruit development", "Strong plant structure"],
        "prevention": ["Regular watering schedule", "Balanced fertilization", "Proper staking and pruning", "Monitor for early disease signs"]
    }
}

# Load model and class names at startup
print("=" * 80)
print("🌿 PLANT DISEASE DETECTION SERVER - ENHANCED OFFLINE MODE")
print("=" * 80)

model = None
class_names = []

def load_model():
    global model, class_names
    
    print("\n📦 Loading TensorFlow model...")
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✅ Model loaded: {MODEL_PATH}")
    
    # Load class names
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
    elif os.path.exists('class_names.txt'):
        with open('class_names.txt', 'r') as f:
            class_names = [line.strip() for line in f if line.strip()]
    else:
        raise FileNotFoundError("Class names file not found")
    
    print(f"✅ Loaded {len(class_names)} disease classes")
    print("\n🚀 Server ready for enhanced offline inference!")
    print("=" * 80)

# Load model on startup
load_model()

# ============================================================================
# IMAGE QUALITY VALIDATION
# ============================================================================

def calculate_brightness(image):
    """Calculate average brightness of image (0-255)."""
    grayscale = image.convert('L')
    stat = ImageStat.Stat(grayscale)
    return float(stat.mean[0])

def calculate_contrast(image):
    """Calculate contrast as standard deviation of pixel values."""
    grayscale = image.convert('L')
    stat = ImageStat.Stat(grayscale)
    return float(stat.stddev[0])

def calculate_sharpness(image):
    """Calculate sharpness using Laplacian variance method."""
    # Convert to numpy array and grayscale
    img_array = np.array(image.convert('L'))
    # Calculate Laplacian
    laplacian = cv2.Laplacian(img_array, cv2.CV_64F)
    # Variance of Laplacian indicates sharpness
    return float(laplacian.var())

def detect_green_content(image):
    """Detect percentage of green (plant) content in image."""
    img_array = np.array(image)
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    # Green detection: G > R and G > B
    green_mask = (g > r * 0.9) & (g > b * 0.9) & (g > 50)
    green_percentage = np.sum(green_mask) / green_mask.size * 100
    return float(green_percentage)

def validate_image_quality(image):
    """
    Graduated image quality validation that produces realistic scores.
    Each metric contributes a weighted sub-score (0-100) based on distance from ideal.
    Returns: (is_valid, quality_score, issues_list, suggestions_list)
    """
    issues = []
    suggestions = []
    sub_scores = {}
    
    # --- 1. Resolution score (weight: 15%) ---
    width, height = image.size
    min_dim = min(width, height)
    if min_dim < MIN_IMAGE_SIZE:
        sub_scores['resolution'] = 10
        issues.append("Image resolution too low")
        suggestions.append("Use a higher resolution image (minimum 200x200 pixels)")
    elif min_dim >= IDEAL_RESOLUTION:
        sub_scores['resolution'] = 100
    else:
        # Linear scale from MIN_IMAGE_SIZE to IDEAL_RESOLUTION
        sub_scores['resolution'] = 10 + 90 * (min_dim - MIN_IMAGE_SIZE) / (IDEAL_RESOLUTION - MIN_IMAGE_SIZE)
        if min_dim < 200:
            issues.append("Low resolution image")
            suggestions.append("Use a higher resolution image for better accuracy")
    
    # --- 2. Brightness score (weight: 25%) ---
    brightness = calculate_brightness(image)
    if IDEAL_BRIGHTNESS_LOW <= brightness <= IDEAL_BRIGHTNESS_HIGH:
        sub_scores['brightness'] = 100
    elif brightness < IDEAL_BRIGHTNESS_LOW:
        # How far below ideal? Scale: 0 brightness = 0 score, IDEAL_LOW = 100
        sub_scores['brightness'] = max(0, (brightness / IDEAL_BRIGHTNESS_LOW) * 100)
        if brightness < 60:
            issues.append("Image is too dark")
            suggestions.append("Take photo in better lighting conditions")
        elif brightness < IDEAL_BRIGHTNESS_LOW:
            issues.append("Image is somewhat dark")
            suggestions.append("Try to capture in brighter ambient light")
    else:
        # How far above ideal? Scale: 255 brightness = 20 score, IDEAL_HIGH = 100
        overshoot = (brightness - IDEAL_BRIGHTNESS_HIGH) / (255 - IDEAL_BRIGHTNESS_HIGH)
        sub_scores['brightness'] = max(20, 100 - overshoot * 80)
        if brightness > 220:
            issues.append("Image is overexposed")
            suggestions.append("Reduce lighting or avoid direct sunlight on the leaf")
        elif brightness > IDEAL_BRIGHTNESS_HIGH:
            issues.append("Image is slightly bright")
            suggestions.append("Slight shade would improve photo quality")
    
    # --- 3. Contrast score (weight: 20%) ---
    contrast = calculate_contrast(image)
    if contrast >= IDEAL_CONTRAST:
        sub_scores['contrast'] = 100
    else:
        # Scale: 0 contrast = 0 score, IDEAL = 100
        sub_scores['contrast'] = max(0, (contrast / IDEAL_CONTRAST) * 100)
        if contrast < 30:
            issues.append("Very low contrast - image looks flat")
            suggestions.append("Ensure clear distinction between leaf and background")
        elif contrast < IDEAL_CONTRAST:
            issues.append("Moderate contrast")
            suggestions.append("Place leaf against a contrasting background for better results")
    
    # --- 4. Sharpness score (weight: 25%) ---
    sharpness = calculate_sharpness(image)
    if sharpness >= IDEAL_SHARPNESS:
        sub_scores['sharpness'] = 100
    elif sharpness < 50:
        sub_scores['sharpness'] = 10
        issues.append("Image is very blurry")
        suggestions.append("Hold camera steady, tap to focus on the leaf")
    else:
        # Logarithmic scale for sharpness (perception is logarithmic)
        import math
        log_sharpness = math.log(max(sharpness, 1))
        log_ideal = math.log(IDEAL_SHARPNESS)
        log_min = math.log(50)
        sub_scores['sharpness'] = 10 + 90 * (log_sharpness - log_min) / (log_ideal - log_min)
        if sharpness < 150:
            issues.append("Image appears blurry")
            suggestions.append("Hold camera steady and ensure focus is on the leaf")
        elif sharpness < IDEAL_SHARPNESS:
            issues.append("Image could be sharper")
            suggestions.append("Try tapping to focus before capturing")
    
    # --- 5. Green/plant content score (weight: 15%) ---
    green_content = detect_green_content(image)
    if green_content >= IDEAL_GREEN_CONTENT:
        sub_scores['green_content'] = 100
    elif green_content < 5:
        sub_scores['green_content'] = 15
        issues.append("Very little plant material detected")
        suggestions.append("Ensure the leaf fills most of the frame")
    else:
        # Linear scale
        sub_scores['green_content'] = 15 + 85 * (green_content / IDEAL_GREEN_CONTENT)
        if green_content < 12:
            issues.append("Limited plant material in frame")
            suggestions.append("Move camera closer so the leaf fills more of the image")
        else:
            issues.append("Moderate plant coverage")
            suggestions.append("Try to position leaf more centrally in frame")
    
    # --- Weighted average ---
    weights = {
        'resolution': 0.15,
        'brightness': 0.25,
        'contrast': 0.20,
        'sharpness': 0.25,
        'green_content': 0.15
    }
    
    quality_score = sum(sub_scores[k] * weights[k] for k in weights)
    quality_score = max(0, min(100, round(quality_score)))
    
    is_valid = quality_score >= 35  # Minimum usable threshold
    
    print(f"   📊 Quality breakdown: brightness={sub_scores.get('brightness',0):.0f}, "
          f"contrast={sub_scores.get('contrast',0):.0f}, sharpness={sub_scores.get('sharpness',0):.0f}, "
          f"green={sub_scores.get('green_content',0):.0f}, resolution={sub_scores.get('resolution',0):.0f}")
    
    return is_valid, quality_score, issues, suggestions

# ============================================================================
# ENHANCED IMAGE PREPROCESSING
# ============================================================================

def normalize_lighting(image):
    """Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for lighting normalization."""
    # Convert to LAB color space
    img_array = np.array(image)
    lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:,:,0] = clahe.apply(lab[:,:,0])
    
    # Convert back to RGB
    normalized = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return Image.fromarray(normalized)

def enhance_image(image):
    """Apply subtle enhancements to improve detection."""
    # Slight sharpness enhancement
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.2)  # Slight sharpening
    
    # Slight color enhancement
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.1)  # Subtle color boost
    
    return image

def smart_crop_and_resize(image, target_size):
    """
    Smart center crop that maintains aspect ratio and focuses on center.
    """
    width, height = image.size
    
    # Calculate crop dimensions to maintain square aspect
    if width > height:
        left = (width - height) // 2
        top = 0
        right = left + height
        bottom = height
    else:
        left = 0
        top = (height - width) // 2
        right = width
        bottom = top + width
    
    # Center crop
    cropped = image.crop((left, top, right, bottom))
    
    # High-quality resize using LANCZOS
    resized = cropped.resize(target_size, Image.LANCZOS)
    
    return resized

def preprocess_image(image_data, apply_enhancements=True):
    """
    Enhanced preprocessing pipeline for improved prediction accuracy.
    """
    # Open image from bytes
    image = Image.open(BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply enhancements if enabled
    if apply_enhancements:
        # Normalize lighting
        image = normalize_lighting(image)
        
        # Apply subtle enhancements
        image = enhance_image(image)
    
    # Smart crop and resize
    image = smart_crop_and_resize(image, IMAGE_SIZE)
    
    # Convert to numpy array and normalize to [0, 1]
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def get_multi_crop_predictions(image_data):
    """
    Test-Time Augmentation (TTA): Get predictions from multiple crops/augmentations.
    Averages predictions for more robust results.
    """
    image = Image.open(BytesIO(image_data))
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Normalize lighting once
    image = normalize_lighting(image)
    
    predictions_list = []
    
    # Original center crop
    center = smart_crop_and_resize(image, IMAGE_SIZE)
    img_array = np.array(center, dtype=np.float32) / 255.0
    pred = model.predict(np.expand_dims(img_array, 0), verbose=0)[0]
    predictions_list.append(pred)
    
    # Horizontal flip
    flipped = center.transpose(Image.FLIP_LEFT_RIGHT)
    img_array = np.array(flipped, dtype=np.float32) / 255.0
    pred = model.predict(np.expand_dims(img_array, 0), verbose=0)[0]
    predictions_list.append(pred)
    
    # Slight rotations (-10, +10 degrees)
    for angle in [-10, 10]:
        rotated = center.rotate(angle, fillcolor=(255, 255, 255))
        img_array = np.array(rotated, dtype=np.float32) / 255.0
        pred = model.predict(np.expand_dims(img_array, 0), verbose=0)[0]
        predictions_list.append(pred)
    
    # Average all predictions
    avg_predictions = np.mean(predictions_list, axis=0)
    
    return avg_predictions

# ============================================================================
# CONFIDENCE CALIBRATION
# ============================================================================

def calibrate_confidence(raw_confidence, prediction_entropy, quality_score):
    """
    Calibrate confidence based on prediction certainty and image quality.
    Uses normalized entropy relative to max possible entropy for 38 classes.
    """
    import math
    
    # Max possible entropy for 38 classes (uniform distribution)
    max_entropy = math.log(len(class_names)) if len(class_names) > 0 else math.log(38)
    
    # Normalize entropy to [0, 1] range
    normalized_entropy = min(prediction_entropy / max_entropy, 1.0)
    
    # Soft entropy penalty: use square root for gentler penalization
    # Low entropy (confident) -> penalty close to 1.0
    # High entropy (uncertain) -> penalty decreases gently
    entropy_factor = 1.0 - (normalized_entropy ** 2) * 0.4  # Max 40% penalty from entropy
    
    # Quality factor: only penalize significantly for poor quality
    quality_factor = 0.7 + 0.3 * (quality_score / 100.0)  # Range: 0.7 to 1.0
    
    # Calculate calibrated confidence
    calibrated = raw_confidence * quality_factor * entropy_factor
    
    # Ensure reasonable bounds
    calibrated = max(15, min(99, calibrated))
    
    return float(calibrated)  # Convert to Python float for JSON serialization

def calculate_entropy(probabilities):
    """Calculate prediction entropy (measure of uncertainty)."""
    # Avoid log(0)
    probs = np.clip(probabilities, 1e-10, 1.0)
    entropy = -np.sum(probs * np.log(probs))
    return float(entropy)  # Convert to Python float for JSON serialization

def get_disease_info(class_name):
    """Get symptoms and prevention for a disease class."""
    if class_name in DISEASE_INFO:
        return DISEASE_INFO[class_name]
    else:
        # Default for unknown classes
        return {
            "symptoms": ["Disease detected in plant", "Further analysis recommended", "Visual symptoms present"],
            "prevention": ["Consult local agricultural expert", "Remove infected plant parts", "Improve growing conditions"]
        }

def format_class_name(class_name):
    """Format class name for display (e.g., 'Tomato___Early_blight' -> 'Tomato - Early Blight')"""
    # Split by triple underscore
    parts = class_name.split('___')
    if len(parts) == 2:
        plant = parts[0].replace('_', ' ').replace(',', '')
        disease = parts[1].replace('_', ' ')
        # Title case each word
        plant = plant.title()
        disease = disease.title()
        return f"{plant} - {disease}"
    return class_name.replace('_', ' ').title()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Plant Disease Detection API (Enhanced)',
        'version': '3.0 - ENHANCED OFFLINE',
        'model_loaded': model is not None,
        'num_classes': len(class_names),
        'mode': 'offline',
        'features': ['quality_validation', 'lighting_normalization', 'TTA', 'confidence_calibration']
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Enhanced prediction endpoint with:
    - Image quality validation
    - Advanced preprocessing (lighting normalization, enhancement)
    - Test-Time Augmentation (TTA) for robustness
    - Confidence calibration
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    # Check for TTA mode (optional query param)
    use_tta = request.args.get('tta', 'false').lower() == 'true'
    skip_validation = request.args.get('skip_validation', 'false').lower() == 'true'
    
    try:
        # Validate file
        if not file.filename:
            return jsonify({'error': 'Empty file'}), 400
        
        # Read image data
        image_data = file.read()
        if len(image_data) == 0:
            return jsonify({'error': 'Empty image file'}), 400
        
        print(f"\n📷 Received image: {file.filename} ({len(image_data)} bytes)")
        
        # Open image for validation
        image = Image.open(BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Validate image quality (unless skipped)
        quality_score = 100
        quality_issues = []
        quality_suggestions = []
        
        if not skip_validation:
            is_valid, quality_score, quality_issues, quality_suggestions = validate_image_quality(image)
            print(f"📊 Image quality score: {quality_score}%")
            
            if quality_issues:
                print(f"⚠️ Quality issues: {', '.join(quality_issues)}")
            
            # Warn but don't block on low quality
            if not is_valid:
                print("⚠️ Low quality image - results may be unreliable")
        
        # Perform prediction (with TTA if enabled)
        if use_tta:
            print("🔄 Using Test-Time Augmentation...")
            predictions = get_multi_crop_predictions(image_data)
        else:
            processed_image = preprocess_image(image_data, apply_enhancements=True)
            predictions = model.predict(processed_image, verbose=0)[0]
        
        # Get top predictions (top 3)
        top_indices = np.argsort(predictions)[-3:][::-1]
        top_predictions = []
        
        for idx in top_indices:
            top_predictions.append({
                'class': format_class_name(class_names[idx]),
                'raw_class': class_names[idx],
                'confidence': round(float(predictions[idx]) * 100, 2)
            })
        
        # Primary prediction
        predicted_class_idx = top_indices[0]
        raw_confidence = float(predictions[predicted_class_idx]) * 100
        
        # Calculate prediction entropy for calibration
        entropy = calculate_entropy(predictions)
        
        # Calibrate confidence based on quality and certainty
        calibrated_confidence = calibrate_confidence(raw_confidence, entropy, quality_score)
        
        # Get class name and info
        predicted_class = class_names[predicted_class_idx]
        disease_info = get_disease_info(predicted_class)
        display_name = format_class_name(predicted_class)
        
        # Determine if healthy
        is_healthy = 'healthy' in predicted_class.lower()
        
        # Build enhanced response
        result = {
            'class': display_name,
            'confidence': round(calibrated_confidence, 2),
            'raw_confidence': round(raw_confidence, 2),
            'symptoms': disease_info['symptoms'],
            'prevention': disease_info['prevention'],
            'raw_class': predicted_class,
            'is_healthy': is_healthy,
            'top_predictions': top_predictions,
            'quality': {
                'score': quality_score,
                'issues': quality_issues,
                'suggestions': quality_suggestions
            },
            'prediction_entropy': round(entropy, 4),
            'tta_enabled': use_tta
        }
        
        print(f"✅ Prediction: {display_name}")
        print(f"   Raw confidence: {raw_confidence:.2f}%")
        print(f"   Calibrated confidence: {calibrated_confidence:.2f}%")
        print(f"   Quality score: {quality_score}%")
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

@app.route('/validate', methods=['POST'])
def validate_image():
    """
    Validate image quality without making prediction.
    Useful for pre-checking before capture.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    try:
        image_data = file.read()
        image = Image.open(BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        is_valid, quality_score, issues, suggestions = validate_image_quality(image)
        
        return jsonify({
            'is_valid': is_valid,
            'quality_score': quality_score,
            'issues': issues,
            'suggestions': suggestions,
            'image_size': list(image.size),
            'brightness': round(calculate_brightness(image), 2),
            'contrast': round(calculate_contrast(image), 2),
            'sharpness': round(calculate_sharpness(image), 2),
            'green_content': round(detect_green_content(image), 2)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Return list of all supported disease classes."""
    formatted_classes = [format_class_name(c) for c in class_names]
    return jsonify({
        'classes': formatted_classes,
        'raw_classes': class_names,
        'count': len(class_names)
    }), 200

if __name__ == '__main__':
    print("\n" + "=" * 80)
    print("🌿 ENHANCED Plant Disease Detection Server v3.0")
    print("=" * 80)
    print(f"📂 Model: {MODEL_PATH}")
    print(f"📋 Classes: {len(class_names)} disease types")
    print(f"🌐 Server: http://0.0.0.0:5000")
    print("=" * 80)
    print("\n🔬 ENHANCED FEATURES:")
    print("   ✓ Image quality validation (blur, lighting, contrast)")
    print("   ✓ CLAHE lighting normalization")
    print("   ✓ Test-Time Augmentation (TTA) for robustness")
    print("   ✓ Confidence calibration")
    print("   ✓ Top-3 predictions")
    print("   ✓ Smart crop and resize")
    print("\n💡 NO INTERNET REQUIRED - All inference runs locally!")
    print("=" * 80 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
