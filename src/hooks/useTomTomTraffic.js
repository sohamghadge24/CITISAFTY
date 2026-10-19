import { useEffect } from 'react';
import useMapStore from '../store/useMapStore';
import { tomtomService } from '../services/tomtom';
import { useTheme } from '../store/ThemeContext';

const useTomTomTraffic = () => {
    const { mapInstance } = useTheme();
    const { setTomTomIncidents, trafficLayerEnabled } = useMapStore();

    useEffect(() => {
        if (!mapInstance || !trafficLayerEnabled) return;

        const updateTraffic = async () => {
            const bounds = mapInstance.getBounds();
            const bbox = [
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth()
            ];
            const zoom = Math.floor(mapInstance.getZoom());

            const ttIncidents = await tomtomService.getIncidents(bbox, zoom);
            if (ttIncidents.length > 0) {
                setTomTomIncidents(ttIncidents);
            }
        };

        // Initial fetch
        updateTraffic();

        // Update on move end
        mapInstance.on('moveend', updateTraffic);

        // Polling every 2 minutes (TomTom data freshness)
        const interval = setInterval(updateTraffic, 120000);

        return () => {
            if (mapInstance) {
                mapInstance.off('moveend', updateTraffic);
            }
            clearInterval(interval);
        };
    }, [mapInstance, trafficLayerEnabled, setTomTomIncidents]);
};

export default useTomTomTraffic;
