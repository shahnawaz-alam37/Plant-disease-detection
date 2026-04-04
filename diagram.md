# System Architecture — Plant Disease Detection Application

---

## 1. Overview

The Plant Disease Detection system follows a **client-server architecture** where a cross-platform mobile application (React Native + Expo) communicates with a Python-based Flask inference server over HTTP. The mobile app handles image capture, user interaction, and result presentation, while the server handles image preprocessing, model inference, and disease information lookup.

Two actor roles interact with the system:

- **Farmer / User** — Captures leaf images, receives diagnoses, views scan history, and accesses treatment recommendations through the mobile app.
- **Developer / Admin** — Maintains the server, improves the ML model, and manages the disease knowledge base.

```
┌──────────────┐                              ┌──────────────┐
│   Developer  │                              │ Farmer/User  │
└──────┬───────┘                              └──────┬───────┘
       │                                             │
       │  Maintenance                                │  Upload Photo
       │  Enhance Model                              │  Get Diagnosis
       │  Manage Data                                │  Check History
       │                                             │  Learn Treatment
       ▼                                             ▼
┌──────────────────┐          HTTP           ┌──────────────────┐
│   Flask Server   │◄────────────────────────│   Mobile App     │
│   (Backend)      │────────────────────────►│   (Frontend)     │
└──────────────────┘        JSON             └──────────────────┘
```

---

## 2. Frontend — Mobile Application

**Technology**: React Native 0.81 + Expo SDK 54 + TypeScript

The mobile app is the farmer's sole interface with the system. It is organized into three layers:

### 2.1 UI Layer (Screens)

| Screen | Purpose |
|--------|---------|
| **HomeScreen** | Dashboard showing supported crops (14), disease classes (38), model accuracy. Quick access to all features. |
| **CaptureScreen** | Camera viewfinder with grid overlay for framing. Supports both live capture and gallery upload. |
| **ResultScreen** | Displays diagnosis result — disease name, confidence score, image quality score, symptoms, prevention, and PDF report download. |
| **HistoryScreen** | Chronological list of past scans with date, diagnosis, and confidence. |
| **SpeciesScreen** | Knowledge Hub — disease information organized by plant species. |
| **AboutScreen** | App information and user guide. |

### 2.2 Service Layer (Business Logic)

| Service | Role |
|---------|------|
| **mlService.ts** | Routes the captured image to the Flask server via HTTP POST (`/predict`). Parses the JSON response and returns structured diagnosis data to the UI. If the server is unreachable, falls back to offline mode. |
| **LocalMLService.ts** | Offline fallback. Performs basic color-analysis heuristics (green, brown, yellow pixel ratios) on the image locally to provide an approximate diagnosis when no network is available. |

### 2.3 State & Theme Layer

| Module | Role |
|--------|------|
| **Zustand Store** | Manages global app state: model readiness flag, scan history array, last prediction result. |
| **ThemeContext** | Provides dark/light mode toggle with AsyncStorage persistence. |

### 2.4 Inference Flow (Inside the App)

```
User captures/selects image
        │
        ▼
┌─────────────────────┐
│  mlService.ts        │
│  • Convert to form-  │
│    data (multipart)  │
│  • POST to server    │
└────────┬────────────┘
         │
    ┌────▼────┐
    │ Server  │──── reachable? ────► YES ──► Send image, await JSON response
    │ check   │                                        │
    └────┬────┘                                        ▼
         │                                Parse response:
      NO │                                 • disease class
         ▼                                 • confidence (calibrated)
┌──────────────────┐                       • quality score
│ LocalMLService   │                       • symptoms & prevention
│ (offline mode)   │                       • top-3 predictions
│ Color heuristics │                                   │
└────────┬─────────┘                                   │
         │                                             │
         └────────────────┬────────────────────────────┘
                          ▼
                   ResultScreen
                   (display to farmer)
```

---

## 3. Backend — Flask Inference Server

**Technology**: Python 3.x + Flask + TensorFlow/Keras + OpenCV

The server is a stateless REST API that loads the trained `.keras` model at startup and serves predictions on demand.

### 3.1 API Endpoints

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/predict` | POST | Image file (multipart/form-data) | Disease class, confidence, quality score, symptoms, prevention, top-3 predictions |
| `/health` | GET | — | Server status, model loaded flag, version |
| `/validate` | POST | Image file | Quality score and issues only (no prediction) |
| `/classes` | GET | — | List of all 38 supported class names |

### 3.2 Prediction Pipeline (Server-Side)

When the server receives an image at `/predict`, the following steps execute sequentially:

```
Incoming image (any size, JPEG/PNG)
        │
        ▼
┌─────────────────────────┐
│ 1. Image Quality Check  │  Brightness, contrast, sharpness (Laplacian),
│    validate_image()     │  green content (HSV), dimensions
│                         │  → quality_score (0–100), issues list
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 2. Preprocessing        │  CLAHE lighting normalization (LAB space),
│    preprocess_image()   │  smart center crop, resize to 224×224,
│                         │  normalize pixel values to [0, 1]
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 3. Model Inference      │  TensorFlow model.predict()
│    + Multi-crop TTA     │  5 crops (center + 4 corners) averaged
│                         │  → 38-class softmax probabilities
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4. Post-Processing      │  • Select top prediction
│    calibrate_confidence │  • Calibrate confidence using entropy
│                         │    and quality score
│                         │  • Look up disease info (symptoms,
│                         │    prevention) from knowledge base
│                         │  • Build top-3 predictions list
└────────┬────────────────┘
         │
         ▼
     JSON Response → Mobile App
```

### 3.3 Confidence Calibration

The raw softmax probability is adjusted to provide a more reliable confidence score:

```
calibrated = raw_confidence × quality_factor × entropy_factor

quality_factor  = 0.7 + 0.3 × (quality_score / 100)     → range: 0.7–1.0
entropy_factor  = 1.0 − (normalized_entropy²) × 0.4      → max 40% penalty
```

Low image quality or high prediction uncertainty both reduce the reported confidence, giving farmers a more honest indication of how trustworthy the diagnosis is.

### 3.4 Disease Knowledge Base

The server contains a hardcoded dictionary of disease information for all 38 classes. Each entry includes:

- **Symptoms** — Visual signs to look for on leaves, stems, and fruit
- **Prevention** — Cultural practices, resistant varieties, environmental management
- **Treatment** — Recommended chemical or organic interventions

This data is returned alongside every prediction so the farmer immediately receives actionable guidance.

---

## 4. Communication Protocol

```
Mobile App                                    Flask Server
    │                                              │
    │── HTTP POST /predict ──────────────────────►│
    │   Content-Type: multipart/form-data          │
    │   Body: { image: <file> }                    │
    │                                              │
    │                                              │── validate quality
    │                                              │── preprocess (CLAHE, crop, resize)
    │                                              │── model.predict (TTA)
    │                                              │── calibrate confidence
    │                                              │── lookup disease info
    │                                              │
    │◄── 200 OK ──────────────────────────────────│
    │   {                                          │
    │     "class": "Tomato - Early Blight",        │
    │     "confidence": 64.3,                      │
    │     "raw_confidence": 66.2,                  │
    │     "quality": {                             │
    │       "score": 85,                           │
    │       "issues": []                           │
    │     },                                       │
    │     "symptoms": ["Dark concentric rings..."],│
    │     "prevention": ["Rotate crops...", ...],  │
    │     "top_predictions": [                     │
    │       {"class": "...", "confidence": ...},   │
    │       ...                                    │
    │     ]                                        │
    │   }                                          │
```

---

## 5. Developer vs Farmer — Interaction Summary

### 5.1 Developer Functions

| Function | What It Covers |
|----------|----------------|
| **System Updates** | Server deployment, dependency updates, API versioning, uptime monitoring |
| **Model Improvements** | Retraining on new data, tuning hyperparameters, evaluating accuracy, deploying updated `.keras` files |
| **Database Management** | Adding new disease classes, updating symptoms/treatment info, validating training data |

### 5.2 Farmer Functions

| Function | What It Covers |
|----------|----------------|
| **Upload Photo** | Capture via camera or select from gallery → sent to server |
| **Get Diagnosis** | Receive disease name, confidence, quality score, symptoms, prevention |
| **Check Past Results** | Browse scan history to track crop health over time |
| **Learn Treatment** | Read detailed treatment and prevention recommendations for detected diseases |
| **Download Report** | Generate and share a PDF diagnostic report |

---

## 6. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile App | React Native + Expo SDK 54 | Cross-platform UI |
| Language (App) | TypeScript | Type-safe development |
| State | Zustand | Lightweight global state |
| Navigation | React Navigation 7.x | Tab + Stack navigation |
| Backend | Flask (Python) | REST API server |
| ML Framework | TensorFlow / Keras | Model inference |
| Image Processing | OpenCV, Pillow | Quality validation, CLAHE |
| PDF Generation | expo-print | HTML → PDF reports |
| Theme Storage | AsyncStorage | Dark/light mode persistence |
