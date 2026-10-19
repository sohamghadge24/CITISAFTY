from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from ..core.logging import logger

router = APIRouter(prefix="/ws", tags=["Realtime"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket client connected", total_connections=len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket client disconnected", total_connections=len(self.active_connections))

    async def broadcast(self, event_type: str, data: dict):
        """
        Broadcasts a message to all connected clients.
        Payload structure: {"event": event_type, "data": data}
        """
        message = {
            "event": event_type,
            "data": data
        }
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error("Failed to send WebSocket message", error=str(e))
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.disconnect(dead)

# Global connection manager instance
manager = ConnectionManager()

@router.websocket("/incidents")
async def incidents_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any messages from client (e.g., ping) to keep connection alive
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error("WebSocket connection error", error=str(e))
        manager.disconnect(websocket)
