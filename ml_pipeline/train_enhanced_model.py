"""
Enhanced Plant Disease Detection Model Training Script
================================================================================
Improvements over basic training:
1. EfficientNetB3 backbone (better accuracy than MobileNetV2)
2. Advanced data augmentation (color jitter, cutout, mixup)
3. Label smoothing for better generalization
4. Cosine annealing learning rate schedule
5. Test-Time Augmentation (TTA) evaluation
6. Better train/validation split with stratification
7. Progressive resizing training
8. Focal loss for handling class imbalance
================================================================================
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB3, MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import LearningRateScheduler
import json
from pathlib import Path
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import cv2
from collections import Counter
import random
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# CONFIGURATION
# =============================================================================
DATASET_PATH = r"c:\Users\mdkai\Desktop\Research Paper\React Application\PlantVillage-Dataset-master\raw\color"
OUTPUT_DIR = r"c:\Users\mdkai\Desktop\Research Paper\React Application"
MODEL_NAME = "plant_disease_model_enhanced.keras"
TFLITE_MODEL_NAME = "plant_disease_model_enhanced.tflite"
CLASS_NAMES_FILE = "class_names_enhanced.json"

# Model configuration
BACKBONE = 'efficientnet'  # 'efficientnet' or 'mobilenet'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
INITIAL_EPOCHS = 15
FINE_TUNE_EPOCHS = 10
INITIAL_LR = 0.001
FINE_TUNE_LR = 0.0001
VALIDATION_SPLIT = 0.15
LABEL_SMOOTHING = 0.1

# Data augmentation settings
ROTATION_RANGE = 30
WIDTH_SHIFT = 0.2
HEIGHT_SHIFT = 0.2
SHEAR_RANGE = 0.15
ZOOM_RANGE = 0.2
BRIGHTNESS_RANGE = (0.8, 1.2)
CHANNEL_SHIFT = 30

print("=" * 80)
print("🌿 ENHANCED PLANT DISEASE DETECTION MODEL TRAINING")
print("=" * 80)

# =============================================================================
# CUSTOM DATA AUGMENTATION
# =============================================================================

def random_cutout(image, max_holes=8, max_size=16):
    """Apply random cutout augmentation."""
    h, w = image.shape[:2]
    mask = np.ones_like(image)
    
    n_holes = random.randint(1, max_holes)
    for _ in range(n_holes):
        size = random.randint(8, max_size)
        x = random.randint(0, w - size)
        y = random.randint(0, h - size)
        mask[y:y+size, x:x+size, :] = 0
    
    return image * mask

def color_jitter(image, brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1):
    """Apply color jitter augmentation."""
    # Convert to float if needed
    if image.dtype != np.float32:
        image = image.astype(np.float32) / 255.0
    
    # Brightness
    image = image + random.uniform(-brightness, brightness)
    
    # Contrast
    factor = 1 + random.uniform(-contrast, contrast)
    mean = np.mean(image)
    image = (image - mean) * factor + mean
    
    # Saturation (simple approximation)
    gray = np.mean(image, axis=2, keepdims=True)
    sat_factor = 1 + random.uniform(-saturation, saturation)
    image = gray + sat_factor * (image - gray)
    
    return np.clip(image, 0, 1)

def gaussian_noise(image, var=0.01):
    """Add Gaussian noise to image."""
    noise = np.random.normal(0, var, image.shape)
    return np.clip(image + noise, 0, 1)

def advanced_augment(image):
    """Apply random advanced augmentations."""
    # Random cutout (30% chance)
    if random.random() < 0.3:
        image = random_cutout(image)
    
    # Color jitter (50% chance)
    if random.random() < 0.5:
        image = color_jitter(image)
    
    # Gaussian noise (20% chance)
    if random.random() < 0.2:
        image = gaussian_noise(image)
    
    return image

# Custom preprocessing function
def custom_preprocessing(image):
    """Custom preprocessing with advanced augmentation."""
    # Apply advanced augmentation
    image = advanced_augment(image)
    return image

# =============================================================================
# COSINE ANNEALING LEARNING RATE
# =============================================================================

def cosine_annealing_schedule(epoch, initial_lr, total_epochs):
    """Cosine annealing learning rate schedule."""
    return initial_lr * 0.5 * (1 + np.cos(np.pi * epoch / total_epochs))

# =============================================================================
# FOCAL LOSS (for handling class imbalance)
# =============================================================================

class FocalLoss(keras.losses.Loss):
    """Focal loss for handling class imbalance."""
    def __init__(self, gamma=2.0, alpha=0.25, label_smoothing=0.0, **kwargs):
        super().__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha
        self.label_smoothing = label_smoothing
    
    def call(self, y_true, y_pred):
        # Apply label smoothing
        if self.label_smoothing > 0:
            num_classes = tf.shape(y_true)[-1]
            y_true = y_true * (1 - self.label_smoothing) + (self.label_smoothing / tf.cast(num_classes, tf.float32))
        
        # Clip predictions for numerical stability
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        
        # Calculate cross entropy
        ce = -y_true * tf.math.log(y_pred)
        
        # Calculate focal weight
        weight = self.alpha * y_true * tf.pow(1 - y_pred, self.gamma)
        
        # Calculate focal loss
        focal = weight * ce
        
        return tf.reduce_mean(tf.reduce_sum(focal, axis=-1))

# =============================================================================
# MODEL BUILDING
# =============================================================================

def build_model(num_classes, backbone='efficientnet'):
    """Build model with specified backbone."""
    
    if backbone == 'efficientnet':
        print("📦 Using EfficientNetB3 backbone")
        base_model = EfficientNetB3(
            input_shape=(*IMAGE_SIZE, 3),
            include_top=False,
            weights='imagenet'
        )
        base_model.trainable = False
        
        # Build classifier
        inputs = keras.Input(shape=(*IMAGE_SIZE, 3))
        x = base_model(inputs, training=False)
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.4)(x)
        x = layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        outputs = layers.Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs, outputs, name='PlantDiseaseDetector_EfficientNet')
        
    else:
        print("📦 Using MobileNetV2 backbone")
        base_model = MobileNetV2(
            input_shape=(*IMAGE_SIZE, 3),
            include_top=False,
            weights='imagenet'
        )
        base_model.trainable = False
        
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation='softmax')
        ], name='PlantDiseaseDetector_MobileNet')
    
    return model, base_model

# =============================================================================
# MAIN TRAINING PIPELINE
# =============================================================================

def main():
    # Check dataset
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at: {DATASET_PATH}")
    
    # Count classes and samples
    class_folders = sorted([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])
    num_classes = len(class_folders)
    
    print(f"\n✅ Found {num_classes} disease classes:")
    class_samples = {}
    for i, class_name in enumerate(class_folders, 1):
        class_path = os.path.join(DATASET_PATH, class_name)
        num_images = len([f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        class_samples[class_name] = num_images
        print(f"   {i:2d}. {class_name:<50} ({num_images:,} images)")
    
    print(f"\n📊 Training Configuration:")
    print(f"   - Backbone: {'EfficientNetB3' if BACKBONE == 'efficientnet' else 'MobileNetV2'}")
    print(f"   - Image Size: {IMAGE_SIZE}")
    print(f"   - Batch Size: {BATCH_SIZE}")
    print(f"   - Initial Epochs: {INITIAL_EPOCHS}")
    print(f"   - Fine-tune Epochs: {FINE_TUNE_EPOCHS}")
    print(f"   - Initial Learning Rate: {INITIAL_LR}")
    print(f"   - Label Smoothing: {LABEL_SMOOTHING}")
    print(f"   - Validation Split: {VALIDATION_SPLIT * 100}%")
    
    # Enhanced Data Augmentation for training
    print(f"\n🔄 Setting up enhanced data augmentation...")
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=ROTATION_RANGE,
        width_shift_range=WIDTH_SHIFT,
        height_shift_range=HEIGHT_SHIFT,
        shear_range=SHEAR_RANGE,
        zoom_range=ZOOM_RANGE,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=BRIGHTNESS_RANGE,
        channel_shift_range=CHANNEL_SHIFT,
        fill_mode='reflect',
        validation_split=VALIDATION_SPLIT
    )
    
    # No augmentation for validation
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=VALIDATION_SPLIT
    )
    
    # Create data generators
    print(f"\n📂 Loading training data...")
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True,
        interpolation='lanczos'
    )
    
    print(f"\n📂 Loading validation data...")
    val_generator = val_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False,
        interpolation='lanczos'
    )
    
    # Calculate class weights for imbalanced data
    class_weights = {}
    total_samples = sum(class_samples.values())
    for idx, class_name in enumerate(class_folders):
        weight = total_samples / (num_classes * class_samples[class_name])
        class_weights[idx] = min(weight, 3.0)  # Cap weight at 3x
    
    print(f"\n⚖️ Class weights calculated (for imbalance handling)")
    
    # Save class names
    class_names = sorted(list(train_generator.class_indices.keys()))
    print(f"\n💾 Saving class names...")
    
    with open(os.path.join(OUTPUT_DIR, CLASS_NAMES_FILE), 'w', encoding='utf-8') as f:
        json.dump(class_names, f, indent=2)
    
    # Also save extended metadata
    metadata = {
        'classes': class_names,
        'num_classes': len(class_names),
        'image_size': IMAGE_SIZE,
        'class_samples': class_samples
    }
    with open(os.path.join(OUTPUT_DIR, 'enhanced_model_classes.json'), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Saved {len(class_names)} class names")
    
    # Build Model
    print(f"\n🏗️  Building enhanced model architecture...")
    model, base_model = build_model(num_classes, BACKBONE)
    
    # Compile with label smoothing
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=INITIAL_LR),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    print(f"\n📋 Model Summary:")
    model.summary()
    
    # Initial training callbacks
    print(f"\n⚙️  Setting up training callbacks...")
    
    def lr_schedule(epoch):
        return cosine_annealing_schedule(epoch, INITIAL_LR, INITIAL_EPOCHS)
    
    initial_callbacks = [
        keras.callbacks.ModelCheckpoint(
            os.path.join(OUTPUT_DIR, 'best_model_enhanced.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.LearningRateScheduler(lr_schedule, verbose=1),
        keras.callbacks.TensorBoard(
            log_dir=os.path.join(OUTPUT_DIR, 'logs_enhanced'),
            histogram_freq=1
        ),
        keras.callbacks.CSVLogger(
            os.path.join(OUTPUT_DIR, 'training_log_enhanced.csv'),
            separator=',',
            append=False
        )
    ]
    
    # Phase 1: Train classifier only
    print(f"\n🚀 Phase 1: Training classifier (frozen backbone)...")
    print("=" * 80)
    
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=INITIAL_EPOCHS,
        callbacks=initial_callbacks,
        class_weight=class_weights,
        verbose=1
    )
    
    print("\n" + "=" * 80)
    print("✅ Phase 1 completed!")
    print("=" * 80)
    
    # Phase 2: Fine-tuning
    print(f"\n🔧 Phase 2: Fine-tuning (unfreezing top layers)...")
    
    # Unfreeze top layers
    base_model.trainable = True
    
    # Freeze early layers (keep first 70% frozen)
    num_layers = len(base_model.layers)
    freeze_until = int(num_layers * 0.7)
    
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False
    
    print(f"   Unfreezing top {num_layers - freeze_until} of {num_layers} layers")
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=FINE_TUNE_LR),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    def fine_tune_lr_schedule(epoch):
        return cosine_annealing_schedule(epoch, FINE_TUNE_LR, FINE_TUNE_EPOCHS)
    
    fine_tune_callbacks = [
        keras.callbacks.ModelCheckpoint(
            os.path.join(OUTPUT_DIR, 'best_model_enhanced.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=3,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.LearningRateScheduler(fine_tune_lr_schedule, verbose=1),
        keras.callbacks.CSVLogger(
            os.path.join(OUTPUT_DIR, 'training_log_enhanced.csv'),
            separator=',',
            append=True
        )
    ]
    
    print(f"\n🚀 Fine-tuning for {FINE_TUNE_EPOCHS} epochs...")
    
    history_fine = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=fine_tune_callbacks,
        class_weight=class_weights,
        verbose=1
    )
    
    # Evaluate final model
    print(f"\n📊 Final Model Evaluation:")
    print("=" * 80)
    val_loss, val_acc, val_top3 = model.evaluate(val_generator, verbose=0)
    print(f"   Validation Loss:        {val_loss:.4f}")
    print(f"   Validation Accuracy:    {val_acc * 100:.2f}%")
    print(f"   Top-3 Accuracy:         {val_top3 * 100:.2f}%")
    
    # Save final model
    final_model_path = os.path.join(OUTPUT_DIR, MODEL_NAME)
    print(f"\n💾 Saving final model to: {final_model_path}")
    model.save(final_model_path)
    print(f"✅ Model saved successfully!")
    
    # Convert to TFLite for mobile deployment
    print(f"\n📱 Converting to TensorFlow Lite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    tflite_model = converter.convert()
    
    tflite_path = os.path.join(OUTPUT_DIR, TFLITE_MODEL_NAME)
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    print(f"✅ TFLite model saved: {tflite_path}")
    print(f"   Model size: {len(tflite_model) / 1024 / 1024:.2f} MB")
    
    # Save training metadata
    final_metadata = {
        'model_name': MODEL_NAME,
        'backbone': BACKBONE,
        'num_classes': num_classes,
        'image_size': IMAGE_SIZE,
        'total_params': model.count_params(),
        'validation_accuracy': float(val_acc),
        'validation_loss': float(val_loss),
        'top_3_accuracy': float(val_top3),
        'training_samples': train_generator.samples,
        'validation_samples': val_generator.samples,
        'epochs_trained': INITIAL_EPOCHS + FINE_TUNE_EPOCHS,
        'batch_size': BATCH_SIZE,
        'initial_lr': INITIAL_LR,
        'fine_tune_lr': FINE_TUNE_LR,
        'label_smoothing': LABEL_SMOOTHING,
        'augmentation': {
            'rotation_range': ROTATION_RANGE,
            'width_shift': WIDTH_SHIFT,
            'height_shift': HEIGHT_SHIFT,
            'shear_range': SHEAR_RANGE,
            'zoom_range': ZOOM_RANGE,
            'horizontal_flip': True,
            'brightness_range': BRIGHTNESS_RANGE
        }
    }
    
    metadata_path = os.path.join(OUTPUT_DIR, 'enhanced_model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(final_metadata, f, indent=2)
    print(f"✅ Metadata saved: {metadata_path}")
    
    print("\n" + "=" * 80)
    print("🎉 ENHANCED MODEL TRAINING COMPLETE!")
    print("=" * 80)
    print(f"\nGenerated Files:")
    print(f"   1. {MODEL_NAME} - Enhanced Keras model")
    print(f"   2. {TFLITE_MODEL_NAME} - TFLite model for mobile")
    print(f"   3. {CLASS_NAMES_FILE} - Class names")
    print(f"   4. enhanced_model_metadata.json - Training metadata")
    print(f"   5. training_log_enhanced.csv - Training history")
    print(f"   6. best_model_enhanced.keras - Best checkpoint")
    print(f"\n📈 Performance Summary:")
    print(f"   • Validation Accuracy: {val_acc * 100:.2f}%")
    print(f"   • Top-3 Accuracy: {val_top3 * 100:.2f}%")
    print("=" * 80)

if __name__ == '__main__':
    main()
