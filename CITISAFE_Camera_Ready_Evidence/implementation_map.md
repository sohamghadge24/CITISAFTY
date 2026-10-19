# CITISAFE Implementation Map

This document establishes direct traceability between the claims made in the research manuscript and the actual source code, classes, functions, and parameters in the repository.

---

## Traceability Matrix: Manuscript Claims vs. Codebase Reality

| Component / Claim | Manuscript Description | Actual Source File & Class/Function | Actual Implementation Status | Detailed Implementation Finding |
|---|---|---|---|---|
| **1. ResNet-50 Architecture & Head** | ResNet-50 initialized with ImageNet weights, custom FC head for 4 severity classes. | [backend/app/services/inference.py:L33-L70](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/inference.py#L33-L70) (`InferenceService.load_model`) | **Verified in inference; Modified in training** | `InferenceService` loads `models.resnet50(pretrained=False)` and sets `fc = Sequential(Linear(2048, 512), ReLU(), Dropout(0.3), Linear(512, 4))`. However, [backend/ml_pipeline/train.py:L50-L72](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/train.py#L50-L72) was changed to `models.efficientnet_b0(pretrained=True)` with 3 classes. |
| **2. Image Preprocessing & Normalization** | Resized to 224x224, normalized to [0,1], standardized with ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`. | [backend/ml_pipeline/dataset.py:L240-L259](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L240-L259) (`get_transforms`), [inference.py:L26-L31](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/inference.py#L26-L31) | **Verified** | Validation transform: `Resize(256)`, `CenterCrop(224)`, ImageNet normalization. Training transform uses Albumentations: `Resize(256)`, `RandomResizedCrop(224)`, `HorizontalFlip`, `ShiftScaleRotate`, `ColorJitter`, `CoarseDropout`. |
| **3. Four-Class Severity Classification** | 1. No Incident<br>2. Low Severity<br>3. Medium Severity<br>4. High Severity | [backend/app/services/fusion.py:L9](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L9) (`SEVERITY_LEVELS`), [dataset.py:L12-L28](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L12-L28) | **Contradicted** | In [fusion.py:L9](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L9), the 4 classes are `["Low", "Medium", "High", "Critical"]`. In [dataset.py:L12-L28](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L12-L28), the dataset only supports 3 classes: `{"Low": 0, "Medium": 1, "High": 2}`. There is **no "No Incident" class** in either the accident dataset or training code. |
| **4. NLP Keyword Severity Analysis** | NLP-based incident and severity analysis module. | [backend/app/services/fusion.py:L5-L39](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L5-L39) (`calculate_severity_hybrid`) | **Verified (Rule-based heuristics)** | Implemented strictly via Python `set` membership and string substring matching. No transformer (e.g. BERT/LLM) is used on backend. Keywords: `CRITICAL_KEYWORDS`, `HIGH_KEYWORDS`, `MEDIUM_KEYWORDS`. Returns `nlp_score` $\in \{0.0, 0.4, 0.75, 1.0\}$. |
| **5. Trust Scoring** | Citizen trust scoring for false positive / spam mitigation. | [backend/app/services/fusion.py:L50-L55](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L50-L55), [trust_aggregation_model.py:L11-L36](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/models/trust_aggregation_model.py#L11-L36) | **Verified (Heuristic rules)** | In `fusion.py`: If `user_trust_score < 0.3`, `final_score *= 0.8`. If `user_trust_score > 0.8` and `nlp_score == 1.0`, `final_score = min(final_score * 1.1, 1.0)`. In `trust_aggregation_model.py`: Weighted average: $\sum (\text{trust} \times \text{rep}) / \sum \text{rep}$. |
| **6. Multimodal Visual + NLP Fusion** | Unified decision rules, weights, thresholds, fallback behavior. | [backend/app/services/fusion.py:L40-L65](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L40-L65) (`calculate_severity_hybrid`) | **Verified** | $\alpha = \text{visual\_conf}$, $\beta = 1.0 - \alpha$. $\text{visual\_scalar} = \text{class\_idx} / 3.0$. $\text{final\_score} = (\text{visual\_scalar} \times \alpha) + (\text{nlp\_score} \times \beta)$. Thresholds: $\ge 0.85 \to \text{Critical}$, $\ge 0.60 \to \text{High}$, $\ge 0.35 \to \text{Medium}$, else $\text{Low}$. |
| **7. Training Pipeline** | Adam optimizer, initial lr 1e-4, ReduceLROnPlateau, CrossEntropyLoss, 50 epochs. | [backend/ml_pipeline/train.py:L190-L235](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/train.py#L190-L235) | **Partial / Diverged** | Optimizer: `AdamW` (not Adam), initial lr: 1e-4, scheduler: `ReduceLROnPlateau(patience=3, factor=0.1)`. Loss: `FocalLoss(alpha=[2.0, 3.0, 1.5], gamma=2)` for accident. Default epochs = 30 (not 50). Architecture in script is currently EfficientNet-B0. |
| **8. Real-time Latency (36.8 ms)** | End-to-end processing pipeline achieves 36.8 ms (~27 FPS) on RTX 3090. | [backend/app/services/image_pipeline.py:L11-L44](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/image_pipeline.py#L11-L44), [ml_service.py:L56-L101](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/ml_service.py#L56-L101) | **Discrepant / Unverified** | No benchmark script or timing logs on RTX 3090 exist. Measured timing on CPU reveals NLP keyword matching takes **0.37 microseconds** (not 18.4 ms). The 18.4 ms in the manuscript is completely uncalibrated for keyword lookup. |

---

## Detailed Code Tracing by Component

### Component 1: ResNet-50 Model Initialization
- **File**: `backend/app/services/inference.py`
- **Class**: `InferenceService`
- **Lines**: 33–70
- **Implementation**:
  ```python
  self.model = models.resnet50(pretrained=False)
  num_ftrs = self.model.fc.in_features  # 2048
  self.model.fc = nn.Sequential(
      nn.Linear(num_ftrs, 512),
      nn.ReLU(),
      nn.Dropout(0.3),
      nn.Linear(512, 4)
  )
  ```
- **Weights Loaded**: `best_model.pth` (ResNet-50 4-class checkpoint). If missing, falls back to ImageNet pretrained.

### Component 2: Image Preprocessing Pipeline
- **File**: `backend/ml_pipeline/dataset.py`
- **Class**: `BaseImageDataset` & `TrafficSeverityDataset`
- **Lines**: 31–67, 240–259
- **Implementation**:
  - Image/video frame reading: `cv2.imread()` or `cv2.VideoCapture()` sampling frame index 10.
  - Albumentations transforms convert BGR to RGB, resize, crop, and normalize using ImageNet statistics.

### Component 3: Four-Class Severity Classification
- **Manuscript taxonomy**: `No Incident`, `Low Severity`, `Medium Severity`, `High Severity`
- **Actual code taxonomy in `backend/app/services/fusion.py:L9`**:
  `SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"]`
- **Actual code taxonomy in `backend/ml_pipeline/dataset.py:L12-L28`**:
  ```python
  SEVERITY_CLASSES = {"Low": 0, "Medium": 1, "High": 2}
  FOLDER_MAPPING = {"minor": "Low", "moderate": "Medium", "major": "High"}
  ```
- **Finding**: The training dataset and dataloader never had a "No Incident" class. The 4th class in `inference.py` was "Critical", not "No Incident".

### Component 4: NLP Keyword Analysis
- **File**: `backend/app/services/fusion.py`
- **Function**: `calculate_severity_hybrid`
- **Lines**: 5–39
- **Keywords**:
  - Critical: `{"fire", "flipped", "blood", "trapped", "smoke", "multiple", "death", "fatality", "crash", "collision", "wreckage"}` $\to$ score = 1.0
  - High: `{"blocked", "glass", "injury", "pileup", "broken", "accident", "emergency", "debris", "stopped"}` $\to$ score = 0.75
  - Medium: `{"traffic", "congested", "slow", "delay", "queue"}` $\to$ score = 0.4
- **Matching rule**: Case-insensitive substring check (`k in caption_lower`).
- **Negation handling**: **None implemented**. For example, "No fire, no blood, nobody trapped" triggers `nlp_score = 1.0` (Critical).

### Component 5: Trust and Reputation Scoring
- **File**: `backend/app/services/fusion.py`
- **Lines**: 50–55
- **Formulas**:
  - If `user_trust_score < 0.3`: $\text{score} \leftarrow \text{score} \times 0.8$
  - If `user_trust_score > 0.8` and `nlp_score == 1.0`: $\text{score} \leftarrow \min(\text{score} \times 1.1, 1.0)$
- **File**: `backend/app/models/trust_aggregation_model.py`
- **Lines**: 11–36:
  $$\text{Aggregated Trust} = \frac{\sum_{i} \text{raw\_trust}_i \times \text{reputation}_i}{\sum_{i} \text{reputation}_i}$$

### Component 6: Multimodal Decision Fusion
- **File**: `backend/app/services/fusion.py`
- **Lines**: 40–65
- **Weights**:
  - $\alpha = \text{visual\_conf}$ (model softmax probability of top class)
  - $\beta = 1.0 - \alpha$
  - $\text{visual\_scalar} = \text{visual\_class\_idx} / 3.0$
  - $\text{final\_score} = (\text{visual\_scalar} \times \alpha) + (\text{nlp\_score} \times \beta)$
- **Severity Decision Tree**:
  - $\text{final\_score} \ge 0.85 \implies \text{Critical}$
  - $\text{final\_score} \ge 0.60 \implies \text{High}$
  - $\text{final\_score} \ge 0.35 \implies \text{Medium}$
  - $\text{Else} \implies \text{Low}$

### Component 7: User-Clamping Rule in `severity_service.py`
- **File**: `backend/app/services/severity_service.py`
- **Function**: `normalize_severity`
- **Lines**: 10–20
- **Implementation**:
  ```python
  severityMap = {
      "critical": ["critical", "high"],
      "high": ["high", "medium"],
      "medium": ["medium", "low"],
      "low": ["low"]
  }
  return random.choice(options).capitalize()
  ```
- **Finding**: A heuristic function in `severity_service.py` randomly picks between the user's selected severity and one level lower. This is an operational safeguard, not a machine-learned prediction.
