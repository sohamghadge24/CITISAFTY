# CITISAFE Repository Inventory

## 1. Scope and Structure of Investigated Workspaces

Two active project workspaces were audited on local machine:
1. **Primary Research & Implementation Workspace**: `/Users/sohamghadge/Documents/project/traffic_project_app` (Git origin: `sohamghadge24/CITISAFTY`)
2. **Secondary Prototype Workspace**: `/Users/sohamghadge/Documents/project/traffic project_tested` (Local FastAPI and React web service prototype)

---

## 2. Model Checkpoint Inventory

A physical audit of all `.pth` model checkpoints in the repository was conducted using PyTorch `torch.load()`. Below is the complete manifest of model weights:

| File Path | File Size | Internal Backbone Architecture | Penultimate Feature Dim | Final Output Layer Shape | Classes / Target Task | Checksum (SHA-256) |
|---|---|---|---|---|---|---|
| `best_model_accident.pth` (root) | 45,842,591 bytes (43.7 MB) | **ResNet-18** (`conv1`, `layer1`-`layer4`) | 512 | `fc.3`: `Linear(512, 3)` | 3 Classes (`Low`, `Medium`, `High`) | `1df6e5a816a8cebf82a6a4dfc1b6181624cde9594ddee288780df2021ec056a9` |
| `best_model_scratch.pth` (root) | 98,550,419 bytes (93.9 MB) | **ResNet-50** (`conv1`, `layer1`-`layer4`) | 2048 | `fc.3`: `Linear(512, 2)` | 2 Classes (`no_scratch`, `scratch`) | `f878541adce39b6f71b59f135207b9bd068506ff15ab3ebaa877e97bc864e4a1` |
| `backend/best_model_accident.pth` | 16,343,319 bytes (15.6 MB) | **EfficientNet-B0** (`features.0`-`7`) | 1280 | `classifier.1`: `Linear(1280, 3)` | 3 Classes (`Low`, `Medium`, `High`) | `0673ab47df13113d7d6efafcd51ac6176add855f67af5eb721efff7b671c5025` |
| `backend/ml_pipeline/best_model_accident.pth` | 16,343,319 bytes (15.6 MB) | **EfficientNet-B0** (`features.0`-`7`) | 1280 | `classifier.1`: `Linear(1280, 3)` | 3 Classes (`Low`, `Medium`, `High`) | `74e00228dcd44ca474c4ae17f41328f03aea94791bf6f877c6a2e68058d39a99` |
| `backend/ml_pipeline/best_model.pth` | 98,551,891 bytes (93.9 MB) | **ResNet-50** (`conv1`, `layer1`-`layer4`) | 2048 | `fc.3`: `Linear(512, 4)` | 4 Classes (`Low`, `Medium`, `High`, `Critical`) | `e820b6e339eb2d01026b28bee2218d0b14e7908269c2d4a0a205394c93606a11` |
| `backend/app/services/best_model.pth` | 98,551,891 bytes (93.9 MB) | **ResNet-50** (`conv1`, `layer1`-`layer4`) | 2048 | `fc.3`: `Linear(512, 4)` | 4 Classes (`Low`, `Medium`, `High`, `Critical`) | `2028ab9263d8123533afbeea24299442695d882c9eace428a9f2f40e9e2fb423` |

### Critical Architecture Discovery:
1. The model titled `best_model_accident.pth` in the project root is **ResNet-18** (512 features), not ResNet-50.
2. The checkpoints in `backend/ml_pipeline/best_model.pth` and `backend/app/services/best_model.pth` are indeed **ResNet-50** with a custom head `Linear(2048, 512) -> ReLU -> Dropout(0.3) -> Linear(512, 4)`. However, the 4 classes in code correspond to `["Low", "Medium", "High", "Critical"]` (see [fusion.py:L9](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L9)), whereas the manuscript claims `["No Incident", "Low Severity", "Medium Severity", "High Severity"]`.
3. The latest trained accident model in `backend/` is **EfficientNet-B0** with 3 classes (`Low`, `Medium`, `High`).

---

## 3. Physical Datasets Present in Workspace

| Directory Path | Format | Class Folders / Content | Total Count | Verification Status |
|---|---|---|---|---|
| `dataset/Accident/train/` | `.mp4` video clips | `minor` (350), `moderate` (350), `major` (350) | 1,050 | **Verified** |
| `dataset/Accident/val/` | `.mp4` video clips | `minor` (75), `moderate` (75), `major` (75) | 225 | **Verified** |
| `dataset/Accident/test/` | `.mp4` video clips | `minor` (75), `moderate` (75), `major` (75) | 225 | **Verified** |
| `dataset/Traffic_Violation/Training data/` | `.jpg`, `.png` images | `helmet` (600), `no_helmet` (599), `overloading` (600) | 1,799 | **Verified** |
| `dataset/Traffic_Violation/validation data/` | `.jpg`, `.png` images | `helmet` (100), `no_helmet` (100), `overloading` (100) | 300 | **Verified** |
| `dataset/Traffic_Violation/Test data/` | `.jpg`, `.png` images | `helmet` (100), `no_helmet` (100), `overloading` (100) | 300 | **Verified** |
| `dataset/ scratch_car/` | `.jpg` images + `labels.csv` | `labels.csv` (8,079 rows), `images/` (8,079 images) | 8,079 | **Verified** |
| `dataset1/` | `.png` images | `low` (21), `medium` (11), `high` (18) | 50 | **Verified** |
| **BDD100K** | Benchmark images / annotations | None found | 0 | **Missing** |
| **UA-DETRAC** | Benchmark images / annotations | None found | 0 | **Missing** |
| **AI City Challenge** | Benchmark videos / annotations | None found | 0 | **Missing** |

---

## 4. Source Code and Pipeline Manifest

### Backend Pipeline Components (`traffic_project_app/backend/`)
- [backend/ml_pipeline/train.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/train.py):
  Training entrypoint. Modified to train EfficientNet-B0 on 3 classes using Focal Loss and AdamW with learning rate 0.0001. Previous version trained ResNet-18.
- [backend/ml_pipeline/validate.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/validate.py):
  Validation script evaluating on test splits using Scikit-Learn `classification_report` and `confusion_matrix`.
- [backend/ml_pipeline/dataset.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py):
  Dataset classes: `TrafficSeverityDataset` (extracts frame 10 from mp4 video clips), `TrafficViolationDataset`, `CarScratchDataset`. Albumentations transforms: resize 256, center crop 224, ImageNet normalization.
- [backend/app/services/fusion.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py):
  Multimodal fusion engine. Combines ResNet visual confidence with keyword string heuristics and trust score adjustment.
- [backend/app/services/inference.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/inference.py):
  ResNet-50 inference wrapper loading `best_model.pth`.
- [backend/app/services/ml_service.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/ml_service.py):
  Asynchronous thread pool executor calling `calculate_severity_hybrid`.
- [backend/app/services/severity_service.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/severity_service.py):
  Rule clamp: Prevents AI severity from exceeding user-reported severity.
- [backend/app/ml/engine.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/ml/engine.py):
  Alternative 2-stage inference pipeline: Simulated YOLOv8 center crop + EfficientNet-B0 inference + mock Grad-CAM overlay.
- [backend/app/ml/relevance_filter.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/ml/relevance_filter.py):
  Text keyword filter to identify traffic context (`traffic`, `road`, `accident`, etc.).

---

## 5. Databases and Logs

- **SQLite Database (`backend/traffic_local.db`)**:
  Contains 2 tables: `road_segments` (0 rows) and `incidents` (12 rows). The 12 rows record user test reports from May 14-15, 2026.
- **Git Commit History**:
  - `c68d3f8a` (HEAD -> main): Resolved README merge conflict
  - `54296fd8`: Initial commit for CITISAFTY project (introduced `Experiments_and_Results.md`, model weights, and initial code)
- **Experimental Logs / CSVs / JSONs**:
  No historical training run logs, tensorboard runs, or evaluation logs existed in the repository prior to this audit. All empirical validation logs have now been generated and saved into `CITISAFE_Camera_Ready_Evidence/logs/`.
