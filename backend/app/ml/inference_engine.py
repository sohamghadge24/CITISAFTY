from typing import Any, Dict
from ..dashboard.model_registry import model_registry

class InferenceEngine:
    async def run_inference(self, model_id: str, data: Any) -> Dict:
        model = model_registry.get_model(model_id)
        if not model:
            raise ValueError(f"Model {model_id} not found in registry")
        return await model.predict(data)

inference_engine = InferenceEngine()
