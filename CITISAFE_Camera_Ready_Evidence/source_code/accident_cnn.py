from .base import BaseTrafficModel
from typing import Dict, Any, List
import random

class AccidentCNNBaseline(BaseTrafficModel):
    def __init__(self):
        super().__init__("accident-cnn-baseline", "v1.0.0")

    async def load(self):
        pass # Mock CNN

    async def predict(self, input_data: Any) -> Dict[str, Any]:
        """Simple baseline prediction logic"""
        # Baseline might just look for color clusters or simple patterns
        return {
            "accident_detected": random.choice([True, False]),
            "confidence": round(random.uniform(0.6, 0.85), 2),
            "engine": "Legacy-CNN-Lite"
        }

    async def evaluate(self, test_dataset: List[Dict]) -> Dict[str, float]:
        return {
            "accuracy": 0.76,
            "f1_score": 0.72,
            "latency_ms": 45
        }
