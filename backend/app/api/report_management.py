from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..core.database import get_db
from ..models.map import Incident
from pydantic import BaseModel
from ..core.logging import logger

router = APIRouter(prefix="/reports", tags=["Report Management"])

class ReportDispatch(BaseModel):
    incident_id: int
    authority_type: str # 'Police', 'Ambulance', 'Fire'
    priority: str
    notes: Optional[str] = None

class ReportGenerate(BaseModel):
    incident_id: int
    template_type: str = "Official"

@router.post("/generate")
async def generate_official_report(req: ReportGenerate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == req.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Logic: Only allow reports for high severity/active traffic incidents
    if incident.severity == "Irrelevant" or not incident.is_active:
         raise HTTPException(status_code=400, detail="Report generation disabled for irrelevant or inactive incidents")

    logger.info("Official report generated", incident_id=req.incident_id)
    return {
        "report_id": f"REP-{incident.id}-2026",
        "timestamp": incident.created_at,
        "incident_details": {
            "type": incident.type,
            "severity": incident.severity,
            "location": f"{incident.lat}, {incident.lng}",
            "description": incident.description
        },
        "status": "Ready for Dispatch"
    }

@router.post("/dispatch")
async def dispatch_authority(req: ReportDispatch, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == req.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    logger.info("Authority dispatched", 
                type=req.authority_type, 
                incident_id=req.incident_id,
                priority=req.priority)
    
    return {
        "dispatch_id": f"DISP-{incident.id}-{req.authority_type[:3].upper()}",
        "status": "In Progress",
        "units_assigned": 2,
        "eta_minutes": 8
    }

@router.get("/verified")
async def get_verified_incidents(db: Session = Depends(get_db)):
    # Return incidents that passed the AI firewall
    incidents = db.query(Incident).filter(Incident.severity != "Irrelevant").all()
    return {"incidents": incidents}
