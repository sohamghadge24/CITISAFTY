# Environment and Reproducibility Guide

This document specifies the exact software environment, dependencies, hardware specifications, and reproducible shell commands to execute and verify the CITISAFE evaluation pipeline.

---

## 1. Verified Software Environment

The environment was audited and benchmarked on the local development system:

- **Operating System**: macOS (Darwin 25.3.0, Apple Silicon ARM64)
- **Python Runtime**: Python 3.11.x (managed via virtualenv at `backend/venv`)
- **PyTorch Version**: `torch 2.10.0`
- **Torchvision Version**: `torchvision 0.25.0`
- **Key Python Libraries**:
  - `albumentations`: 2.0.8
  - `opencv-python-headless`: 4.9.0.80
  - `scikit-learn`: 1.8.0
  - `numpy`: 1.26.4
  - `pandas`: 2.2.3
  - `pillow`: 11.0.0
  - `fastapi`: 0.115.6
  - `uvicorn`: 0.34.0
  - `tqdm`: 4.67.3
- Full package freeze is preserved at [configs/installed_packages.txt](file:///Users/sohamghadge/Documents/project/traffic_project_app/CITISAFE_Camera_Ready_Evidence/configs/installed_packages.txt).
- Machine metadata is preserved at [configs/system_environment.json](file:///Users/sohamghadge/Documents/project/traffic_project_app/CITISAFE_Camera_Ready_Evidence/configs/system_environment.json).

---

## 2. Step-by-Step Reproduction Instructions

### Step 1: Environment Setup
From the repository root (`traffic_project_app/`):
```bash
# Activate existing virtual environment
source backend/venv/bin/activate

# Or recreate cleanly
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r CITISAFE_Camera_Ready_Evidence/configs/requirements.txt
```

### Step 2: Reproduce Empirical Checkpoint Evaluations on Test Split
To evaluate the available checkpoints on the 225-sample test set (`dataset/Accident/test`):

```bash
# 1. Evaluate ResNet-18 Checkpoint (Accident Baseline)
python backend/ml_pipeline/validate.py \
    --checkpoint best_model_accident.pth \
    --data_dir dataset/Accident \
    --dataset_type accident \
    --arch resnet18 \
    --device cpu

# 2. Evaluate EfficientNet-B0 Checkpoint
python -c '
import torch, sys
from torchvision import models
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
sys.path.append("backend/ml_pipeline")
from dataset import TrafficSeverityDataset, get_transforms

ds = TrafficSeverityDataset("dataset/Accident", split="test", transform=get_transforms("val"))
loader = DataLoader(ds, batch_size=16, shuffle=False)

model = models.efficientnet_b0(pretrained=False)
model.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(1280, 3))
model.load_state_dict(torch.load("backend/best_model_accident.pth", map_location="cpu"))
model.eval()

y_true, y_pred = [], []
with torch.no_grad():
    for imgs, lbls in loader:
        preds = model(imgs).argmax(dim=1)
        y_true.extend(lbls.numpy())
        y_pred.extend(preds.numpy())

print("Confusion Matrix:\n", confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred, target_names=["Low", "Medium", "High"], digits=4))
'
```

### Step 3: Reproduce Latency Benchmarks
To measure actual component and end-to-end latencies on the current platform:

```bash
python -c '
import time, torch, io
from PIL import Image
import numpy as np
from torchvision import models, transforms

img = Image.fromarray(np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8))
buf = io.BytesIO()
img.save(buf, format="JPEG")
img_bytes = buf.getvalue()

tf = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Measure preprocessing
t0 = time.perf_counter()
for _ in range(100):
    im = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    t = tf(im).unsqueeze(0)
t_prep = (time.perf_counter() - t0) / 100 * 1000

# ResNet-50 inference timing
model50 = models.resnet50(pretrained=False)
model50.eval()
with torch.no_grad():
    for _ in range(10): _ = model50(t)
    t0 = time.perf_counter()
    for _ in range(100): _ = model50(t)
t_rn50 = (time.perf_counter() - t0) / 100 * 1000

# NLP keyword matching timing
caption = "A severe multi-vehicle crash with fire and trapped victims on highway"
CRITICAL_KEYWORDS = {"fire", "flipped", "blood", "trapped", "smoke", "multiple", "death", "fatality", "crash", "collision", "wreckage"}
HIGH_KEYWORDS = {"blocked", "glass", "injury", "pileup", "broken", "accident", "emergency", "debris", "stopped"}
MEDIUM_KEYWORDS = {"traffic", "congested", "slow", "delay", "queue"}

t0 = time.perf_counter()
for _ in range(10000):
    caption_lower = caption.lower()
    _ = any(k in caption_lower for k in CRITICAL_KEYWORDS)
t_nlp = (time.perf_counter() - t0) / 10000 * 1000

print(f"Measured Preprocessing: {t_prep:.3f} ms")
print(f"Measured ResNet-50:      {t_rn50:.3f} ms")
print(f"Measured Keyword NLP:   {t_nlp:.5f} ms")
'
```

---

## 3. Training Script Parameters and Determinism

In [backend/ml_pipeline/train.py](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/ml_pipeline/train.py):
- **Arguments**:
  - `--dataset_type`: `accident`, `violation`, `scratch` (default: `accident`)
  - `--epochs`: integer (default: 30)
  - `--batch_size`: integer (default: 32)
  - `--lr`: float (default: 0.0001)
  - `--device`: `cuda` or `cpu`
  - `--checkpoint`: custom save path
- **Random Seeds**:
  - Note: `train.py` **does not currently set fixed random seeds** (`torch.manual_seed()` or `np.random.seed()` are absent). To ensure strict reproducibility in future camera-ready training runs, seed initialization should be prepended:
    ```python
    import random, numpy as np, torch
    def set_seed(seed=42):
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
    ```
