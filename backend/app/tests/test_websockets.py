import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.websockets import manager
import json

client = TestClient(app)

def test_websocket_connection():
    # Test connection logic is correct using the TestClient's context decorator
    with client.websocket_connect("/api/v1/ws/incidents") as websocket:
        assert len(manager.active_connections) > 0
        
        # We can't actually easily trigger an external broadcast without mocking
        # so we'll just test if connection is established and closed cleanly
    
    assert len(manager.active_connections) == 0
