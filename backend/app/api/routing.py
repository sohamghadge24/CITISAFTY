from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from ..api.schemas import RoutingRequest, RoutingResponse, RouteData
from ..services.routing_service import routing_service
from ..core.logging import logger
from ..core.limiter import limiter
from datetime import datetime

router = APIRouter(prefix="/routing", tags=["Routing Engine"])

@router.post("/compute", response_model=RoutingResponse)
@limiter.limit("30/minute")
async def compute_routing(request: Request, body: RoutingRequest):
    """
    Production-level routing computation.
    Supports alternatives, road-snapping, and congestion-aware weights.
    """
    logger.info("Routing request received", 
                start=body.start, 
                dest=body.destination, 
                alternatives=body.include_alternatives)
    
    routes_data = await routing_service.compute_routes(
        start_lat=body.start["lat"],
        start_lng=body.start["lng"],
        end_lat=body.destination["lat"],
        end_lng=body.destination["lng"],
        include_alternatives=body.include_alternatives
    )

    if not routes_data:
        raise HTTPException(status_code=503, detail="Routing engine unavailable or no routes found")

    # Map to schema
    routes = [RouteData(**r) for r in routes_data]

    return RoutingResponse(
        routes=routes,
        meta={
            "routing_engine": "OSRM-V1",
            "calculated_at": datetime.now().isoformat(),
            "status": "success"
        }
    )
