# CITISAFE Dataset and Label Mapping Audit

## 1. Class Taxonomy Comparison

The manuscript claims a 4-class severity taxonomy evaluated on 12,865 test samples. Below is the direct comparison with the actual labels discovered in the codebase and dataset files:

| Manuscript Severity Class | Claimed Definition in Paper | Actual Label in `dataset/Accident` | Actual Label in `fusion.py` | Actual Label in `train.py` | Implementation Status |
|---|---|---|---|---|---|
| **No Incident** | Normal traffic flow, no hazard or collision | **Does not exist** | Does not exist | Does not exist | **Missing** |
| **Low Severity** | Minor vehicle contact, fender bender, minor disruption | `minor` | `Low` (Index 0) | `Low` (Index 0) | **Verified** |
| **Medium Severity** | Multi-vehicle blockage, moderate damage, towing needed | `moderate` | `Medium` (Index 1) | `Medium` (Index 1) | **Verified** |
| **High Severity** | Severe crash, roll-over, structural fire, fatalities | `major` | `High` (Index 2) / `Critical` (Index 3) | `High` (Index 2) | **Diverged (Split into High/Critical in fusion)** |

---

## 2. Actual Dataset Split Manifest (`dataset/Accident`)

The physical accident dataset in `dataset/Accident` is partitioned into three directory splits: `train/`, `val/`, and `test/`.

### Verified Physical Sample Counts

| Split Directory | Class: `minor` (Low) | Class: `moderate` (Medium) | Class: `major` (High) | Class: `No Incident` | Total Split Count | File Types |
|---|---|---|---|---|---|---|
| `train/` | 350 | 350 | 350 | 0 | **1,050** | `.mp4` video clips |
| `val/` | 75 | 75 | 75 | 0 | **225** | `.mp4` video clips |
| `test/` | 75 | 75 | 75 | 0 | **225** | `.mp4` video clips |
| **Total** | **500** | **500** | **500** | **0** | **1,500** | `.mp4` video clips |

### Manuscript Claim Discrepancy

| Metric | Manuscript Claim (Section V) | Actual Physical Dataset (`dataset/Accident`) | Discrepancy Factor |
|---|---|---|---|
| **Total Test Samples** | **12,865** | **225** | **57.2x smaller** than claimed |
| **No Incident Test Count** | **4,680** | **0** | **100% missing** |
| **Low Severity Test Count** | **3,300** | **75** | **44.0x smaller** |
| **Medium Severity Test Count** | **2,930** | **75** | **39.1x smaller** |
| **High Severity Test Count** | **1,955** | **75** | **26.1x smaller** |

---

## 3. Label Mapping Logic in Code

From [backend/ml_pipeline/dataset.py:L12-L28](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L12-L28):

```python
SEVERITY_CLASSES = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}

FOLDER_MAPPING = {
    "minor": "Low",
    "moderate": "Medium", 
    "major": "High",
    "Low": "Low",
    "Medium": "Medium",
    "High": "High",
    "low": "Low",
    "medium": "Medium",
    "high": "High"
}
```

Notice that:
1. `minor` maps to class index `0` ("Low").
2. `moderate` maps to class index `1` ("Medium").
3. `major` maps to class index `2` ("High").
4. **No mapping or folder exists for "No Incident".**

---

## 4. Frame Sampling & Data Leakage Audit

### Frame Extraction Methodology
In [backend/ml_pipeline/dataset.py:L31-L54](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/dataset.py#L31-L54):
```python
if str(img_path).lower().endswith(('.mp4', '.avi', '.mov')):
    cap = cv2.VideoCapture(abs_path)
    if cap.isOpened():
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames > 10:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 10)
        ret, frame = cap.read()
        if ret:
            image = frame
        cap.release()
```
The dataloader samples a **single static frame (frame index 10)** from each video clip.

### Critical Risk: Data Leakage across Splits
An audit of file names in `dataset/Accident` reveals augmented video filenames:
- `train/minor/aug_111_2020_08_4_cuted.mp4`
- `val/minor/aug_227_2020_01_12_cuted.mp4`
- `test/minor/aug_60_2020_03_7_cuted.mp4`
- `train/major/aug_154_2021_11_23_cuted.mp4`

**Leakage Assessment**:
1. Augmented clips derived from the same base video (sharing base timestamps like `2020_08_4` or `2021_11_23`) may exist across `train/`, `val/`, and `test/`.
2. Because the dataset was partitioned at the file/clip level without an explicit video-grouping identifier or scene hash, there is a distinct probability of **near-identical camera angles or incident scenes occurring in both training and test sets**.

---

## 5. Other Datasets in the Repository

### 1. `dataset/Traffic_Violation`
- **Location**: `dataset/Traffic_Violation/`
- **Structure**: `Training data/` (1,799 images), `validation data/` (300 images), `Test data/` (300 images). Total = 2,399 images.
- **Classes**: `helmet` (800 total), `no_helmet` (799 total), `overloading` (800 total).
- **Audit finding**: This dataset classifies helmet wearing and vehicle overloading for two-wheelers. It does **not** classify traffic accident severity and cannot be used as ground truth for the 4-class severity paper.

### 2. `dataset/ scratch_car`
- **Location**: `dataset/ scratch_car/`
- **Structure**: 8,079 images in `images/` with `labels.csv` (8,079 rows).
- **Classes**: `0` (no scratch, 4,000 samples) and `1` (scratch, 4,079 samples).
- **Audit finding**: Used to train `best_model_scratch.pth` for vehicle body damage inspection. It does not measure roadway incident severity.

### 3. `dataset1/`
- **Location**: `dataset1/`
- **Structure**: Unsplit prototype directory with 50 images: `low/` (21 images), `medium/` (11 images), `high/` (18 images).
- **Audit finding**: Small development set for testing local inference scripts.
