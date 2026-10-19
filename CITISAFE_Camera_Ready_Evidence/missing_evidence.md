# Catalog of Missing Evidence and Experimental Blockers

This document specifies the exact missing artifacts, data files, and experimental logs required to defend the CITISAFE manuscript in its current form.

---

## 1. Missing Physical Artifacts

| Missing Artifact | Manuscript Citation | Expected File or Format | Current Status | Exact Blocker to Reproduction | Minimum Required Input |
|---|---|---|---|---|---|
| **BDD100K Dataset Split** | Section V-A ("Aggregated data from BDD100K") | Image files + label JSON / split manifest | **Missing** | Zero files from BDD100K exist in the workspace. | Download BDD100K subset, extract images, and provide split manifest (`test_bdd100k.txt`). |
| **UA-DETRAC Dataset** | Section V-A ("Specifically tailored for vehicle detection") | Image frames + XML annotations | **Missing** | Zero files from UA-DETRAC exist in the workspace. | Provide UA-DETRAC frames used for pretraining or evaluation. |
| **AI City Challenge Footage** | Section V-A ("Extensive traffic camera footage for anomaly") | Video files + ground truth anomaly intervals | **Missing** | Zero files from AI City exist in the workspace. | Provide AI City test video IDs and annotation files. |
| **"No Incident" Class Data** | Section V-D.1 (4,680 test samples claimed) | 4,680 negative traffic images/videos | **Missing** | The accident dataloader only handles `minor`, `moderate`, `major`. | Collect or curate a negative set of non-incident traffic footage. |
| **Raw Prediction Logs for 12,865 Test Set** | Section V-D.1 (Full confusion matrix) | `y_true.npy`, `y_pred.npy`, `results.csv` | **Missing** | No prediction file or raw probability array exists in the repository. | If evaluated on another cluster, export and copy the raw predictions array. |
| **Training History & Loss Curves** | Section V-B ("50 epochs with ReduceLROnPlateau") | `history.json`, `train_loss.csv`, TensorBoard logs | **Missing** | Checkpoints exist, but epoch-by-epoch loss/accuracy history was not saved. | Run a tracked training run using `backend/ml_pipeline/train.py` with CSV logging enabled. |
| **RTX 3090 Latency Logs** | Section V-D.3 (36.8 ms total latency table) | Latency benchmark log file or timing script | **Missing** | No benchmark script or output log on RTX 3090 exists. | Benchmark on a machine equipped with RTX 3090 using the provided reproduction script. |

---

## 2. Missing Baseline and Ablation Experiments

### Experiment 1: Vision-Only ResNet-50 Baseline
- **What is missing**: Evaluation of the ResNet-50 visual model without any NLP keyword heuristics on the claimed test set.
- **Why it cannot be run immediately**:
  - The ResNet-50 4-class checkpoint (`backend/ml_pipeline/best_model.pth`) was evaluated on the local 3-class test set during this audit, but it predicted class 0, 1, and 3, yielding 0 predictions for class 2.
  - The claimed 12,865 multimodal dataset does not physically exist in the workspace.

### Experiment 2: NLP-Only Baseline
- **What is missing**: Evaluation of the keyword heuristic alone across a ground-truth textual dataset.
- **Why it cannot be run immediately**:
  - `dataset/Accident` contains only `.mp4` video files without associated textual incident descriptions.
  - No text dataset with paired severity annotations exists in the workspace.

### Experiment 3: Trust Scoring Ablation
- **What is missing**: Comparative evaluation of classification accuracy / false dispatch rate with trust scoring enabled versus disabled.
- **Why it cannot be run immediately**:
  - Requires user identity, historical reputation scores, and noisy/spam report simulations, which are not present in the dataset.

### Experiment 4: Alternative Backbone Comparisons
- **What is missing**: Empirical benchmark comparing ResNet-50 against MobileNetV3 and EfficientNet-B0 on the same test dataset.
- **Status update from this audit**:
  - EfficientNet-B0 and ResNet-18 were empirically benchmarked on `dataset/Accident/test` during this audit:
    - **ResNet-18**: 65.33% Accuracy, 65.26% Macro F1
    - **EfficientNet-B0**: 35.56% – 39.11% Accuracy, 29.65% – 35.18% Macro F1
  - MobileNetV3 weights are not present in the repository.

---

## 3. Minimum Inputs Required from the Lead Researcher

To make the research defensible without rewriting the dataset and sample size claims, the researcher must provide:
1. The original **12,865-sample test manifest** or folder containing the test images/frames.
2. The exact **ground-truth array** (`y_true`) and **model prediction probabilities** (`y_pred`) from the run reported in `Experiments_and_Results.md`.
3. The **text descriptions** paired with each test image that were fed to `fusion.py` to produce the NLP keyword scores.
4. The GPU server environment or terminal logs from the NVIDIA RTX 3090 timing run.

*If these files cannot be retrieved, the manuscript must be revised to reflect the actual 1,500-sample, 3-class system verified in this repository.*
