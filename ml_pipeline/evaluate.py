import tensorflow as tf
import numpy as np
from dataset_loader import load_dataset
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

MODEL_PATH = "plant_disease_model.keras"

def evaluate():
    print("Loading dataset...")
    _, _, test_ds, class_names = load_dataset()
    
    print(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print("Evaluating on test set...")
    loss, accuracy = model.evaluate(test_ds)
    print(f"Test Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")
    
    # Get predictions
    print("Generating predictions for confusion matrix...")
    y_true = []
    y_pred = []
    
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(preds, axis=1))
        
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))
    
    # Optional: Save confusion matrix plot
    # cm = confusion_matrix(y_true, y_pred)
    # ... plotting code ...

if __name__ == "__main__":
    evaluate()
