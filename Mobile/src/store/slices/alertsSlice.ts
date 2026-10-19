import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Alert {
    id: string;
    type: 'AI_WARNING' | 'EMERGENCY_RESPONSE' | 'SYS_UPDATE';
    title: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    distanceAheadMs?: number; // In meters
    read: boolean;
}

interface AlertsState {
    activeAlerts: Alert[];
    criticalEmergencyActive: boolean;
}

const initialState: AlertsState = {
    activeAlerts: [],
    criticalEmergencyActive: false,
};

export const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        addAlert(state, action: PayloadAction<Alert>) {
            state.activeAlerts.unshift(action.payload);
            if (action.payload.severity === 'CRITICAL') {
                state.criticalEmergencyActive = true;
            }
        },
        markAsRead(state, action: PayloadAction<string>) {
            const alert = state.activeAlerts.find(a => a.id === action.payload);
            if (alert) alert.read = true;
        },
        clearCriticalEmergency(state) {
            state.criticalEmergencyActive = false;
        },
    },
});

export const { addAlert, markAsRead, clearCriticalEmergency } = alertsSlice.actions;
export default alertsSlice.reducer;
