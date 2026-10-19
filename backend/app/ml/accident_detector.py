from ..models.accident_resnet import AccidentResNetModel
from ..core.logging import logger
from typing import Dict, Any

class AccidentDetector:
    def __init__(self):
        self.model = AccidentResNetModel()

    async def load(self):
        await self.model.load()

    async def predict(self, image_data: bytes) -> Dict[str, Any]:
        logger.info("Running accident detection inference")
        return await self.model.predict(image_data)

    async def evaluate(self, dataset):
        return await self.model.evaluate(dataset)

accident_detector = AccidentDetector()
