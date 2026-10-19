from typing import Dict, List, Optional
import math
from .inference import inference_service

CRITICAL_KEYWORDS = {"fire", "flipped", "blood", "trapped", "smoke", "multiple", "death", "fatality", "crash", "collision", "wreckage"}
HIGH_KEYWORDS = {"blocked", "glass", "injury", "pileup", "broken", "accident", "emergency", "debris", "stopped"}
MEDIUM_KEYWORDS = {"Traffic", "congested", "slow", "delay", "queue"}

SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"]

def calculate_severity_hybrid(image_bytes: bytes, caption_text: str, user_trust_score: float = 0.5) -> Dict:
    """
    Implements the Advanced Hybrid Fusion Logic (v2.0) combining
    ResNet-50 visual confidence with NLP heuristic analysis.
    """
    
    # 1. Visual Analysis (Deep Learning)
    visual_result = inference_service.predict_image(image_bytes)
    visual_conf = visual_result["confidence"]
    # Map class index 0-3 to 0.0-1.0 normalized score
    # 0=Low (0.0), 1=Med (0.33), 2=High (0.66), 3=Crit (1.0)
    visual_class_idx = visual_result["class_idx"]
    visual_scalar = visual_class_idx / 3.0
    
    # 2. Heuristic Analysis (NLP)
    caption_lower = caption_text.lower()
    nlp_score = 0.0
    matched_keywords = []

    if any(k in caption_lower for k in CRITICAL_KEYWORDS):
        nlp_score = 1.0
        matched_keywords = [k for k in CRITICAL_KEYWORDS if k in caption_lower]
    elif any(k in caption_lower for k in HIGH_KEYWORDS):
        nlp_score = 0.75
        matched_keywords = [k for k in HIGH_KEYWORDS if k in caption_lower]
    elif any(k in caption_lower for k in MEDIUM_KEYWORDS):
        nlp_score = 0.4
        matched_keywords = [k for k in MEDIUM_KEYWORDS if k in caption_lower]

    # 3. Dynamic Weighted Fusion
    # Instead of static alpha, use model confidence.
    # If model is very sure (0.9), trust it 90%. If unsure (0.4), trust text more.
    alpha = visual_conf
    beta = 1.0 - alpha
    
    # Fusion Calculation
    final_score = (visual_scalar * alpha) + (nlp_score * beta)
    
    # 4. Trust Score Adjustment (Spam Mitigation)
    if user_trust_score < 0.3:
        final_score *= 0.8  # Penalize low-trust users
    
    # Boost for high trust + critical keywords
    if user_trust_score > 0.8 and nlp_score == 1.0:
        final_score = min(final_score * 1.1, 1.0)

    # 5. Thresholding
    severity = "Low"
    if final_score >= 0.85:
        severity = "Critical"
    elif final_score >= 0.60:
        severity = "High"
    elif final_score >= 0.35:
        severity = "Medium"

    return {
        "severity": severity,
        "final_score": round(final_score, 4),
        "visual_confidence": round(visual_conf, 4),
        "nlp_score": nlp_score,
        "matched_keywords": matched_keywords,
        "details": {
            "alpha": round(alpha, 2),
            "beta": round(beta, 2),
            "visual_class": SEVERITY_LEVELS[visual_class_idx]
        }
    }
