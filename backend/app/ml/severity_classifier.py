from ..models.severity_hybrid import SeverityHybridModel
from ..core.logging import logger
from typing import Dict, Any

class SeverityClassifier:
    def __init__(self):
        self.model = SeverityHybridModel()

    async def load(self):
        await self.model.load()

    async def predict(self, input_data: Any) -> Dict[str, Any]:
        logger.info("Running severity classification inference")
        return await self.model.predict(input_data)

    async def evaluate(self, dataset):
        return await self.model.evaluate(dataset)

severity_classifier = SeverityClassifier()
