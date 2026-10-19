# SafeCity Intelligence: ML Architecture & Severity Logic

This document outlines the technical implementation of our Hybrid Decision-Based Perception engine. The system combines Computer Vision (CV) with Natural Language Processing (NLP) heuristics to categorize traffic incidents and trigger emergency response protocols.

## 1. Core Model Architecture

The perception layer utilizes a **ResNet-50 (Residual Network)** architecture, a deep convolutional neural network known for high performance in image feature extraction.

- **Engine**: PyTorch Backend
- **Base Model**: `resnet50` (Pre-trained on ImageNet-1K)
- **Input Pipeline**: 
    - Resized to `256x256`
    - Center Cropped to `224x224`
    - Normalized using Standard ImageNet distribution (Mean: `[0.485, 0.456, 0.406]`, Std: `[0.229, 0.224, 0.225]`)

## 2. Severity Calculation (The Hybrid Logic)

The system does not rely solely on the image. It uses a **Hybrid Perception** approach that merges visual features with human description.

### A. Visual Feature Scoring
The model extracts a high-dimensional feature map from the image. We compute a scalar `score` based on the mean activation level of these features. 
- Higher activation levels generally correlate with visual anomalies (e.g., unusual shapes, debris, smoke).

### B. Natural Language Heuristics
The engine scans the user-provided description for specific triggers:
- **Level 1 (Critical Keywords)**: `fire`, `flipped`, `blood`, `trapped`, `smoke`, `multiple`.
- **Level 2 (Major Keywords)**: `crash`, `blocked`, `glass`, `injury`.

### C. Decision Matrix
The Final Severity is determined by the following priority queue:

| Severity | Logic Condition | Triggered Action |
| :--- | :--- | :--- |
| **CRITICAL** | Visual Score > 0.8 **OR** any Level 1 Keyword | Ambulance + Fire + Police Dispatch (Priority 1) |
| **HIGH** | Visual Score > 0.6 **OR** any Level 2 Keyword | Ambulance + Fire + Police Dispatch (Priority 1) |
| **MEDIUM** | Visual Score > 0.3 | Traffic Police + Towing Service (Priority 2) |
| **LOW** | Default (Fallthrough) | Traffic Police + Towing Service (Priority 2) |

## 3. Asynchronous Inference Pipeline

To ensure the web interface remains responsive during heavy computation, inference is handled via an asynchronous thread-pool:

1. **API Receive**: The FastAPI endpoint receives the image (base64) and metadata.
2. **Offloading**: The request is handed to a `ThreadPoolExecutor` to prevent blocking the main event loop.
3. **Synchronization**: Once inference is complete, the results are merged with the textual analysis and returned to the dashboard.

## 4. Retraining & Evolution
In production, every verified report is appended to a training queue. This allows the model to periodically re-learn the specific visual characteristics of Indian road conditions, improving its `confidence` score over time.
