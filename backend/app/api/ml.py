from fastapi import APIRouter, Request, HTTPException
from ..services.ml_service import ml_service
from ..api.schemas import MLResult
from ..core.logging import logger
import base64

router = APIRouter(prefix="/ml", tags=["Machine Intelligence"])

@router.post("/test", response_model=MLResult)
async def test_ml_model(request: Request, body: dict):
    """
    Diagnostic endpoint to test ML inference without saving to database.
    Accepts base64 image and optional metadata (description).
    """
    try:
        image_data = body.get("image")
        metadata = body.get("metadata", {})
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data is required")

        # Decode image
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Run full pipeline instead of just ml_service
        from ..services.image_pipeline import image_pipeline
        result = await image_pipeline.process_incident_report(image_bytes, metadata)
        
        if not result["success"]:
            return {
                "severity": "None",
                "confidence": result["relevance"]["confidence"],
                "action": {"message": result["message"]},
                "relevance": result["relevance"]
            }

        final_res = result["analysis"]
        final_res["relevance"] = result["relevance"]
        
        logger.info("ML Pipeline completed", 
                   relevance=result["relevance"]["status"],
                   severity=final_res["severity"])
        
        return final_res
        
    except Exception as e:
        logger.error("ML Test failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_ml_status():
    return {
        "engine": ml_service.get_model_version(),
        "status": "active",
        "device": "cpu"
    }
