import { useEffect, useRef } from 'react';
import useMapStore from '../store/useMapStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/incidents';

export const useIncidentsWebSocket = () => {
    const ws = useRef(null);
    const addIncident = useMapStore((state) => state.addIncident);
    const updateIncident = useMapStore((state) => state.updateIncident);

    useEffect(() => {
        let reconnectTimer;

        const connect = () => {
            if (ws.current?.readyState === WebSocket.OPEN) return;

            ws.current = new WebSocket(WS_URL);

            ws.current.onopen = () => {
                console.log('[WebSocket] Connected to incident stream.');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.event === 'NEW_INCIDENT') {
                        console.log('[WebSocket] New incident received:', message.data);
                        addIncident(message.data);
                    } else if (message.event === 'INCIDENT_UPDATED') {
                        console.log('[WebSocket] Incident updated:', message.data);
                        updateIncident(message.data);
                    }
                } catch (err) {
                    console.error('[WebSocket] Error parsing message:', err, event.data);
                }
            };

            ws.current.onclose = () => {
                console.warn('[WebSocket] Disconnected. Reconnecting in 5s...');
                ws.current = null;
                reconnectTimer = setTimeout(connect, 5000);
            };

            ws.current.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
                ws.current?.close();
            };
        };

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [addIncident, updateIncident]);
};
