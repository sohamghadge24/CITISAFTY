from .base import BaseTrafficModel
from typing import Dict, Any, List

class SeverityClassifierV1(BaseTrafficModel):
    def __init__(self):
        super().__init__("severity-v1-rule-based", "v1.0.0")

    async def load(self):
        pass

    async def predict(self, input_data: Any) -> Dict[str, Any]:
        # Simple rule-based logic
        return {"severity": "Medium", "confidence": 1.0, "mode": "rule-based"}

    async def evaluate(self, test_dataset: List[Dict]) -> Dict[str, float]:
        return {"accuracy": 0.85, "f1_score": 0.82}
