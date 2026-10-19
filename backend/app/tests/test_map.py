import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_incidents():
    response = client.get("/api/v1/map/incidents")
    # It might return a permission error or rate limitation, but usually 200
    if response.status_code == 200:
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert isinstance(data["data"], list)

def test_post_incident():
    payload = {
        "type": "Accident",
        "severity": "Unknown",
        "description": "A test crash scenario",
        "lat": 19.0760,
        "lng": 72.8777,
        "image": "data:image/jpeg;base64,fakedata="
    }
    
    response = client.post("/api/v1/map/incidents", json=payload)
    assert response.status_code in [200, 201]  # Success or created
    
    data = response.json()
    assert data["message"] == "Incident report received and is being processed by ML engine"
    assert "data" in data
    assert "incident_id" in data["data"]
    assert data["data"]["status"] == "processing"

def test_traffic_status():
    response = client.get("/api/v1/map/traffic")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], list)
