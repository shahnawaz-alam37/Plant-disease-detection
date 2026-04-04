"""
Train Plant Disease Detection Model on PlantVillage Dataset
This script trains a TensorFlow/Keras model on the PlantVillage dataset
with 38 disease classes for use with the Flask server.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from pathlib import Path
import matplotlib.pyplot as plt

# Configuration
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001

# Paths
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / "PlantVillage-Dataset-master" / "raw" / "color"
MODEL_OUTPUT = BASE_DIR / "plant_disease_model_plantvillage.keras"
CLASS_NAMES_OUTPUT = BASE_DIR / "class_names_plantvillage.json"

print("=" * 80)
print("🌿 PLANT DISEASE MODEL TRAINING - PlantVillage Dataset")
print("=" * 80)

# Verify dataset exists
if not DATASET_DIR.exists():
    raise FileNotFoundError(f"Dataset not found at {DATASET_DIR}")

print(f"\n📂 Dataset Directory: {DATASET_DIR}")
print(f"📊 Target Image Size: {IMAGE_SIZE}")
print(f"📦 Batch Size: {BATCH_SIZE}")
print(f"🔄 Epochs: {EPOCHS}")

# Count classes and samples
class_folders = [d for d in DATASET_DIR.iterdir() if d.is_dir()]
num_classes = len(class_folders)
print(f"\n✅ Found {num_classes} disease classes")

# Get class names
class_names = sorted([d.name for d in class_folders])
print(f"\n📋 Classes:")
for i, name in enumerate(class_names, 1):
    num_images = len(list((DATASET_DIR / name).glob("*.jpg")) + list((DATASET_DIR / name).glob("*.JPG")))
    print(f"   {i:2d}. {name:50s} ({num_images:4d} images)")

# Save class names
with open(CLASS_NAMES_OUTPUT, 'w') as f:
    json.dump(class_names, f, indent=2)
print(f"\n💾 Class names saved to: {CLASS_NAMES_OUTPUT}")

# Data augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    fill_mode='nearest',
    validation_split=0.2  # 80% train, 20% validation
)

# Validation data (no augmentation, only rescaling)
val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

print("\n" + "=" * 80)
print("📸 LOADING TRAINING DATA")
print("=" * 80)

# Training generator
train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

# Validation generator
validation_generator = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

print(f"\n✅ Training samples: {train_generator.samples}")
print(f"✅ Validation samples: {validation_generator.samples}")
print(f"✅ Steps per epoch: {train_generator.samples // BATCH_SIZE}")

print("\n" + "=" * 80)
print("🏗️  BUILDING MODEL")
print("=" * 80)

# Create model with MobileNetV2 backbone (efficient for mobile deployment)
def create_model(num_classes):
    # Load pre-trained MobileNetV2 (without top layers)
    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Build custom classification head
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model

model, base_model = create_model(num_classes)

# Compile model
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
)

print("\n✅ Model architecture:")
model.summary()

print("\n" + "=" * 80)
print("🚀 TRAINING PHASE 1: Transfer Learning (Frozen Base)")
print("=" * 80)

# Callbacks
callbacks = [
    keras.callbacks.ModelCheckpoint(
        MODEL_OUTPUT,
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
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    ),
    keras.callbacks.CSVLogger('training_log.csv')
]

# Train with frozen base
history1 = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=10,
    callbacks=callbacks,
    verbose=1
)

print("\n" + "=" * 80)
print("🚀 TRAINING PHASE 2: Fine-Tuning (Unfrozen Layers)")
print("=" * 80)

# Unfreeze some layers of base model for fine-tuning
base_model.trainable = True

# Freeze first 100 layers, fine-tune the rest
for layer in base_model.layers[:100]:
    layer.trainable = False

# Recompile with lower learning rate
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE * 0.1),
    loss='categorical_crossentropy',
    metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
)

# Continue training
history2 = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS - 10,
    callbacks=callbacks,
    initial_epoch=10,
    verbose=1
)

print("\n" + "=" * 80)
print("📊 TRAINING COMPLETE - EVALUATION")
print("=" * 80)

# Evaluate on validation set
print("\n🔍 Final Evaluation on Validation Set:")
val_loss, val_accuracy, val_top3 = model.evaluate(validation_generator, verbose=1)

print(f"\n{'=' * 80}")
print(f"📈 FINAL RESULTS:")
print(f"{'=' * 80}")
print(f"✅ Validation Accuracy:     {val_accuracy * 100:.2f}%")
print(f"✅ Top-3 Accuracy:          {val_top3 * 100:.2f}%")
print(f"✅ Validation Loss:         {val_loss:.4f}")
print(f"{'=' * 80}")

# Save final model
model.save(MODEL_OUTPUT)
print(f"\n💾 Model saved to: {MODEL_OUTPUT}")
print(f"💾 Class names saved to: {CLASS_NAMES_OUTPUT}")

# Plot training history
print("\n📊 Generating training plots...")

# Combine histories
history_combined = {
    'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
    'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy'],
    'loss': history1.history['loss'] + history2.history['loss'],
    'val_loss': history1.history['val_loss'] + history2.history['val_loss']
}

plt.figure(figsize=(15, 5))

# Accuracy plot
plt.subplot(1, 2, 1)
plt.plot(history_combined['accuracy'], label='Training Accuracy')
plt.plot(history_combined['val_accuracy'], label='Validation Accuracy')
plt.axvline(x=10, color='red', linestyle='--', label='Fine-tuning starts')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, alpha=0.3)

# Loss plot
plt.subplot(1, 2, 2)
plt.plot(history_combined['loss'], label='Training Loss')
plt.plot(history_combined['val_loss'], label='Validation Loss')
plt.axvline(x=10, color='red', linestyle='--', label='Fine-tuning starts')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('training_history.png', dpi=150)
print("✅ Training plots saved to: training_history.png")

print("\n" + "=" * 80)
print("🎉 TRAINING COMPLETE!")
print("=" * 80)
print(f"\n📦 Model ready for deployment:")
print(f"   • Model file: {MODEL_OUTPUT}")
print(f"   • Class names: {CLASS_NAMES_OUTPUT}")
print(f"   • Classes: {num_classes}")
print(f"   • Accuracy: {val_accuracy * 100:.2f}%")
print(f"\n🚀 Next steps:")
print(f"   1. Update server.py to load this model")
print(f"   2. Test with sample images")
print(f"   3. Deploy to production")
print("\n" + "=" * 80)
