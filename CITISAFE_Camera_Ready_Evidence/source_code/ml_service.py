import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from io import BytesIO
from typing import Dict, Tuple, Optional, List
import concurrent.futures
import asyncio
from ..core.logging import logger
from ..core.config import settings

class MLService:
    _instance = None
    _model = None
    _executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        logger.info("Initializing ML Service (Lazy Load)", device=settings.DEVICE)
        self.model = None
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
            
    def load_model(self):
        if self.model is None:
            logger.info("Lazy loading ML Model into memory...")
            try:
                self.model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
                self.model.to(settings.DEVICE)
                self.model.eval()
                logger.info("ML Model loaded successfully")
            except Exception as e:
                logger.error("Failed to load ML model", error=str(e))
                raise RuntimeError("Failed to load ML model")

    def _run_inference(self, image_bytes: bytes) -> torch.Tensor:
        """Synchronous inference call to be run in executor"""
        self.load_model()
        
        img = Image.open(BytesIO(image_bytes)).convert('RGB')
        input_tensor = self.transform(img).unsqueeze(0).to(settings.DEVICE)
        
        with torch.no_grad():
            features = self.model(input_tensor)
        return features

    async def evaluate_incident_async(self, image_bytes: bytes, metadata: Dict) -> Dict:
        """
        Non-blocking incident evaluation.
        Runs heavy computation in a ThreadPoolExecutor.
        """
        loop = asyncio.get_event_loop()
        try:
            # Import here to avoid circular dependency issues if any, or keep at top
            from .fusion import calculate_severity_hybrid
            
            # Offload blocking work to thread pool
            # The new hybrid engine handles both inference and logic
            result = await loop.run_in_executor(
                self._executor, 
                calculate_severity_hybrid, 
                image_bytes, 
                metadata.get("description", ""), 
                metadata.get("trust_score", 0.5)
            )
            
            severity = result["severity"]
            confidence = result["visual_confidence"]
            caption = result.get("caption", f"Automated analysis: {severity} severity traffic event.") # Fusion doesn't generate caption yet, we might need to add it or keep the old one
            
            # Re-generate caption if needed or use the one from fusion if available
            # Our fusion service returns 'details' and 'matched_keywords' but not a full sentence caption.
            # Let's generate a quick one.
            keywords = ", ".join(result["matched_keywords"]) if result["matched_keywords"] else "visual anomalies"
            caption = f"AI Analysis: Detected {keywords}. Severity classified as {severity}."
            
            # Determine action
            action_plan = self._determine_action(severity)
            
            return {
                "severity": severity,
                "confidence": confidence,
                "detections": result["matched_keywords"], # Using keywords as detections for now
                "caption": caption,
                "action": action_plan,
                "timestamp": metadata.get("timestamp"),
                "debug": result # metrics
            }
        except Exception as e:
            logger.error("ML Inference failed", error=str(e))
            raise



    def _determine_action(self, severity: str) -> Dict:
        if severity == "Critical":
            return {
                "type": "EMERGENCY_DISPATCH",
                "message": "Immediate life-safety protocols active. Alerting nearest hospital and trauma center.",
                "units": ["Ambulance", "Fire Rescue", "Police SWAT"],
                "priority": 1
            }
        if severity == "High":
            return {
                "type": "RAPID_RESPONSE",
                "message": "Major traffic disruption detected. Deploying incident management team.",
                "units": ["Traffic Police", "Towing Service", "Paramedics"],
                "priority": 2
            }
        return {
            "type": "ROUTINE_MONITORING",
            "message": "Autonomous observation ongoing. Traffic impact categorized as manageable.",
            "units": ["Highway Patrol"],
            "priority": 3
        }

    async def trigger_retraining_async(self, data_samples: List[Dict]):
        """
        Mock for async retraining queue.
        In production, this would push tasks to Celery/RabbitMQ.
        """
        logger.info("Retraining task queued", sample_count=len(data_samples))
        # Logic to append to training set
        pass

    def get_model_version(self) -> str:
        return "SafeCity-ResNet18-v2.0-Light"

ml_service = MLService()
