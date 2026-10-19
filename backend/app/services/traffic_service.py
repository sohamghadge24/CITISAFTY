from cachetools import TTLCache
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models.map import RoadSegment
from ..core.logging import logger
from ..core.config import settings

class TrafficService:
    def __init__(self):
        # Cache for 30 seconds as per settings
        self._traffic_cache = TTLCache(maxsize=1, ttl=settings.TRAFFIC_UPDATE_INTERVAL)

    async def get_traffic_status(self, db: Session) -> List[RoadSegment]:
        """
        Returns cached traffic status to avoid heavy DB queries on every request.
        """
        cached_data = self._traffic_cache.get("all_segments")
        if cached_data:
            return cached_data

        logger.info("Cache miss: Fetching traffic from database")
        # In a real scenario, this might involve complex PostGIS queries
        segments = db.query(RoadSegment).all()
        
        self._traffic_cache["all_segments"] = segments
        return segments

    async def update_segment_status(self, db: Session, segment_id: int, status: str, congestion: float):
        segment = db.query(RoadSegment).filter(RoadSegment.id == segment_id).first()
        if segment:
            segment.status = status
            segment.congestion_score = congestion
            db.commit()
            # Invalidate cache
            self._traffic_cache.pop("all_segments", None)

traffic_service = TrafficService()
