"""
LeafGuard Server with Leaf/Not-Leaf Binary Classifier
Uses Keras model for binary classification, then PyTorch for disease classification.
"""

import os
import sys
from pathlib import Path
import json
import random
import numpy as np

# Flask
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Preferred leaf gate model path (v2 first), overridable via env.
LEAF_MODEL_PATHS = [
    os.environ.get('LEAF_MODEL_PATH', 'checkpoints/leaf_notleaf_v2.keras'),
    'checkpoints/leaf_vs_notleaf_v2.keras',
    'checkpoints/leaf_vs_notleaf_model.keras',
]

# Leaf gate settings (can be overridden with environment variables)
LEAF_THRESHOLD = float(os.environ.get('LEAF_THRESHOLD', '0.5'))
# For scalar outputs: set to 'not_leaf' if model predicts high for not-leaf, else 'leaf'.
LEAF_SCALAR_MODE = os.environ.get('LEAF_SCALAR_MODE', 'not_leaf').strip().lower()
# For vector outputs (2-class): index of the not-leaf probability after softmax.
LEAF_NOT_LEAF_INDEX = int(os.environ.get('LEAF_NOT_LEAF_INDEX', '1'))
# If enabled, do not run disease model when leaf gate model is unavailable.
LEAF_FAIL_CLOSED = os.environ.get('LEAF_FAIL_CLOSED', '1') == '1'

# Disease classes (41 classes)
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

# Transform for PyTorch disease model
transform = None

# Load models
LEAF_MODEL = None
DISEASE_MODEL = None
device = None

print("Loading models...")


def _softmax_np(x: np.ndarray) -> np.ndarray:
    x = x.astype(np.float64)
    x = x - np.max(x)
    e = np.exp(x)
    s = np.sum(e)
    if s <= 0:
        return np.ones_like(e) / float(len(e))
    return e / s


def _extract_not_leaf_probability(raw_pred) -> float:
    """
    Convert different Keras output formats into a single not-leaf probability in [0, 1].
    Supported:
      - scalar sigmoid output
      - vector (2-class logits/probabilities)
    """
    arr = np.asarray(raw_pred).squeeze()

    # Scalar output case.
    if arr.ndim == 0:
        val = float(arr)
        val = max(0.0, min(1.0, val))
        if LEAF_SCALAR_MODE == 'leaf':
            return 1.0 - val
        return val

    # Vector output case.
    if arr.ndim == 1:
        probs = arr.astype(np.float64)
        # If not already probabilities, convert via softmax.
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

    print(
        f"Leaf gate => not_leaf_prob={not_leaf_prob:.3f}, "
        f"threshold={LEAF_THRESHOLD:.3f}, is_leaf={is_leaf}"
    )

    if not is_leaf:
        return False, not_leaf_prob, 'not_leaf_detected'
    return True, not_leaf_prob, 'leaf_detected'


def build_not_leaf_response(not_leaf_prob=None, reason='not_leaf_detected'):
    """Consistent response payload for all non-leaf outcomes."""
    response = {
        'is_leaf': False,
        'prediction': 'not_leaf',
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

# Try to load TensorFlow/Keras for binary classifier
try:
    import tensorflow as tf

    _loaded_leaf_path = None
    _leaf_load_errors = []
    for model_path in LEAF_MODEL_PATHS:
        try:
            if Path(model_path).exists():
                LEAF_MODEL = tf.keras.models.load_model(model_path)
                LEAF_MODEL.compile()
                _loaded_leaf_path = model_path
                break
            _leaf_load_errors.append(f"Not found: {model_path}")
        except Exception as e:
            _leaf_load_errors.append(f"{model_path} -> {e}")

    if LEAF_MODEL is not None:
        print(f"Leaf/Not-Leaf model loaded: {_loaded_leaf_path}")
    else:
        print("Error loading leaf model from all candidates:")
        for err in _leaf_load_errors:
            print(f"  - {err}")
except Exception as e:
    print(f"Error loading leaf model: {e}")
    LEAF_MODEL = None

# Try to load PyTorch for disease classifier
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torchvision import transforms, models
    from PIL import Image
    import io
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    ckpt = torch.load('checkpoints/leafguard_final.pth', map_location=device, weights_only=False)
    DISEASE_MODEL = models.resnet18(weights=None)
    DISEASE_MODEL.fc = nn.Linear(512, 41)
    DISEASE_MODEL.load_state_dict(ckpt['model_state_dict'], strict=True)
    DISEASE_MODEL = DISEASE_MODEL.to(device)
    DISEASE_MODEL.eval()
    print("Disease model loaded!")
    
except Exception as e:
    print(f"Error loading disease model: {e}")
    DISEASE_MODEL = None


@app.route('/')
def index():
    """Serve the HTML UI."""
    return render_template('index.html')


@app.route('/classify', methods=['POST'])
def classify():
    """Two-step classification: leaf check then disease classification."""
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    image_bytes = file.read()
    
    try:
        from PIL import Image
        import io
        
        # Load image for both models
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Step 1: Leaf gate (required before disease classification).
        leaf_passed, not_leaf_prob, leaf_reason = run_leaf_gate(pil_image)
        if not leaf_passed:
            return jsonify(build_not_leaf_response(not_leaf_prob=not_leaf_prob, reason=leaf_reason))
        
        # Step 2: Disease classification (only if leaf was detected)
        if DISEASE_MODEL is not None and transform is not None:
            # Transform for PyTorch model
            img_tensor = transform(pil_image).unsqueeze(0).to(device)
            
            with torch.no_grad():
                logits = DISEASE_MODEL(img_tensor)
                probs = F.softmax(logits, dim=1)
                
                # Top 5 predictions
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
            
            return jsonify({
                'is_leaf': True,
                'not_leaf_probability': float(not_leaf_prob) if not_leaf_prob is not None else None,
                'prediction': main_result['class'],
                'confidence': main_result['confidence'],
                'predictions': results
            })
        
        else:
            # No disease model loaded
            return jsonify({
                'is_leaf': True if LEAF_MODEL else None,
                'prediction': 'model_unavailable',
                'message': 'Disease classification model not loaded'
            })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health():
    """Health check."""
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
    })


if __name__ == '__main__':
    print("=" * 60)
    print("LeafGuard - Plant Disease Classifier with Leaf Detection")
    print("=" * 60)
    print(f"Leaf/Not-Leaf model: {'Loaded' if LEAF_MODEL else 'Not loaded'}")
    print(f"Disease model: {'Loaded' if DISEASE_MODEL else 'Not loaded'}")
    print(f"Classes: {len(TARGET_CLASSES)}")
    print("")
    print("Open your browser: http://localhost:5000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)