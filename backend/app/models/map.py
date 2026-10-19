from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    
    # "normal", "congested", "closed"
    status = Column(String, default="normal", index=True)
    congestion_score = Column(Float, default=0.0)
    
    incidents = relationship("Incident", back_populates="road_segment")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True) # Accident, Fire, Construction, Routine
    severity = Column(String, index=True) # Low, Medium, High, Critical
    description = Column(String)
    is_active = Column(Boolean, default=True, index=True)
    original_user_severity = Column(String, nullable=True)
    adjusted_ai_severity = Column(String, nullable=True)
    
    lat = Column(Float)
    lng = Column(Float)
    
    road_segment_id = Column(Integer, ForeignKey("road_segments.id"), nullable=True)
    road_segment = relationship("RoadSegment", back_populates="incidents")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Explicit Indexes for performance
Index('idx_incident_location', Incident.lat, Incident.lng)
Index('idx_road_start', RoadSegment.start_lat, RoadSegment.start_lng)
Index('idx_road_end', RoadSegment.end_lat, RoadSegment.end_lng)
