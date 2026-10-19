import { create } from 'zustand';

const useMapStore = create((set) => ({
    // Map Viewport State
    center: [72.8777, 19.0760], // Mumbai
    zoom: 12,

    // Navigation & Location State
    userLocation: null,
    startLocation: null,
    destination: null,
    routes: [], // All alternate routes
    activeRouteIndex: 0,
    selectedRoute: null, // Computed active route derived from routes[activeRouteIndex]

    // Layer State
    trafficLayerEnabled: true,
    incidentLayerEnabled: true,

    // Data State
    incidents: [], // Backend Incidents
    tomtomIncidents: [], // TomTom Live Data
    reports: [],

    // Actions
    setViewport: (center, zoom) => set({ center, zoom }),
    setUserLocation: (location) => set({ userLocation: location }),
    setRoutes: (start, end, routes) => set({
        startLocation: start,
        destination: end,
        routes: routes,
        activeRouteIndex: 0,
        selectedRoute: routes[0]
    }),
    setActiveRoute: (index) => set((state) => ({
        activeRouteIndex: index,
        selectedRoute: state.routes[index]
    })),
    toggleTraffic: () => set((state) => ({ trafficLayerEnabled: !state.trafficLayerEnabled })),
    toggleIncidents: () => set((state) => ({ incidentLayerEnabled: !state.incidentLayerEnabled })),
    setIncidents: (incidents) => set({ incidents: incidents }),
    addIncident: (incident) => set((state) => {
        const id = incident.id || incident.incident_id;
        const exists = state.incidents.find((i) => (i.id || i.incident_id) === id);
        if (exists) return state;
        return { incidents: [{ ...incident, id }, ...state.incidents] };
    }),
    updateIncident: (updatedIncident) => set((state) => {
        const id = updatedIncident.id || updatedIncident.incident_id;
        return {
            incidents: state.incidents.map((inc) =>
                (inc.id || inc.incident_id) === id ? { ...inc, ...updatedIncident, id } : inc
            )
        };
    }),
    setTomTomIncidents: (incidents) => set({ tomtomIncidents: incidents }),
    addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
    resetRoute: () => set({ startLocation: null, destination: null, routes: [], selectedRoute: null, activeRouteIndex: 0 })
}));

export default useMapStore;
