import tensorflow as tf
import os

MODEL_PATH = "plant_disease_model.keras"
TFLITE_PATH = "plant_disease_model.tflite"

def export_tflite():
    print(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimization: Default Quantization (reduces size, improves speed)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    print("Converting to TFLite...")
    tflite_model = converter.convert()
    
    print(f"Generated TFLite model size: {len(tflite_model)} bytes")
    
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)
        
    print(f"Model saved to {TFLITE_PATH}")
    print(f"Size: {os.path.getsize(TFLITE_PATH) / 1024 / 1024:.2f} MB")

    # Save classes.json
    import json
    try:
        with open("class_names.txt", "r") as f:
            classes = [line.strip() for line in f.readlines()]
        
        with open("classes.json", "w") as f:
            json.dump(classes, f)
            
        print("Saved classes.json")
        
        # Copy to App Assets
        import shutil
        APP_ASSETS_DIR = r"c:\Users\mdkai\Desktop\React Application\PlantDiseaseApp\assets"
        
        shutil.copy(TFLITE_PATH, os.path.join(APP_ASSETS_DIR, "plant_disease_model.tflite"))
        shutil.copy("classes.json", os.path.join(APP_ASSETS_DIR, "classes.json"))
        print(f"Copied model and classes to {APP_ASSETS_DIR}")
        
    except Exception as e:
        print(f"Error saving/copying classes: {e}")
