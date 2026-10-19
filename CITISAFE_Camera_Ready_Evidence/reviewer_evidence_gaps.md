# Reviewer Evidence Gaps Analysis

This document provides a prioritized gap analysis against standard reviewer expectations for IEEE/ACM smart city and computer vision manuscripts.

---

## 1. Prioritized Gap Assessment

| Reviewer Expectation / Requirement | Current Manuscript Claim | Physical Evidence in Repository | Risk Level | Required Action to Satisfy Reviewers |
|---|---|---|---|---|
| **Gap 1: Evidence of Benchmark Datasets (BDD100K, UA-DETRAC, AI City)** | Claims 12,865 test samples aggregated from BDD100K, UA-DETRAC, and AI City Challenge. | **Zero files, manifests, or logs** from these datasets exist in the repository. Physical dataset has only 1,500 clips. | **CRITICAL** | Either download and benchmark on the true benchmark subsets with exact manifests, OR rewrite Section V-A to accurately describe the actual 1,500-sample dataset evaluated. |
| **Gap 2: Fourth Class ("No Incident") Ground Truth** | Claims 4,680 "No Incident" samples in test set with 96.5% accuracy. | `dataset/Accident` contains only 3 classes: `minor`, `moderate`, `major`. Dataloader has no negative class. | **CRITICAL** | If a 4-class system is claimed, negative traffic frames (e.g. from normal traffic flow or negative classes in `Traffic_Violation`) must be formally added and evaluated. |
| **Gap 3: Component Ablations (Visual Alone vs NLP Alone vs Combined)** | Claims multimodal fusion is a core contribution achieving 92.8% F1. | No ablation tables or logs exist in repository comparing: (1) Vision only, (2) NLP only, (3) Vision + NLP. | **HIGH** | Run a controlled ablation experiment across the test set showing the metric delta between Vision-only and Multimodal fusion. |
| **Gap 4: Trust Scoring Ablation** | Claims trust scoring mitigates spam and false reports. | Code has 2 static heuristic rules in `fusion.py`, but no experiment was run with trust scoring enabled vs disabled. | **HIGH** | Simulate a noise/spam injection test (e.g. 10% corrupted reports) with trust scoring ON vs OFF to prove efficacy empirically. |
| **Gap 5: Latency & Hardware Benchmarks** | Claims 36.8 ms total latency on an NVIDIA RTX 3090, with 18.4 ms for NLP. | No RTX 3090 benchmark scripts exist. Code uses simple keyword matching that runs in 0.37 $\mu$s. | **MEDIUM-HIGH** | Provide a real, reproducible timing script. Correct the 18.4 ms NLP latency claim to reflect actual keyword matching time (or explain if BLIP captioning is included). |
| **Gap 6: Baseline Model Comparisons** | [TECHNICAL_STRATEGY.md](file:///Users/sohamghadge/Documents/project/traffic_project_app/TECHNICAL_STRATEGY.md) lists MobileNetV3 and EfficientNet-B0 as "Target" baselines. | No completed comparative experiments exist; `accident_cnn.py` returns hardcoded numbers. | **MEDIUM** | Evaluate ResNet-18 vs EfficientNet-B0 vs ResNet-50 on the same test set (results now provided in `verified_results/empirical_efficientnet_test_results.csv`). |

---

## 2. In-Depth Analysis of Critical Gaps

### Gap 1: Dataset Provenance and 12,865 Sample Count
- **The Problem**: A reviewer asking for dataset download links, train/val/test split manifests, or class distributions will find that the repository does not contain BDD100K, UA-DETRAC, or AI City Challenge footage.
- **Why it matters**: Peer reviewers regularly ask: *"Please provide the exact split file (e.g., train.txt / test.txt) or image IDs used from BDD100K and AI City Challenge to allow the community to replicate your baseline."*
- **Current reality**: The repository contains `dataset/Accident` with 1,500 total files (225 in test set). Claiming 12,865 samples without split manifests will lead to rejection or camera-ready withdrawal.

### Gap 2: The "No Incident" Class
- **The Problem**: Section V claims:
  - No Incident: 4,520 TP, 120 FP (Low), 35 FP (Med), 5 FP (High).
- **Physical Reality**:
  - `dataset/Accident` has only 3 folders: `major/`, `minor/`, `moderate/`.
  - [dataset.py:L12-L28](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L12-L28) defines only:
    `SEVERITY_CLASSES = {"Low": 0, "Medium": 1, "High": 2}`
  - No code exists in `dataset.py` that maps any folder to "No Incident".
- **Risk**: A reviewer who checks the code will immediately see that the classifier is 3-class, while the paper claims 4-class results.

### Gap 3: Missing Multimodal Ablation
- **The Problem**: The core paper hypothesis is: *Multimodal fusion (ResNet-50 + NLP keywords) outperforms unimodal visual inspection.*
- **Reviewer comment anticipation**: *"The authors propose a hybrid fusion approach. However, there is no ablation showing the performance of ResNet-50 alone without text, nor NLP alone without images. How much does text actually contribute?"*
- **Current reality**: No ablation table exists in `Experiments_and_Results.md`.

### Gap 4: Trust Scoring Verification
- **The Problem**: The paper claims community-driven trust scoring improves reliability.
- **Reviewer comment anticipation**: *"What is the formula for the trust score? What happens if an adversary submits false reports with high reputation?"*
- **Current reality**: Code shows two simple if-statements in [fusion.py:L50-L55](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L50-L55). No adversarial evaluation or ablation exists.

---

## 3. Actionable Defense and Revision Strategies

1. **Option A: Honest Alignment with Physical Repository (Recommended)**:
   - State that the prototype was trained and evaluated on the curated 1,500-sample traffic incident dataset across 3 severity tiers (`Low`, `Medium`, `High`), achieving 65.33% Top-1 accuracy with ResNet-18.
   - Describe the 4-class architecture and the BDD100K/AI City data pipeline as the target architecture currently being scaled in deployment.
   - Present the empirical ablation between ResNet-18, EfficientNet-B0, and ResNet-50 from this audit package.
2. **Option B: Empirical Benchmark Execution**:
   - If the 12,865-sample dataset was generated on a remote server/GPU cluster (e.g., an external lab workstation), copy the exact test predictions (`y_true.npy`, `y_pred.npy`) into `CITISAFE_Camera_Ready_Evidence/verified_results/` to establish provenance.
