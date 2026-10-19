# Research & Dataset Alignment Strategy

This document outlines the academic data sources and pre-training strategies used to align the **SafeCity Intelligence** platform with state-of-the-art traffic research.

## 📚 Public Datasets Integrated

### 1. BDD100K (Berkeley DeepDrive)
*   **Role**: Primary pre-training dataset for road scene perception.
*   **Application**: used to train the feature extraction backbone (ResNet50) to recognize diverse road environments, day/night variations, and weather conditions.
*   **Citable Metrics**: Robustness in object detection and semantic segmentation.

### 2. AI City Challenge (AICity)
*   **Role**: Validation and benchmarking for incident detection.
*   **Application**: The system's incident severity logic is validated against AICity datasets to ensure high precision in identifying congestion, accidents, and road violations.
*   **IEEE Alignment**: Follows standard track protocols for traffic anomaly detection.

### 3. UA-DETRAC (University at Albany - DEtection and TRACking)
*   **Role**: Behavioral analysis and violation detection pre-training.
*   **Application**: Specifically used for fine-tuning the model to detect **Illegal Parking** and **Lane Obstructions**. The vehicle behavior patterns in UA-DETRAC provide the ground truth for our "Low Complexity" detection modules.

---

## 🏗️ Pre-Training Pipeline

The ML Backend (`backend/app/ml/engine.py`) is architected to support:
1.  **Transfer Learning**: Leveraging feature descriptors from BDD100K.
2.  **Domain Adaptation**: Fine-tuning on UA-DETRAC for localized urban traffic patterns.
3.  **Cross-Validation**: Using AICity benchmarks to adjust the probabilistic decision thresholds in the Rule Engine.

## 🎓 Academic Contribution (IEEE/Conference Ready)

The modular nature of this architecture allows researchers to:
*   Swap the `feature_extractor` with newer vision transformers (ViT) pre-trained on these datasets.
*   Use the `SeverityDecisionEngine` as a baseline for measuring multi-modal traffic analysis (Vision + Geospatial Context).
