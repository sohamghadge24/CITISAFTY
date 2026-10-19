from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..dashboard.model_registry import model_registry
import base64

router = APIRouter(prefix="/models", tags=["Model Testing Dashboard"])

class TestRequest(BaseModel):
    model_id: str
    input_data: Dict[str, Any]

@router.get("/list")
async def list_available_models():
    return {"models": model_registry.list_models()}

@router.post("/test")
async def test_single_model(request: TestRequest):
    model = model_registry.get_model(request.model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Handle image if present
    if "image" in request.input_data:
        image_data = request.input_data["image"]
        if "," in image_data:
            image_data = image_data.split(",")[1]
        input_payload = base64.b64decode(image_data)
    else:
        input_payload = request.input_data

    result = await model.predict(input_payload)
    return {"model_id": request.model_id, "result": result}

@router.get("/metrics/{model_id}")
async def get_model_metrics(model_id: str):
    model = model_registry.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    metrics = await model.evaluate([]) # Mock dataset for now
    return {"model_id": model_id, "metrics": metrics}

@router.post("/compare")
async def compare_models(model_ids: List[str]):
    results = []
    for mid in model_ids:
        model = model_registry.get_model(mid)
        if model:
            metrics = await model.evaluate([])
            results.append({"model_id": mid, "metrics": metrics})
    return {"comparison": results}
