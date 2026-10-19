from typing import Dict, Any, Optional
from ..ml.relevance_filter import relevance_filter
from .ml_service import ml_service
from ..core.logging import logger
import time

class ImageValidationPipeline:
    def __init__(self):
        self.relevance_threshold = 0.60

    async def process_incident_report(self, image_bytes: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full production pipeline:
        1. Semantic Filtering (CLIP)
        2. Perception Engine (ResNet)
        3. Decision Logic (Hybrid)
        """
        start_time = time.time()
        
        # Phase 1: Semantic Relevance Filtering (Energy Optimized)
        relevance = await relevance_filter.predict(image_bytes, metadata)
        
        if relevance["status"] == "IRRELEVANT":
            logger.warning("Upload rejected: Irrelevant content detected", 
                           best_match=relevance["best_match"])
            return {
                "success": False,
                "error": "IRRELEVANT_CONTENT",
                "message": f"Our AI identified this as '{relevance['best_match']}'. Please upload traffic-related media.",
                "relevance": relevance,
                "processing_time": time.time() - start_time
            }

        # Phase 2 & 3: standard ML inference for traffic related or uncertain
        # If uncertain, we still run it but maybe flag for review
        incident_analysis = await ml_service.evaluate_incident_async(image_bytes, metadata)
        
        return {
            "success": True,
            "relevance": relevance,
            "analysis": incident_analysis,
            "processing_time": time.time() - start_time,
            "flagged_for_review": relevance["status"] == "UNCERTAIN"
        }

image_pipeline = ImageValidationPipeline()
