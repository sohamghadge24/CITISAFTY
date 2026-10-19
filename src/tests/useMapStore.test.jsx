import { describe, it, expect, beforeEach } from 'vitest';
import useMapStore from '../store/useMapStore';

describe('useMapStore', () => {
    beforeEach(() => {
        // Zustand stores can hold state between tests if not reset
        // Manually reset state for purity
        useMapStore.setState({
            incidents: [],
            routes: [],
            activeRouteIndex: 0,
            selectedRoute: null,
            userLocation: null
        });
    });

    it('should add an incident correctly and prevent duplicates', () => {
        const store = useMapStore.getState();
        const testIncident = { id: 1, type: "Accident", severity: "High" };

        // Add incident
        store.addIncident(testIncident);
        let updatedState = useMapStore.getState();
        expect(updatedState.incidents.length).toBe(1);
        expect(updatedState.incidents[0].type).toBe("Accident");

        // Add same incident again (duplicate check)
        store.addIncident(testIncident);
        updatedState = useMapStore.getState();
        expect(updatedState.incidents.length).toBe(1); // Should still be 1
    });

    it('should update an existing incident correctly', () => {
        const store = useMapStore.getState();
        const testIncident = { id: 2, type: "Traffic Violation", severity: "Low", is_active: true };

        store.addIncident(testIncident);

        // Update the incident
        const updateStore = useMapStore.getState();
        updateStore.updateIncident({ id: 2, severity: "High", is_active: false });

        const finalState = useMapStore.getState();
        expect(finalState.incidents[0].severity).toBe("High");
        expect(finalState.incidents[0].is_active).toBe(false);
        expect(finalState.incidents[0].type).toBe("Traffic Violation"); // Should retain other fields
    });

    it('should manage routes correctly', () => {
        const store = useMapStore.getState();
        const start = { lat: 10, lng: 20 };
        const end = { lat: 30, lng: 40 };
        const dummyRoutes = [{ id: 'route1' }, { id: 'route2' }];

        store.setRoutes(start, end, dummyRoutes);

        let currentState = useMapStore.getState();
        expect(currentState.routes.length).toBe(2);
        expect(currentState.activeRouteIndex).toBe(0);
        expect(currentState.selectedRoute.id).toBe('route1');

        currentState.setActiveRoute(1);
        currentState = useMapStore.getState();
        expect(currentState.activeRouteIndex).toBe(1);
        expect(currentState.selectedRoute.id).toBe('route2');

        currentState.resetRoute();
        currentState = useMapStore.getState();
        expect(currentState.routes.length).toBe(0);
        expect(currentState.startLocation).toBe(null);
    });
});
