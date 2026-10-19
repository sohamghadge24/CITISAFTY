import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_verified_incidents():
    response = client.get("/api/v1/reports/verified")
    assert response.status_code == 200
    data = response.json()
    assert "incidents" in data
    assert isinstance(data["incidents"], list)
    
def test_dispatch_invalid_incident():
    payload = {
        "incident_id": 999999,
        "authority_type": "Police",
        "priority": "High",
        "notes": "Testing invalid lookup"
    }
    response = client.post("/api/v1/reports/dispatch", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Incident not found"
