
from .base_trained import BaseTrainedResNet
from typing import Dict, Any

class CarScratchModel(BaseTrainedResNet):
    def __init__(self):
        super().__init__(
            model_id="car-scratch-v1",
            version="1.0.0",
            num_classes=2,
            weights_path="backend/ml_pipeline/best_model_scratch.pth",
            classes=["No Scratch", "Scratch"]
        )

    async def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        result = await super().predict(image_bytes)
        
        has_scratch = result["label"] == "Scratch"
        
        return {
            "has_scratch": has_scratch,
            "confidence": result["confidence"],
            "severity_score": result["confidence"] if has_scratch else 0.0,
            "message": "Scratch detected" if has_scratch else "No visible damage"
        }
