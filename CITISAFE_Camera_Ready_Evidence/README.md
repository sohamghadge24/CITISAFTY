# CITISAFE Camera-Ready Research Evidence Package

## Executive Overview

This directory (`CITISAFE_Camera_Ready_Evidence/`) contains the complete, rigorous audit and evidence export for the **CITISAFE (Community-driven Intelligent Traffic Incident Surveillance and Automated Fast Emergency System)** research manuscript.

The package was prepared in response to reviewer comments to determine whether the manuscript claims regarding **ResNet-50**, **four-class severity classification**, **NLP keyword heuristics**, **trust scoring**, **multimodal fusion**, **baseline comparisons**, **ablation studies**, and **evaluation metrics** are supported by reproducible empirical evidence in the repository.

### Critical Integrity Principle

In strict accordance with scientific integrity and camera-ready audit guidelines:
- **No experimental results have been fabricated, modified, or smoothed.**
- What exists in the codebase has been traced and verified.
- What is unverified or contradicted by physical data has been explicitly flagged with exact mathematical and source-level documentation.
- Raw reported values and recomputed verified values are maintained separately.

---

## Directory Structure

```text
CITISAFE_Camera_Ready_Evidence/
├── README.md                              # Top-level index and summary of the audit
├── camera_ready_audit.md                  # Comprehensive Phase 8 Camera-Ready Readiness Report
├── repository_inventory.md                # Full inventory of all files, models, code, and databases
├── implementation_map.md                  # Component-by-component trace from paper to source code
├── dataset_inventory.csv                  # Machine-readable inventory of all discovered & claimed datasets
├── label_mapping.md                       # Analysis of original labels vs 4-class CITISAFE taxonomy
├── experiment_matrix.csv                  # Matrix of baseline, ablation, and combined experiments
├── metrics_audit.md                       # Comprehensive mathematical audit of reported vs verified numbers
├── reviewer_evidence_gaps.md              # Explicit breakdown of evidence needed for reviewer responses
├── environment_and_reproducibility.md     # Exact environment specs, dependency manifests, and run instructions
├── missing_evidence.md                    # Detailed catalog of all missing data, splits, and experiments
│
├── source_code/                           # Direct, unmodified copies of all critical pipeline files
│   ├── train.py                           # Training script (backend/ml_pipeline/train.py)
│   ├── validate.py                        # Validation script (backend/ml_pipeline/validate.py)
│   ├── dataset.py                         # Dataset loading logic (backend/ml_pipeline/dataset.py)
│   ├── fusion.py                          # Multimodal fusion service (backend/app/services/fusion.py)
│   ├── inference.py                       # ResNet-50 inference wrapper (backend/app/services/inference.py)
│   ├── ml_service.py                      # Background ML executor (backend/app/services/ml_service.py)
│   ├── image_pipeline.py                  # End-to-end report validation pipeline
│   ├── severity_service.py                # User severity clamping logic
│   ├── engine.py                          # Two-stage YOLOv8 crop + EfficientNet-B0 engine
│   ├── relevance_filter.py                # Keyword-based relevance filter
│   ├── accident_resnet.py                 # ResNet production wrapper with mock evaluate()
│   ├── severity_hybrid.py                 # Severity hybrid wrapper with mock evaluate()
│   ├── accident_cnn.py                    # Random baseline CNN with mock evaluate()
│   ├── trust_aggregation_model.py         # Multi-report weighted trust aggregation
│   ├── base_trained.py                    # Base ResNet PyTorch loading abstraction
│   └── accident_severity_v2.py            # 3-class accident model wrapper
│
├── raw_results/                           # Preserved original manuscript claims and source docs
│   ├── Experiments_and_Results.md         # Original manuscript Section V markdown
│   ├── ML_ARCHITECTURE.md                 # Original architecture documentation
│   ├── DOCS_RESEARCH.md                   # Original research alignment documentation
│   ├── TECHNICAL_STRATEGY.md              # Original technical strategy and target benchmarks
│   ├── manuscript_reported_confusion_matrix.csv
│   ├── manuscript_reported_metrics.csv
│   └── manuscript_reported_latency.csv
│
├── verified_results/                      # Independently recomputed and empirically measured data
│   ├── recomputed_metrics_from_reported_cm.csv
│   ├── empirical_resnet18_test_results.csv
│   ├── empirical_resnet18_confusion_matrix.csv
│   ├── empirical_efficientnet_test_results.csv
│   ├── empirical_resnet50_4class_confusion_matrix.csv
│   └── empirical_latency_measurements.csv
│
├── figures/                               # Publication figures (Claimed vs Verified)
│   ├── reported_confusion_matrix.png
│   ├── verified_resnet18_confusion_matrix.png
│   ├── performance_comparison_reported_vs_verified.png
│   └── latency_breakdown_reported_vs_measured.png
│
├── logs/                                  # Execution logs from independent evaluation runs
│   ├── evaluation_checkpoints.log         # Complete evaluation log on dataset/Accident/test
│   └── latency_benchmark.log              # Precise CPU cycle timing benchmark log
│
└── configs/                               # Environment and configuration files
    ├── requirements.txt                   # Backend python package requirements
    ├── installed_packages.txt             # Freeze of pip packages from active backend virtualenv
    └── system_environment.json            # Hardware, OS, Python, and PyTorch version metadata
```

---

## Key Audit Conclusions at a Glance

| Audit Dimension | Status | Primary Observation |
|---|---|---|
| **ResNet-50 Visual Backbone** | **Partial** | Pretrained weights and checkpoint (`backend/ml_pipeline/best_model.pth`) exist, but codebase also heavily relies on **ResNet-18** and **EfficientNet-B0**. |
| **Four-Class Severity Scheme** | **Contradicted** | Manuscript claims classes: `No Incident`, `Low`, `Medium`, `High`. Physical accident dataset (`dataset/Accident`) contains only **3 classes**: `minor` (Low), `moderate` (Medium), `major` (High). No `No Incident` images exist. |
| **Datasets (BDD100K, UA-DETRAC, AI City)** | **Missing** | Manuscript claims 12,865 test samples from these benchmarks. **Zero files** from BDD100K, UA-DETRAC, or AI City exist in the repository. Actual dataset consists of 1,500 short `.mp4` video clips (225 in test set). |
| **Claimed 92.8% F1-Score** | **Reported, Unverified** | No prediction logs or test outputs support this number. When evaluated on the actual 225-sample test set, the best accident model (`best_model_accident.pth`, ResNet-18) achieves **65.33% accuracy** and **65.26% Macro F1**. |
| **Mathematical Consistency of Paper Table** | **Discrepant** | Section D.4 of the manuscript reported column row sums (actuals) as predicted counts. The reported class "Accuracy" values are actually class **Recalls**, and the "Average Accuracy" of 93.95% is the arithmetic mean of those recalls, not dataset accuracy (which is 93.20%). |
| **Latency Benchmark (36.8 ms / 27 FPS)** | **Discrepant** | Claimed RTX 3090 benchmarks are unverified. The NLP module claimed to take 18.4 ms (50% of pipeline), but is actually a dictionary keyword lookup that executes in **0.00037 ms** (0.37 microseconds). |
| **Baselines and Ablations** | **Missing** | No ablation logs exist for visual alone, NLP alone, trust scoring enabled/disabled, or alternative backbones. |

For full details, proceed to [camera_ready_audit.md](file:///Users/sohamghadge/Documents/project/traffic_project_app/CITISAFE_Camera_Ready_Evidence/camera_ready_audit.md).
