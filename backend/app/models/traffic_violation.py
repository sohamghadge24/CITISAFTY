
from .base_trained import BaseTrainedResNet
import torch
import torch.nn as nn
from torchvision import models
from ..core.config import settings
from typing import Dict, Any

class TrafficViolationModel(BaseTrainedResNet):
    def __init__(self):
        super().__init__(
            model_id="traffic-violation-v1",
            version="1.0.0",
            num_classes=3,
            weights_path="backend/ml_pipeline/best_model_violation.pth",
            classes=["Helmet", "No Helmet", "Overloading"]
        )

    # Need custom load because num_classes and structure might differ slightly?
    # No, BaseTrained handles num_classes.
    # Just override predict to format
    
    async def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        result = await super().predict(image_bytes)
        
        # Violation specific logic
        # Maybe define if it triggers an alert?
        is_violation = result["label"] in ["No Helmet", "Overloading"]
        
        return {
            "violation_type": result["label"],
            "is_violation": is_violation,
            "confidence": result["confidence"],
            "details": f"Detected {result['label']} with {result['confidence']:.2f}% confidence"
        }
