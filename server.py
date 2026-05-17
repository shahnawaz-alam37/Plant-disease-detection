"""
Plant Disease Detection Server
Uses leaf/not-leaf gate (Keras) + disease classifier (PyTorch) pipeline
"""

from flask import Flask, request, jsonify, render_template
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

app = Flask(__name__)
CORS(app)

# ============================================================================
# NEW PIPELINE: Leaf/Not-Leaf Gate + Disease Classification
# ============================================================================

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models

# Leaf gate model paths (keras)
LEAF_MODEL_PATHS = [
    os.environ.get('LEAF_MODEL_PATH', 'leaf_vs_notleaf_v2.keras'),
    'checkpoints/leaf_vs_notleaf_v2.keras',
    'checkpoints/leaf_notleaf_v2.keras',
    'checkpoints/leaf_vs_notleaf_model.keras',
]

# Leaf gate settings
LEAF_THRESHOLD = float(os.environ.get('LEAF_THRESHOLD', '0.5'))
LEAF_SCALAR_MODE = os.environ.get('LEAF_SCALAR_MODE', 'not_leaf').strip().lower()
LEAF_NOT_LEAF_INDEX = int(os.environ.get('LEAF_NOT_LEAF_INDEX', '1'))
LEAF_FAIL_CLOSED = os.environ.get('LEAF_FAIL_CLOSED', '1') == '1'

# Disease classes (41 classes from leafguard_final.pth)
TARGET_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy',
    'Tomato_Blight', 'Tomato_Blotch', 'Tomato_Canker', 'Tomato_Leaf_Mold',
    'Tomato_Mildew', 'Tomato_Mosaic', 'Tomato_Rot', 'Tomato_Rust', 'Tomato_Smut', 'Tomato_Spot',
]

# Model globals
LEAF_MODEL = None
DISEASE_MODEL = None
device = None
pytorch_transform = None


def _softmax_np(x: np.ndarray) -> np.ndarray:
    x = x.astype(np.float64)
    x = x - np.max(x)
    e = np.exp(x)
    s = np.sum(e)
    if s <= 0:
        return np.ones_like(e) / float(len(e))
    return e / s


def _extract_not_leaf_probability(raw_pred) -> float:
    """Convert different Keras output formats into a single not-leaf probability in [0, 1]."""
    arr = np.asarray(raw_pred).squeeze()
    
    if arr.ndim == 0:
        val = float(arr)
        val = max(0.0, min(1.0, val))
        if LEAF_SCALAR_MODE == 'leaf':
            return 1.0 - val
        return val
    
    if arr.ndim == 1:
        probs = arr.astype(np.float64)
        if np.any(probs < 0.0) or np.any(probs > 1.0) or abs(float(np.sum(probs)) - 1.0) > 1e-3:
            probs = _softmax_np(probs)
        
        idx = LEAF_NOT_LEAF_INDEX
        if idx < 0 or idx >= len(probs):
            idx = min(1, len(probs) - 1)
        return float(max(0.0, min(1.0, probs[idx])))
    
    raise ValueError(f"Unsupported leaf model output shape: {arr.shape}")


def run_leaf_gate(pil_image):
    """Run leaf/non-leaf gate. Returns (passed, not_leaf_prob, reason)."""
    if LEAF_MODEL is None:
        if LEAF_FAIL_CLOSED:
            return False, None, 'leaf_model_unavailable'
        return True, None, 'leaf_model_unavailable_but_allowed'
    
    keras_img = pil_image.resize((224, 224))
    keras_array = np.array(keras_img, dtype=np.float32) / 255.0
    keras_array = keras_array.reshape(1, 224, 224, 3)
    
    leaf_pred = LEAF_MODEL.predict(keras_array, verbose=0)
    not_leaf_prob = _extract_not_leaf_probability(leaf_pred)
    is_leaf = not_leaf_prob < LEAF_THRESHOLD
    
    print(f"Leaf gate => not_leaf_prob={not_leaf_prob:.3f}, threshold={LEAF_THRESHOLD:.3f}, is_leaf={is_leaf}")
    
    if not is_leaf:
        return False, not_leaf_prob, 'not_leaf_detected'
    return True, not_leaf_prob, 'leaf_detected'


def build_not_leaf_response(not_leaf_prob=None, reason='not_leaf_detected'):
    """Consistent response payload for non-leaf outcomes."""
    response = {
        'is_leaf': False,
        'prediction': 'not_leaf',
        'class': 'not_leaf',
        'message': 'not leaf',
        'reason': reason,
    }
    if not_leaf_prob is not None:
        response['confidence'] = float(not_leaf_prob)
        response['not_leaf_probability'] = float(not_leaf_prob)
    else:
        response['confidence'] = None
        response['not_leaf_probability'] = None
    return response


def load_leaf_model():
    """Load the Keras leaf/not-leaf model."""
    global LEAF_MODEL
    
    _leaf_load_errors = []
    for model_path in LEAF_MODEL_PATHS:
        try:
            if os.path.exists(model_path):
                LEAF_MODEL = tf.keras.models.load_model(model_path)
                LEAF_MODEL.compile()
                print(f"Leaf/Not-Leaf model loaded: {model_path}")
                return
            _leaf_load_errors.append(f"Not found: {model_path}")
        except Exception as e:
            _leaf_load_errors.append(f"{model_path} -> {e}")
    
    print("Warning: Could not load leaf model:")
    for err in _leaf_load_errors:
        print(f"  - {err}")
    LEAF_MODEL = None


def load_disease_model():
    """Load the PyTorch disease classification model."""
    global DISEASE_MODEL, device, pytorch_transform
    
    try:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Device: {device}")
        
        pytorch_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # Try multiple possible paths
        model_paths = [
            os.environ.get('DISEASE_MODEL_PATH', 'leafguard_final.pth'),
            'checkpoints/leafguard_final.pth',
        ]
        ckpt = None
        loaded_path = None
        
        for path in model_paths:
            if os.path.exists(path):
                ckpt = torch.load(path, map_location=device, weights_only=False)
                loaded_path = path
                break
        
        if ckpt is None:
            print("Warning: Disease model not found")
            return
        
        DISEASE_MODEL = models.resnet18(weights=None)
        DISEASE_MODEL.fc = nn.Linear(512, 41)
        DISEASE_MODEL.load_state_dict(ckpt['model_state_dict'], strict=True)
        DISEASE_MODEL = DISEASE_MODEL.to(device)
        DISEASE_MODEL.eval()
        print(f"Disease model loaded from: {loaded_path}")
        
    except Exception as e:
        print(f"Error loading disease model: {e}")
        DISEASE_MODEL = None


# Load models on startup
print("Loading models...")
load_leaf_model()
load_disease_model()

print("=" * 80)
print("Plant Disease Detection Server - NEW PIPELINE")
print("=" * 80)
print(f"Leaf/Not-Leaf model: {'Loaded' if LEAF_MODEL else 'Not loaded'}")
print(f"Disease model: {'Loaded' if DISEASE_MODEL else 'Not loaded'}")
print(f"Classes: {len(TARGET_CLASSES)}")
print("=" * 80)

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
        "prevention": ["Rotate kharif crops yearly", "Plant resistant hybrids", "Apply foliar fungicides", "Remove crop residue after harvest"]
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

# ============================================================================
# IMAGE QUALITY VALIDATION (Optional - for backward compatibility)
# ============================================================================

# Load model and class names at startup
# model = None
# class_names = []

# def load_model():
#     global model, class_names
#     
#     print("\n📦 Loading TensorFlow model...")
#     
#     if not os.path.exists(MODEL_PATH):
#         raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
#     
#     model = tf.keras.models.load_model(MODEL_PATH)
#     print(f"✅ Model loaded: {MODEL_PATH}")
#     
#     # Load class names
#     if os.path.exists(CLASS_NAMES_PATH):
#         with open(CLASS_NAMES_PATH, 'r') as f:
#             class_names = json.load(f)
#     elif os.path.exists('class_names.txt'):
#         with open('class_names.txt', 'r') as f:
#             class_names = [line.strip() for line in f if line.strip()]
#     else:
#         raise FileNotFoundError("Class names file not found")
#     
#     print(f"✅ Loaded {len(class_names)} disease classes")
#     print("\n🚀 Server ready for enhanced offline inference!")
#     print("=" * 80)

# # Load model on startup
# load_model()


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


def _classify_from_bytes(image_bytes):
    try:
        pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')

        # Step 1: Leaf gate (required before disease classification)
        leaf_passed, not_leaf_prob, leaf_reason = run_leaf_gate(pil_image)
        if not leaf_passed:
            return build_not_leaf_response(not_leaf_prob=not_leaf_prob, reason=leaf_reason), 200

        # Step 2: Disease classification (only if leaf was detected)
        if DISEASE_MODEL is not None and pytorch_transform is not None:
            img_tensor = pytorch_transform(pil_image).unsqueeze(0).to(device)

            with torch.no_grad():
                logits = DISEASE_MODEL(img_tensor)
                probs = F.softmax(logits, dim=1)

                top_probs, top_preds = probs.topk(5, dim=1)
                top_probs = top_probs.squeeze().cpu().numpy()
                top_preds = top_preds.squeeze().cpu().numpy()

            results = []
            for prob, idx in zip(top_probs, top_preds):
                results.append({
                    'class': TARGET_CLASSES[idx],
                    'confidence': float(prob)
                })

            main_result = results[0]
            disease_info = get_disease_info(main_result['class'])

            return {
                'is_leaf': True,
                'not_leaf_probability': float(not_leaf_prob) if not_leaf_prob is not None else None,
                'prediction': main_result['class'],
                'class': main_result['class'],
                'confidence': main_result['confidence'],
                'predictions': results,
                'top_predictions': results,
                'symptoms': disease_info.get('symptoms', []),
                'prevention': disease_info.get('prevention', [])
            }, 200

        return {
            'is_leaf': True if LEAF_MODEL else None,
            'prediction': 'model_unavailable',
            'class': 'model_unavailable',
            'message': 'Disease classification model not loaded'
        }, 200

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500


def _classify_request():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    image_bytes = file.read()

    payload, status_code = _classify_from_bytes(image_bytes)
    return jsonify(payload), status_code


@app.route('/', methods=['GET'])
def index():
    """Serve the HTML UI when available."""
    try:
        return render_template('index.html')
    except Exception:
        return jsonify({'status': 'ok'}), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'leaf_model_loaded': LEAF_MODEL is not None,
        'disease_model_loaded': DISEASE_MODEL is not None,
        'classes': len(TARGET_CLASSES),
        'leaf_model_paths': LEAF_MODEL_PATHS,
        'leaf_threshold': LEAF_THRESHOLD,
        'leaf_scalar_mode': LEAF_SCALAR_MODE,
        'leaf_not_leaf_index': LEAF_NOT_LEAF_INDEX,
        'leaf_fail_closed': LEAF_FAIL_CLOSED,
    }), 200


@app.route('/classify', methods=['POST'])
def classify():
    """Two-step classification: leaf check then disease classification."""
    return _classify_request()

@app.route('/predict', methods=['POST', 'HEAD'])
def predict():
    """Backward-compatible endpoint for the mobile app."""
    if request.method == 'HEAD':
        return '', 200
    return _classify_request()

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
    return jsonify({
        'classes': TARGET_CLASSES,
        'count': len(TARGET_CLASSES)
    }), 200


if __name__ == '__main__':
    print("\n" + "=" * 80)
    print("Plant Disease Detection Server - Leaf Gate Pipeline")
    print("=" * 80)
    print(f"Leaf model: {'Loaded' if LEAF_MODEL else 'Not loaded'}")
    print(f"Disease model: {'Loaded' if DISEASE_MODEL else 'Not loaded'}")
    print(f"Classes: {len(TARGET_CLASSES)}")
    print(f"Server: http://0.0.0.0:5000")
    print("=" * 80)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
