import axios from 'axios';
import { Platform } from 'react-native';
import { store } from '../store';
import { addAlert } from '../store/slices/alertsSlice';
import { setIncidents } from '../store/slices/trafficSlice';

// Helper to determine accurate Localhost for Emulators OR Physical Devices via Expo
// 10.0.2.2 is the standard loopback IP for Android Emulator reaching the host machine.
// 127.0.0.1 (localhost) is standard for iOS simulator.
export const getHostIp = () => {
    if (__DEV__) {
        return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    }
    // Production Domain
    return 'api.safecity.ai';
};

const HOST = getHostIp();
export const API_BASE_URL = `http://${HOST}:8000/api/v1`;
export const WS_URL = `ws://${HOST}:8000/ws/alerts`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use(
    async (config) => {
        // In a premium/live app, retrieve the token from secure storage securely.
        const token = 'mock-premium-jwt-token';
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const ReportService = {
    submitReport: async (reportData: FormData) => {
        return apiClient.post('/reports', reportData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getIncidents: async () => {
        return apiClient.get('/incidents');
    },
};

export const NavigationService = {
    getRoute: async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
        return apiClient.get('/navigation/route', { params: { ...origin, destLat: destination.lat, destLng: destination.lng } });
    },
    searchDestination: async (query: string) => {
        return apiClient.get('/navigation/search', { params: { q: query } });
    },
    getRecentRoutes: async () => {
        return apiClient.get('/navigation/routes');
    },
    getAiSuggestion: async () => {
        return apiClient.get('/navigation/ai-suggestion');
    }
};

export const UserService = {
    getProfile: async () => {
        return apiClient.get('/user/profile');
    },
};

class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectInterval = 3000;

    connect() {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('Premium WebSocket connected to ', WS_URL);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'accident_alert' || data.type === 'traffic_alert' || data.type === 'emergency_alert') {
                    // Dispatch premium alert to Redux
                    store.dispatch(addAlert({
                        id: Date.now().toString(),
                        type: data.type === 'emergency_alert' ? 'EMERGENCY_RESPONSE' : 'AI_WARNING',
                        title: data.title || 'Alert',
                        message: data.message || 'New incident reported.',
                        severity: data.severity || 'HIGH',
                        timestamp: new Date().toISOString(),
                        read: false
                    }));
                } else if (data.type === 'incidents_update') {
                    store.dispatch(setIncidents(data.incidents));
                }
            } catch (err) {
                console.error('Error parsing WS message', err);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.ws?.close();
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const wsService = new WebSocketService();

export default apiClient;
