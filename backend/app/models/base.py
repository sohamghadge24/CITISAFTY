from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseTrafficModel(ABC):
    def __init__(self, model_id: str, version: str):
        self.model_id = model_id
        self.version = version

    @abstractmethod
    async def load(self):
        """Load model weights/config into memory"""
        pass

    @abstractmethod
    async def predict(self, input_data: Any) -> Dict[str, Any]:
        """Run inference on input data"""
        pass

    @abstractmethod
    async def evaluate(self, test_dataset: List[Dict]) -> Dict[str, float]:
        """Return performance metrics (Accuracy, F1, etc.)"""
        pass

    def get_info(self) -> Dict[str, str]:
        return {
            "model_id": self.model_id,
            "version": self.version,
            "type": self.__class__.__name__
        }
