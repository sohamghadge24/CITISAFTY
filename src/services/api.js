const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiService = {
    /**
     * Submit a verified incident to the backend
     */
    async submitIncident(reportData) {
        try {
            const response = await fetch(`${API_BASE_URL}/map/incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: reportData.type,
                    description: reportData.description || "Reported from Mobile/Web interface",
                    lat: reportData.lat,
                    lng: reportData.lng,
                    image: reportData.image,
                    user_severity: reportData.severity
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit report to server');
            }

            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Fetch live traffic data for map visualization
     */
    async getTrafficData() {
        const response = await fetch(`${API_BASE_URL}/map/traffic`);
        const result = await response.json();
        return result.data;
    },

    /**
     * Get server-side computed production-grade routes.
     * Supports multiple alternatives and encoded polylines.
     */
    async getRoute(start, destination, includeAlternatives = true) {
        try {
            const response = await fetch(`${API_BASE_URL}/routing/compute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: { lat: start.lat, lng: start.lng },
                    destination: { lat: destination.lat, lng: destination.lng },
                    profile: 'driving',
                    include_alternatives: includeAlternatives
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Routing service failure');

            return result.routes; // Returns array of route objects
        } catch (error) {
            console.error('Routing Service Error:', error);
            throw error;
        }
    },

    /**
     * Fetch all active incidents
     */
    async getIncidents() {
        try {
            const response = await fetch(`${API_BASE_URL}/map/incidents`);
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Failed to fetch incidents:', error);
            return [];
        }
    },

    /**
     * Diagnostic: Test ML model directly with an image
     */
    async testMLModel(imageData, description) {
        try {
            const response = await fetch(`${API_BASE_URL}/ml/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    metadata: { description: description || "ML API Test" }
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'ML Engine Failure');
            return result;
        } catch (error) {
            console.error('ML Test Error:', error);
            throw error;
        }
    },

    /**
     * Fetch list of available architectures
     */
    async fetchModels() {
        const response = await fetch(`${API_BASE_URL}/models/list`);
        const result = await response.json();
        return result.models;
    },

    /**
     * Get evaluation metrics for a specific system
     */
    async getModelMetrics(modelId) {
        const response = await fetch(`${API_BASE_URL}/models/metrics/${modelId}`);
        const result = await response.json();
        return result.metrics;
    },

    /**
     * Request side-by-side comparison
     */
    async compareModels(modelIds) {
        const response = await fetch(`${API_BASE_URL}/models/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modelIds)
        });
        const result = await response.json();
        return result.comparison;
    },

    // Report & Dispatch Authority API
    async fetchVerifiedIncidents() {
        const response = await fetch(`${API_BASE_URL}/reports/verified`);
        return await response.json();
    },

    async generateOfficialReport(incidentId) {
        const response = await fetch(`${API_BASE_URL}/reports/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incident_id: incidentId })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async dispatchAuthority(dispatchData) {
        const response = await fetch(`${API_BASE_URL}/reports/dispatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dispatchData)
        });
        return await response.json();
    }
};
