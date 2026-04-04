import tensorflow as tf
import os
import pathlib

# Configuration
DATASET_PATH = r"C:\Users\mdkai\Desktop\React Application\PlantVillage-Dataset-master\raw\color"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42

def load_dataset():
    """
    Loads the PlantVillage dataset from the specified directory.
    Splits it into Train (80%), Validation (10%), and Test (10%).
    """
    print(f"Loading dataset from: {DATASET_PATH}")
    
    # Check if directory exists
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    # Load full dataset
    full_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        shuffle=True,
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    class_names = full_ds.class_names
    print(f"Found {len(class_names)} classes: {class_names}")

    # Calculate split sizes
    dataset_size = len(full_ds)
    train_size = int(0.8 * dataset_size)
    val_size = int(0.1 * dataset_size)
    test_size = dataset_size - train_size - val_size

    print(f"Total batches: {dataset_size}")
    print(f"Train batches: {train_size}, Val batches: {val_size}, Test batches: {test_size}")

    # Split dataset
    train_ds = full_ds.take(train_size)
    val_ds = full_ds.skip(train_size).take(val_size)
    test_ds = full_ds.skip(train_size + val_size)

    # Autotune for performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names

def get_augmentation_layer():
    """
    Returns a Sequential model for data augmentation.
    """
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.1),
        tf.keras.layers.RandomContrast(0.1),
    ])
    return data_augmentation

if __name__ == "__main__":
    train_ds, val_ds, test_ds, class_names = load_dataset()
    print("Dataset loaded successfully.")
