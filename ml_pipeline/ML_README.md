# Plant Disease Detection - ML Pipeline

This directory contains the machine learning code for the Plant Disease Detection app.

## Setup

1.  Install Python 3.8+.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Dataset

The pipeline expects the **PlantVillage** dataset at:
`C:\Users\mdkai\Desktop\React Application\PlantVillage-Dataset-master\raw\color`

## Scripts

### 1. Data Loading (`dataset_loader.py`)
Handles loading images, splitting into Train/Val/Test, and data augmentation.

### 2. Training (`train_model.py`)
Trains a **MobileNetV2** model using transfer learning.
-   **Base**: MobileNetV2 (ImageNet weights)
-   **Epochs**: 10 (with early stopping)
-   **Output**: `plant_disease_model.keras`

Run:
```bash
python train_model.py
```

### 3. Evaluation (`evaluate.py`)
Evaluates the trained model on the test set and prints a classification report.

Run:
```bash
python evaluate.py
```

### 4. Export (`export_model.py`)
Converts the Keras model to **TensorFlow Lite** format for mobile deployment.
-   **Optimization**: Default quantization.
-   **Output**: `plant_disease_model.tflite`

Run:
```bash
python export_model.py
```

### 5. Few-Shot Demo (`few_shot_prototype.py`)
Demonstrates how to use the trained backbone for few-shot learning (adapting to new classes with few examples).

Run:
```bash
python few_shot_prototype.py
```
