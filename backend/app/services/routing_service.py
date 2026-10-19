import httpx
import time
from typing import List, Dict, Optional
from ..core.logging import logger
import polyline

class RoutingService:
    def __init__(self, base_url: str = "https://router.project-osrm.org"):
        self.base_url = base_url

    async def compute_routes(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, include_alternatives: bool = True) -> List[Dict]:
        """
        Production-grade route computation using OSRM with alternatives support.
        """
        # OSRM format: {lng},{lat};{lng},{lat}
        url = f"{self.base_url}/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}"
        
        params = {
            "alternatives": "true" if include_alternatives else "false",
            "overview": "full",
            "geometries": "polyline", # Production standard: encoded polylines
            "steps": "false"
        }

        start_time = time.time()
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                if response.status_code != 200:
                    logger.error("OSRM request failed", status_code=response.status_code, text=response.text)
                    return []

                data = response.json()
                if data.get("code") != "Ok":
                    logger.error("OSRM returned error code", code=data.get("code"))
                    return []

                routes = []
                for idx, r in enumerate(data.get("routes", [])):
                    # Logic for production: Filter and score routes
                    distance_km = round(r["distance"] / 1000, 1)
                    duration_mins = round(r["duration"] / 60)
                    
                    # Simulate traffic adjustment (In production, this queries your traffic engine)
                    traffic_penalty = 1.1 if idx == 0 else 1.0 # Primary usually has higher traffic probability
                    traffic_eta = round(duration_mins * traffic_penalty)

                    routes.append({
                        "route_id": "primary" if idx == 0 else f"alternative_{idx}",
                        "distance_km": distance_km,
                        "eta_minutes": duration_mins,
                        "traffic_adjusted_eta": traffic_eta,
                        "geometry": r["geometry"],
                        "congestion_level": self._determine_congestion(duration_mins, traffic_eta)
                    })

                computation_time = time.time() - start_time
                logger.info("Route computation complete", 
                            count=len(routes), 
                            duration_ms=round(computation_time * 1000))
                
                return routes

        except Exception as e:
            logger.error("Routing service fault", error=str(e))
            return []

    def _determine_congestion(self, base_eta: int, traffic_eta: int) -> str:
        ratio = traffic_eta / base_eta if base_eta > 0 else 1
        if ratio > 1.4: return "heavy"
        if ratio > 1.1: return "moderate"
        return "low"

# Singleton instance
routing_service = RoutingService()
