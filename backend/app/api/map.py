from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..core.database import get_db
from ..models.map import Incident, RoadSegment
from ..api.schemas import IncidentCreate, IncidentResponse, RoadSegmentResponse
from ..services.ml_service import ml_service
from ..services.traffic_service import traffic_service
from ..core.logging import logger
from ..schemas.common import ResponseBase, PaginatedResponse
from ..api.websockets import manager
from ..core.limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/map", tags=["Map Intelligence"])

async def process_incident_ml(incident_id: int, image_bytes: bytes, metadata: dict, db_session_factory):
    """
    Background task for ML evaluation and downstream decisions.
    """
    logger.info("Starting background ML processing", incident_id=incident_id)
    try:
        # Full Pipeline Evaluation
        from ..services.image_pipeline import image_pipeline
        result = await image_pipeline.process_incident_report(image_bytes, metadata)
        
        # New DB session for background task
        db = db_session_factory()
        try:
            incident = db.query(Incident).filter(Incident.id == incident_id).first()
            if incident:
                if not result["success"]:
                    # Rejected by AI Firewall
                    incident.severity = "Irrelevant"
                    incident.description = f"[REJECTED] {incident.description}"
                    incident.is_active = False 
                    logger.warning("Incident marked as irrelevant", 
                                   incident_id=incident_id, 
                                   best_match=result["relevance"]["best_match"])
                else:
                    evaluation = result["analysis"]
                    # Use the pre-calculated safe AI severity instead of the raw ML output
                    severity = incident.adjusted_ai_severity or evaluation["severity"]
                    incident.severity = severity
                    
                    # Logic based on severity
                    if severity in ["High", "Critical"]:
                        # Find nearest segment
                        segment = db.query(RoadSegment).first()
                        if segment:
                            await traffic_service.update_segment_status(db, segment.id, "closed", 1.0)
                            incident.road_segment = segment
                
                db.commit()
                # Broadcast the update via WebSockets
                try:
                    import asyncio
                    # Since process_incident_ml runs in a background task thread, 
                    # but wait, BackgroundTask handles async def so it's already in the event loop!
                    await manager.broadcast("INCIDENT_UPDATED", {
                        "incident_id": incident_id,
                        "severity": incident.severity,
                        "original_user_severity": incident.original_user_severity,
                        "adjusted_ai_severity": incident.adjusted_ai_severity,
                        "is_active": incident.is_active,
                        "description": incident.description
                    })
                except Exception as ws_e:
                    logger.error("Failed to broadcast updated incident", error=str(ws_e))
                logger.info("Background ML processing complete", incident_id=incident_id)
        finally:
            db.close()
            
    except Exception as e:
        logger.error("Background ML processing failed", incident_id=incident_id, error=str(e))

@router.post("/incidents", response_model=ResponseBase[dict])
@limiter.limit("5/minute")
async def create_incident(
    request: Request,
    incident_in: IncidentCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submits an incident. Returns immediate acknowledgment.
    Evaluation happens in the background.
    """
    logger.info("New incident report received", type=incident_in.type)
    
    # 1. Create initial record
    user_sev = incident_in.user_severity or "Low"
    from ..services.severity_service import normalize_severity
    ai_sev = normalize_severity(user_sev)

    new_incident = Incident(
        type=incident_in.type,
        severity="Evaluating...", # Temporary status
        original_user_severity=user_sev,
        adjusted_ai_severity=ai_sev,
        description=incident_in.description,
        lat=incident_in.lat,
        lng=incident_in.lng,
        is_active=True
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # 2. Trigger background task
    try:
        await manager.broadcast("NEW_INCIDENT", {
            "incident_id": new_incident.id,
            "type": new_incident.type,
            "severity": new_incident.severity,
            "original_user_severity": new_incident.original_user_severity,
            "adjusted_ai_severity": new_incident.adjusted_ai_severity,
            "lat": new_incident.lat,
            "lng": new_incident.lng,
            "is_active": new_incident.is_active
        })
    except Exception as ws_e:
        logger.error("Failed to broadcast new incident", error=str(ws_e))

    import base64
    image_bytes = b"fake-image-data"
    if incident_in.image:
        try:
            # Handle data URL format (e.g. data:image/jpeg;base64,...)
            if "," in incident_in.image:
                base64_data = incident_in.image.split(",")[1]
            else:
                base64_data = incident_in.image
            image_bytes = base64.b64decode(base64_data)
        except Exception as e:
            logger.error("Failed to decode incident image", error=str(e))

    from ..core.database import SessionLocal # Import here to avoid circular
    background_tasks.add_task(
        process_incident_ml, 
        new_incident.id, 
        image_bytes, 
        incident_in.dict(),
        SessionLocal
    )

    return ResponseBase(
        message="Incident report received and is being processed by ML engine",
        data={
            "incident_id": new_incident.id,
            "status": "processing",
            "estimated_wait": "2-5 seconds"
        }
    )

@router.get("/traffic", response_model=ResponseBase[List[RoadSegmentResponse]])
async def get_traffic(db: Session = Depends(get_db)):
    segments = await traffic_service.get_traffic_status(db)
    return ResponseBase(data=segments)

@router.get("/incidents", response_model=PaginatedResponse[IncidentResponse])
async def get_incidents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Incident).filter(Incident.is_active == True)
    total = query.count()
    incidents = query.order_by(Incident.created_at.desc()).offset((page-1)*size).limit(size).all()
    
    return PaginatedResponse(
        data=incidents,
        total=total,
        page=page,
        size=size
    )


