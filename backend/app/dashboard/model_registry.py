
from typing import Dict, List, Optional
from ..models.accident_severity_v2 import AccidentSeverityModel
from ..models.traffic_violation import TrafficViolationModel
from ..models.car_scratch import CarScratchModel

# Re-adding the legacy ones if needed, but let's prioritize new ones
# Assuming existing models were:
from ..models.accident_resnet import AccidentResNetModel
from ..models.severity_hybrid import SeverityHybridModel
from ..models.accident_cnn import AccidentCNNBaseline
from ..models.trust_aggregation_model import TrustAggregationModel

class ModelRegistry:
    def __init__(self):
        # Initialize models (lazy loading can happen inside their classes)
        self.models = {
            # New Production Models
            "accident-severity": AccidentSeverityModel(),
            "traffic-violation": TrafficViolationModel(),
            "car-scratch": CarScratchModel(),
            
            # Legacy / Hybrid Models (Kept for compatibility)
            "accident-resnet": AccidentResNetModel(),
            "severity-hybrid": SeverityHybridModel(),
            "accident-cnn": AccidentCNNBaseline(),
            "trust-aggregation": TrustAggregationModel()
        }

    def list_models(self) -> List[Dict]:
        return [m.get_info() for m in self.models.values()]

    def get_model(self, model_id: str):
        # Direct lookup first
        if model_id in self.models:
            return self.models[model_id]
            
        # Or search by ID property if key doesn't match
        for key, model in self.models.items():
            if model.model_id == model_id:
                return model
        return None

# Singleton instance
model_registry = ModelRegistry()
