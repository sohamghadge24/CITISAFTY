# CITISAFE Numerical Consistency and Metrics Audit

## 1. Mathematical Audit of Manuscript Confusion Matrix

The manuscript Section V-D presents the following 4-class confusion matrix for the test set:

```text
Actual \ Predicted | No Incident | Low Severity | Medium Severity | High Severity | Row Sum (Actual)
-------------------|-------------|--------------|-----------------|---------------|-----------------
No Incident        |    4520     |     120      |       35        |       5       |      4680
Low Severity       |     185     |    2950      |      145        |      20       |      3300
Medium Severity    |      40     |     115      |     2680        |      95       |      2930
High Severity      |      10     |      25      |       80        |    1840       |      1955
-------------------|-------------|--------------|-----------------|---------------|-----------------
Col Sum (Predicted)|    4755     |    3210      |     2940        |    1960       |     12865
```

### Finding 1: Mislabeling of Row Sums as "Predicted Severity Distribution"
In Section V-D.4 ("Severity Classification Distribution"), the manuscript states:
> *"The distribution of the predicted severity classes within the test dataset reflects the realistic occurrence rates of real-world traffic scenarios:*
> - *No Incident: 4680 (36.3%)*
> - *Low Severity: 3300 (25.6%)*
> - *Medium Severity: 2930 (22.8%)*
> - *High Severity: 1955 (15.2%)"*

**Mathematical Truth**:
- The values `[4680, 3300, 2930, 1955]` are the **Row Sums** (the Ground-Truth Actual class totals), NOT the predicted class totals!
- The actual column sums of predicted classifications from the confusion matrix are:
  - Predicted No Incident: $4520 + 185 + 40 + 10 = \mathbf{4,755}$ ($36.96\%$)
  - Predicted Low Severity: $120 + 2950 + 115 + 25 = \mathbf{3,210}$ ($24.95\%$)
  - Predicted Medium Severity: $35 + 145 + 2680 + 80 = \mathbf{2,940}$ ($22.85\%$)
  - Predicted High Severity: $5 + 20 + 95 + 1840 = \mathbf{1,960}$ ($15.24\%$)

The manuscript conflated the ground-truth actual labels with predicted classifications.

---

## 2. Recomputation of Reported Classification Metrics

Using standard machine learning definitions:
- $\text{Precision}_i = \frac{TP_i}{TP_i + FP_i} = \frac{TP_i}{\text{ColSum}_i}$
- $\text{Recall}_i = \frac{TP_i}{TP_i + FN_i} = \frac{TP_i}{\text{RowSum}_i}$
- $\text{F1}_i = \frac{2 \times \text{Precision}_i \times \text{Recall}_i}{\text{Precision}_i + \text{Recall}_i}$
- $\text{Overall Accuracy} = \frac{\sum TP_i}{N} = \frac{4520 + 2950 + 2680 + 1840}{12865} = \frac{11990}{12865} = \mathbf{93.1986\%}$
- One-vs-Rest (OvR) Binary Accuracy for class $i$: $\text{Acc}_i = \frac{TP_i + TN_i}{N}$ where $TN_i = N - \text{RowSum}_i - (\text{ColSum}_i - TP_i)$

### Detailed Metric Comparison Table

| Severity Class | Manuscript "Accuracy" (%) | Recomputed OvR Accuracy (%) | Manuscript Precision (%) | Recomputed Precision (%) | Manuscript Recall (%) | Recomputed Recall (%) | Manuscript F1 (%) | Recomputed F1 (%) | Audit Finding & Nature of Discrepancy |
|---|---|---|---|---|---|---|---|---|---|
| **No Incident** | 96.5 | 96.93 | 95.0 | 95.058 | 96.5 | 96.581 | 95.7 | 95.814 | Reported "Accuracy" (96.5%) is actually **Recall** ($4520/4680 = 96.58\%$). |
| **Low Severity** | 92.1 | 95.26 | 91.8 | 91.900 | 89.3 | 89.394 | 90.5 | 90.630 | Reported "Accuracy" is 92.1%, whereas true OvR accuracy is 95.26% and recall is 89.39%. |
| **Medium Severity**| 91.4 | 96.93 | 91.1 | 91.156 | 91.4 | 91.468 | 91.2 | 91.311 | Reported "Accuracy" (91.4%) exactly mirrors **Recall** ($2680/2930 = 91.47\%$). |
| **High Severity** | 95.8 | 98.25 | 93.8 | 93.878 | 94.1 | 94.118 | 93.9 | 93.993 | Reported "Accuracy" (95.8%) does not match OvR (98.25%) or Recall (94.12%). |
| **Macro Average** | **93.95** | **96.84 (OvR)** | **92.9** | **92.998** | **92.8** | **92.890** | **92.8** | **92.937** | **Major Discrepancy**: 93.95% was calculated by taking the average of the bogus class accuracy column: $\frac{96.5 + 92.1 + 91.4 + 95.8}{4} = 93.95\%$. **True overall accuracy across all 12,865 samples is 93.20% (11,990 / 12,865)**. |

---

## 3. Discrepancy in Overall Accuracy vs Average Accuracy

1. **Overall Dataset Accuracy**:
   $$\text{Accuracy} = \frac{\sum \text{True Positives}}{N} = \frac{4520 + 2950 + 2680 + 1840}{12865} = \frac{11990}{12865} = \mathbf{93.1986\%} \approx 93.20\%$$
2. **Manuscript Claim**:
   The manuscript reports **93.95%**.
3. **Source of the Error**:
   The author took the arithmetic mean of the four class-level values in the "Accuracy" column:
   $$\frac{96.5 + 92.1 + 91.4 + 95.8}{4} = \frac{375.8}{4} = 93.95\%$$
   This is mathematically invalid:
   - For classes "No Incident" and "Medium Severity", the author placed the **Recall** value into the Accuracy column.
   - For multi-class classification, overall accuracy is $\frac{\sum TP}{N}$, NOT the arithmetic average of one-vs-rest accuracies or class recalls.

---

## 4. Latency Measurement Audit

The manuscript reports:
- Image Preprocessing: **3.5 ms**
- ResNet-50 Feature Extraction: **12.8 ms**
- Incident Detection Head: **2.1 ms**
- NLP Severity Analysis: **18.4 ms**
- **Total Pipeline Latency: 36.8 ms (~27 FPS)**
- Hardware: "Server equipped with an NVIDIA RTX 3090 GPU"

### Empirical Validation Findings

To audit this claim, an exact latency benchmark was executed on the local hardware (Apple Silicon CPU, 100 repetitions for vision, 10,000 repetitions for NLP, see [logs/latency_benchmark.log](file:///Users/sohamghadge/Documents/project/traffic_project_app/CITISAFE_Camera_Ready_Evidence/logs/latency_benchmark.log)):

| Processing Stage | Manuscript Claim (RTX 3090) | Measured Local CPU Latency | Architectural Analysis & Verification Status |
|---|---|---|---|
| **Image Preprocessing** | 3.5 ms | **3.252 ms** | **Consistent**: Pillow/OpenCV decode, resize, and normalization execute in ~3 ms. |
| **ResNet-50 Feature Extraction** | 12.8 ms | **21.937 ms** | **Plausible on GPU**: ResNet-50 takes 21.9 ms on modern CPU; 12.8 ms on RTX 3090 is realistic for FP32/FP16 forward pass. |
| **Incident Detection Head** | 2.1 ms | **< 0.05 ms** | **Discrepant**: The head is a single linear layer `Linear(512, 4)` and softmax. On GPU, this takes microseconds (<0.1 ms), not 2.1 ms. |
| **NLP Severity Analysis** | 18.4 ms | **0.00037 ms (0.37 $\mu$s)** | **Massive Discrepancy**: The NLP pipeline in [fusion.py:L26-L39](file:///Users/sohamghadge/Documents/project/traffic_project_app/backend/app/services/fusion.py#L26-L39) is a Python `set` membership check over ~20 keywords. It executes in **370 nanoseconds**. Claiming 18.4 ms implies an uninstalled heavy transformer (e.g. BERT/LLM). |
| **Total Pipeline Latency** | 36.8 ms (~27 FPS) | **25.19 ms (~40 FPS)** on CPU | **Unverified Hardware**: No benchmarking code or logs for RTX 3090 exist in the repository. The numbers appear to have been estimated rather than measured. |

---

## 5. Summary of Numerical Flags for Manuscript Revision

1. **Flag A (Severity Distribution)**: Section V-D.4 must be updated to either state actual test set priors (row sums) or true predicted distribution (column sums).
2. **Flag B (Accuracy Definition)**: The class-level "Accuracy" column must be corrected to either standard One-vs-Rest Accuracy or explicitly labeled as Class Recall.
3. **Flag C (Macro Accuracy)**: Macro accuracy of 93.95% must be replaced with the exact overall accuracy of **93.20%**.
4. **Flag D (NLP Latency Claim)**: The manuscript cannot claim 18.4 ms for NLP while utilizing a 0.37-microsecond keyword heuristic. Reviewers will immediately identify the discrepancy.
