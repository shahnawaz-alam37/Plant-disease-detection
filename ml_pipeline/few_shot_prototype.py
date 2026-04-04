import tensorflow as tf
import numpy as np
from dataset_loader import load_dataset, IMG_SIZE
from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = "plant_disease_model.keras"

def get_feature_extractor(model_path):
    """
    Loads the trained model and removes the classification head
    to get the feature extractor (embeddings).
    """
    full_model = tf.keras.models.load_model(model_path)
    # The layer before the final Dense layer is 'global_average_pooling2d' (or similar)
    # We can inspect the model to find it, or just construct a new model 
    # using the same inputs and the output of the pooling layer.
    
    # Assuming the structure from train_model.py:
    # Input -> Augmentation -> Preprocess -> MobileNetV2 -> Pooling -> Dropout -> Dense
    
    # Let's find the pooling layer by name or index. 
    # In our script, it's likely layer -3 or -2 depending on Dropout.
    
    # A safer way is to use the base model output if we can access it, 
    # but since we saved the whole model, let's just truncate it.
    
    feature_extractor = tf.keras.Model(
        inputs=full_model.input,
        outputs=full_model.layers[-3].output # GlobalAveragePooling2D
    )
    return feature_extractor

def compute_prototypes(feature_extractor, support_set):
    """
    Computes class prototypes from a support set.
    support_set: dict {class_name: [images]}
    """
    prototypes = {}
    for class_name, images in support_set.items():
        images = np.array(images)
        embeddings = feature_extractor.predict(images, verbose=0)
        # Prototype is the mean of embeddings
        prototype = np.mean(embeddings, axis=0)
        prototypes[class_name] = prototype
    return prototypes

def classify_query(feature_extractor, prototypes, query_image):
    """
    Classifies a query image by finding the nearest prototype.
    """
    query_embedding = feature_extractor.predict(np.expand_dims(query_image, axis=0), verbose=0)
    
    best_class = None
    max_similarity = -1.0
    
    for class_name, prototype in prototypes.items():
        # Cosine similarity
        sim = cosine_similarity(query_embedding, prototype.reshape(1, -1))[0][0]
        if sim > max_similarity:
            max_similarity = sim
            best_class = class_name
            
    return best_class, max_similarity

def run_demo():
    print("Loading dataset for few-shot demo...")
    _, _, test_ds, class_names = load_dataset()
    
    print("Loading feature extractor...")
    try:
        feature_extractor = get_feature_extractor(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Please train the model first using train_model.py")
        return

    # Simulate a support set (3 classes, 5 images each)
    # We'll just take some images from the test set
    print("Building support set (5-shot)...")
    support_set = {}
    query_images = []
    query_labels = []
    
    # Iterate through dataset to find examples
    # This is a bit inefficient but works for a demo
    iterator = iter(test_ds.unbatch())
    
    target_classes = class_names[:3] # Pick first 3 classes
    counts = {c: 0 for c in target_classes}
    
    while any(c < 6 for c in counts.values()): # 5 support + 1 query
        image, label = next(iterator)
        class_idx = np.argmax(label)
        class_name = class_names[class_idx]
        
        if class_name in target_classes:
            if counts[class_name] < 5:
                if class_name not in support_set:
                    support_set[class_name] = []
                support_set[class_name].append(image)
                counts[class_name] += 1
            elif counts[class_name] == 5:
                query_images.append(image)
                query_labels.append(class_name)
                counts[class_name] += 1
                
    print("Computing prototypes...")
    prototypes = compute_prototypes(feature_extractor, support_set)
    
    print("\n--- Few-Shot Classification Results ---")
    correct = 0
    for i, query_img in enumerate(query_images):
        true_label = query_labels[i]
        pred_label, conf = classify_query(feature_extractor, prototypes, query_img)
        
        is_correct = (true_label == pred_label)
        if is_correct: correct += 1
        
        print(f"Query {i+1}: True={true_label}, Pred={pred_label} ({conf:.4f}) [{'OK' if is_correct else 'FAIL'}]")
        
    print(f"\nAccuracy on {len(query_images)} queries: {correct/len(query_images)*100:.1f}%")

if __name__ == "__main__":
    run_demo()
