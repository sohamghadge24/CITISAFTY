from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class IncidentBase(BaseModel):
    type: str = Field(..., example="Accident")
    description: str
    lat: float
    lng: float

class IncidentCreate(IncidentBase):
    image: Optional[str] = None
    user_severity: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    severity: str
    original_user_severity: Optional[str] = None
    adjusted_ai_severity: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class RoadSegmentResponse(BaseModel):
    id: int
    name: str
    status: str
    congestion_score: float
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

    class Config:
        from_attributes = True

class MLResult(BaseModel):
    severity: str
    confidence: float
    action: Dict
    timestamp: Optional[str] = None
    relevance: Optional[Dict] = None
    detections: Optional[List[str]] = None

class RouteData(BaseModel):
    route_id: str
    distance_km: float
    eta_minutes: int
    traffic_adjusted_eta: int
    geometry: str  # Encoded Polyline
    congestion_level: str

class RoutingRequest(BaseModel):
    start: Dict[str, float]
    destination: Dict[str, float]
    profile: str = "driving"
    include_alternatives: bool = True

class RoutingResponse(BaseModel):
    routes: List[RouteData]
    meta: Dict
