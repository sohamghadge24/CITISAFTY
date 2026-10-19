const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || 'YOUR_TOMTOM_API_KEY';
const BASE_URL = 'https://api.tomtom.com/traffic/services';

/**
 * TomTom Traffic API Service
 * Documentation: https://developer.tomtom.com/traffic-api/documentation/traffic-incidents/incident-details
 */
export const tomtomService = {
    /**
     * Get traffic incidents within a bounding box
     * @param {Array} bbox [minLng, minLat, maxLng, maxLat]
     * @param {number} zoom Current map zoom level
     */
    async getIncidents(bbox, zoom = 12) {
        if (TOMTOM_API_KEY === 'YOUR_TOMTOM_API_KEY') {
            console.warn('TomTom API Key is missing. Please set VITE_TOMTOM_API_KEY in your environment.');
            return [];
        }

        try {
            // style=s3, bbox, zoom, trafficModelId=-1 (latest), format=json
            const bboxStr = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
            const url = `${BASE_URL}/5/incidentDetails/s3/${bboxStr}/${zoom}/-1/json?key=${TOMTOM_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('TomTom Incidents API failed');

            const data = await response.json();

            // Transform TomTom incidents to our app's internal format
            return (data.tm?.poi || []).map(incident => ({
                id: incident.id,
                type: this.mapIncidentType(incident.ic),
                description: incident.d || 'Traffic incident',
                lat: incident.p.y,
                lng: incident.p.x,
                severity: this.mapSeverity(incident.ty),
                delay: incident.dl || 0, // delay in seconds
                length: incident.l || 0, // length in meters
            }));
        } catch (error) {
            console.error('TomTom Service Error (Incidents):', error);
            return [];
        }
    },

    /**
     * Get traffic flow for a specific point
     * @param {number} lat 
     * @param {number} lng 
     */
    async getFlowData(lat, lng, zoom = 12) {
        if (TOMTOM_API_KEY === 'YOUR_TOMTOM_API_KEY') return null;

        try {
            const url = `${BASE_URL}/4/flowSegmentData/absolute/${zoom}/json?key=${TOMTOM_API_KEY}&point=${lat},${lng}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('TomTom Flow API failed');

            const data = await response.json();
            return data.flowSegmentData;
        } catch (error) {
            console.error('TomTom Service Error (Flow):', error);
            return null;
        }
    },

    /**
     * Helper to map TomTom incident icons to app types
     */
    mapIncidentType(iconCategory) {
        const types = {
            1: 'Jam',
            2: 'Accident',
            3: 'Construction',
            4: 'Road Hazard',
            5: 'Road Closure',
        };
        return types[iconCategory] || 'Traffic';
    },

    /**
     * Helper to map TomTom significance to app severity
     */
    mapSeverity(type) {
        // TomTom ty: 0-Unknown, 1-Minor, 2-Moderate, 3-Major, 4-Undefined
        const levels = {
            1: 'low',
            2: 'medium',
            3: 'high',
            4: 'critical'
        };
        return levels[type] || 'medium';
    }
};
