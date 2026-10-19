
from .base_trained import BaseTrainedResNet
from typing import Dict, Any

class AccidentSeverityModel(BaseTrainedResNet):
    def __init__(self):
        super().__init__(
            model_id="accident-severity-v1", 
            version="1.0.0", 
            num_classes=3,
            weights_path="backend/ml_pipeline/best_model.pth", 
            classes=["Low", "Medium", "High"]
        )

    # Override predict slightly if we need special format matching existing
    async def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        result = await super().predict(image_bytes)
        
        # Transform generic result to specific structure if needed
        # Or return as is
        
        # Map back to old format for compatibility if needed
        # "severity": label, "score": confidence
        return {
            "severity": result["label"],
            "confidence": result["confidence"],
            "predictions": result["top_predictions"]
        }
