import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTheme } from '../../store/ThemeContext';
import polyline from '@mapbox/polyline';
import { apiService } from '../../services/api';

const MapController = ({ center, zoom, routes, activeRouteIndex, incidents, reports, trafficLayerEnabled, incidentEnabled, userLocation }) => {
    const { mapInstance } = useTheme();
    const markersRef = useRef([]);
    const routeLayersRef = useRef([]);
    const [liveTraffic, setLiveTraffic] = useState([]);

    // 1. Incident & Report Markers
    useEffect(() => {
        if (!mapInstance) return;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (!incidentEnabled) return;

        const allMarkers = [...(incidents || []), ...(reports || [])];
        allMarkers.forEach((incident) => {
            const pos = [incident.lng, incident.lat];
            if (!pos[0] || !pos[1]) return;

            const el = document.createElement('div');
            el.className = 'marker-wrapper';
            const sev = incident.severity?.toLowerCase();
            let color = '#3b82f6';
            if (sev === 'critical' || sev === 'high') color = 'var(--secondary-color, #ef4444)';
            else if (sev === 'medium') color = 'var(--warning-color, #f59e0b)';
            else if (sev === 'low') color = 'var(--success-color, #10b981)';

            el.innerHTML = `
                <div class="premium-marker" style="--marker-color: ${color}; position: relative; cursor: pointer;">
                    <div class="pulse-ring" style="background: ${color}; opacity: 0.4; position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; border-radius: 50%; animation: pulse-animation 2s infinite;"></div>
                    <div class="marker-icon" style="background: ${color}; padding: 6px; border-radius: 50%; box-shadow: 0 0 15px ${color}88; position: relative; z-index: 2; color: white;">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                </div>
            `;

            const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat(pos)
                .setPopup(new maplibregl.Popup({ offset: 40, className: 'glass-popup animated-popup' }).setHTML(`
                    <div class="popup-glass-content" style="background: var(--bg-panel); backdrop-filter: blur(16px); padding: 12px; border-radius: 12px; border: 1px solid var(--border-panel); color: var(--text-main); font-family: Inter, sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                        <span class="severity-tag ${incident.severity ? incident.severity.toLowerCase() : 'low'}" style="background: ${color}33; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${incident.severity || 'Reported'}</span>
                        <h4 style="margin: 8px 0 4px 0; font-size: 1rem;">${incident.type}</h4>
                        <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">${incident.description || 'Impact analysis in progress.'}</p>
                    </div>
                `))
                .addTo(mapInstance);
            markersRef.current.push(marker);
        });
    }, [mapInstance, incidents, reports, incidentEnabled]);

    // 2. Multi-Route Production Rendering
    useEffect(() => {
        if (!mapInstance) return;

        const cleanup = () => {
            if (mapInstance._flowAnimationId) {
                cancelAnimationFrame(mapInstance._flowAnimationId);
                mapInstance._flowAnimationId = null;
            }

            // Remove layers first
            routeLayersRef.current.forEach(layerId => {
                if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
            });

            // Remove sources (sources are route-0-source, route-1-source, route-flow-source etc.)
            for (let i = 0; i < 10; i++) {
                const sid = `route-${i}-source`;
                if (mapInstance.getSource(sid)) mapInstance.removeSource(sid);
            }
            if (mapInstance.getSource('route-flow-source')) {
                mapInstance.removeSource('route-flow-source');
            }

            routeLayersRef.current = [];
        };

        cleanup();

        if (!routes || routes.length === 0) return;

        let activeRouteBounds = null;

        routes.forEach((route, index) => {
            const isLatest = index === activeRouteIndex;
            const sourceId = `route-${index}-source`;
            const layerId = isLatest ? 'route-active' : `route-alt-${index}`;
            const glowId = `${layerId}-glow`;

            routeLayersRef.current.push(layerId, glowId);

            const decodedCoords = polyline.decode(route.geometry).map(p => [p[1], p[0]]);
            if (decodedCoords.length === 0) return;

            mapInstance.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: decodedCoords }
                }
            });

            const getRouteColor = (isActive, congestion) => {
                if (!isActive) return '#94a3b8';
                if (congestion === 'heavy') return '#ef4444';
                if (congestion === 'moderate') return '#f59e0b';
                return '#3b82f6'; // Low / Default
            };

            const routeColor = getRouteColor(isLatest, route.congestion_level);

            if (isLatest) {
                mapInstance.addLayer({
                    id: glowId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': routeColor,
                        'line-width': 15,
                        'line-opacity': 0.2,
                        'line-blur': 10
                    }
                });
                activeRouteBounds = decodedCoords.reduce((acc, coord) => {
                    return acc.extend(coord);
                }, new maplibregl.LngLatBounds(decodedCoords[0], decodedCoords[0]));

                // Add Animated Flow Point for Active Route Simulation
                const flowSourceId = `route-flow-source`;
                const flowLayerId = `route-flow-layer`;

                routeLayersRef.current.push(flowLayerId);

                mapInstance.addSource(flowSourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: decodedCoords[0] }
                    }
                });

                mapInstance.addLayer({
                    id: flowLayerId,
                    type: 'circle',
                    source: flowSourceId,
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#ffffff',
                        'circle-pitch-alignment': 'map',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#3b82f6'
                    }
                });

                let i = 0;
                let animationFrameId;
                const animatePoint = () => {
                    if (!mapInstance || !mapInstance.getSource(flowSourceId)) return;

                    // Simple linear interpolation could be used, but for now we hop between decoded points
                    const coordinates = decodedCoords[Math.floor(i) % decodedCoords.length];

                    mapInstance.getSource(flowSourceId).setData({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: coordinates }
                    });

                    i += 1.5; // Speed of simulation
                    animationFrameId = requestAnimationFrame(animatePoint);
                };
                animatePoint();

                // Store animation frame ID to clean it up when route changes
                mapInstance._flowAnimationId = animationFrameId;
            }

            mapInstance.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': routeColor,
                    'line-width': isLatest ? 5 : 3,
                    'line-opacity': isLatest ? 1 : 0.4,
                }
            });
        });

        if (activeRouteBounds) {
            mapInstance.fitBounds(activeRouteBounds, { padding: 80, duration: 1500 });
        }

        return cleanup;
    }, [mapInstance, routes, activeRouteIndex]);

    // 3. User Current Position Pulse
    useEffect(() => {
        if (!mapInstance || !userLocation) return;

        const el = document.createElement('div');
        el.className = 'current-pos-marker';
        el.innerHTML = `
            <div class="pulse-ring"></div>
            <div class="pos-dot" style="width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
        `;

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(mapInstance);

        return () => marker.remove();
    }, [mapInstance, userLocation]);

    // 4. Viewport Sync (Region Selection)
    useEffect(() => {
        if (!mapInstance || !center) return;
        mapInstance.flyTo({
            center: center,
            zoom: zoom || 12,
            essential: true,
            duration: 2000
        });
    }, [mapInstance, center, zoom]);

    // 5. Real-time Traffic Overlay (TomTom Raster Tiles)
    useEffect(() => {
        if (!mapInstance) return;

        const SOURCE_ID = 'tomtom-traffic-flow';
        const LAYER_ID = 'tomtom-traffic-layer';
        const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY || 'YOUR_TOMTOM_API_KEY';

        const cleanup = () => {
            if (mapInstance.getLayer(LAYER_ID)) mapInstance.removeLayer(LAYER_ID);
            if (mapInstance.getSource(SOURCE_ID)) mapInstance.removeSource(SOURCE_ID);
        };

        if (!trafficLayerEnabled || TOMTOM_KEY === 'YOUR_TOMTOM_API_KEY') {
            cleanup();
            return;
        }

        mapInstance.addSource(SOURCE_ID, {
            type: 'raster',
            tiles: [
                `https://a.api.tomtom.com/traffic/map/4/tile/flow/relative-delay/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`
            ],
            tileSize: 256
        });

        const beforeId = mapInstance.getLayer('route-active') ? 'route-active' : undefined;

        mapInstance.addLayer({
            id: LAYER_ID,
            type: 'raster',
            source: SOURCE_ID,
            paint: { 'raster-opacity': 0.8 }
        }, beforeId);

        return cleanup;
    }, [mapInstance, trafficLayerEnabled]);

    // Live Traffic Intelligence Integration
    useEffect(() => {
        if (!trafficLayerEnabled) return;

        const fetchTraffic = async () => {
            try {
                const data = await apiService.getTrafficData();
                setLiveTraffic(data);
            } catch (error) {
                console.error("Traffic fetch failed:", error);
            }
        };

        fetchTraffic();
        const interval = setInterval(fetchTraffic, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [trafficLayerEnabled]);

    useEffect(() => {
        if (!mapInstance) return;
        
        const sourceId = 'live-traffic-source';
        const layerId = 'live-traffic-layer';
        
        if (!trafficLayerEnabled || !liveTraffic || liveTraffic.length === 0) {
            if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
            if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
            return;
        }

        const geojsonData = {
            type: 'FeatureCollection',
            features: liveTraffic.map(segment => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [segment.start_lng, segment.start_lat],
                        [segment.end_lng, segment.end_lat]
                    ]
                },
                properties: {
                    status: segment.status,
                    congestion: segment.congestion_score
                }
            }))
        };

        if (mapInstance.getSource(sourceId)) {
            mapInstance.getSource(sourceId).setData(geojsonData);
        } else {
            mapInstance.addSource(sourceId, { type: 'geojson', data: geojsonData });
            
            // Render beautiful glowing traffic segments based on severity
            mapInstance.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': [
                        'match',
                        ['get', 'status'],
                        'closed', '#b91c1c',      // Dark Red
                        'congested', '#ef4444',   // Red
                        'moderate', '#f59e0b',    // Orange
                        '#10b981'                 // Green (Normal)
                    ],
                    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 16, 8],
                    'line-opacity': 0.8,
                    'line-blur': 1
                }
            }, 'waterway'); // Keep below labels
        }
    }, [mapInstance, liveTraffic, trafficLayerEnabled]);

    return null;
};

export default MapController;
