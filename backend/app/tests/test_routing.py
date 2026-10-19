import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routing_compute():
    # Valid route from point A to B (Mumbai coords roughly)
    payload = {
        "start": {"lat": 19.0760, "lng": 72.8777},
        "destination": {"lat": 19.1000, "lng": 72.9000},
        "include_alternatives": True
    }
    
    response = client.post("/api/v1/routing/compute", json=payload)
    
    # 200 handles normal logic; 503 if OSRM is offline.
    # We assert either condition is correctly formatted
    if response.status_code == 200:
        data = response.json()
        assert "routes" in data
        assert isinstance(data["routes"], list)
        if len(data["routes"]) > 0:
            first_route = data["routes"][0]
            assert "route_id" in first_route
            assert "distance_km" in first_route
            assert "eta_minutes" in first_route
            assert "congestion_level" in first_route
            assert "geometry" in first_route
    else:
        # Fallback assertion if router is down during tests
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
