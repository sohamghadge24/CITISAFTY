import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Incident {
    id: string;
    type: 'Accident' | 'Traffic Violation' | 'Road Hazard' | 'Traffic Jam';
    severity: 'Low' | 'Medium' | 'High' | 'CRITICAL';
    coords: { lat: number; lng: number };
    timestamp: string;
}

interface TrafficState {
    incidents: Incident[];
    route: any; // GeoJSON for map line string
    currentLocation: { lat: number; lng: number } | null;
    speedLimit: number | null;
    congestion: 'Low' | 'Medium' | 'High';
}

const initialState: TrafficState = {
    incidents: [],
    route: null,
    currentLocation: null,
    speedLimit: null,
    congestion: 'Low',
};

export const trafficSlice = createSlice({
    name: 'traffic',
    initialState,
    reducers: {
        setCurrentLocation(state, action: PayloadAction<{ lat: number; lng: number }>) {
            state.currentLocation = action.payload;
        },
        setRoute(state, action: PayloadAction<any>) {
            state.route = action.payload;
        },
        setIncidents(state, action: PayloadAction<Incident[]>) {
            state.incidents = action.payload;
        },
    },
});

export const { setCurrentLocation, setRoute, setIncidents } = trafficSlice.actions;
export default trafficSlice.reducer;
