import tensorflow as tf
import os
from dataset_loader import load_dataset, get_augmentation_layer, IMG_SIZE

# Configuration
EPOCHS = 5
LEARNING_RATE = 0.0001
MODEL_SAVE_PATH = "plant_disease_model.keras"

def create_model(num_classes):
    """
    Creates a MobileNetV2 based model for transfer learning.
    """
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = get_augmentation_layer()(inputs)
    
    # Preprocess input (MobileNetV2 expects [-1, 1])
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs, outputs)
    return model

def train():
    train_ds, val_ds, test_ds, class_names = load_dataset()
    num_classes = len(class_names)
    
    print(f"Building model for {num_classes} classes...")
    model = create_model(num_classes)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    print("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
            tf.keras.callbacks.ModelCheckpoint("best_model.keras", save_best_only=True)
        ]
    )
    
    print("Training finished. Saving model...")
    model.save(MODEL_SAVE_PATH)
    
    # Save class names
    with open("class_names.txt", "w") as f:
        for name in class_names:
            f.write(f"{name}\n")
            
    return model, history

if __name__ == "__main__":
    train()
