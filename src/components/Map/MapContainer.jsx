import React, { useEffect, useRef, memo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../../store/ThemeContext';

const MapContainer = memo(({ children }) => {
    const mapContainer = useRef(null);
    const { theme, setMapInstance } = useTheme();
    const mapRef = useRef(null);

    const getMapStyle = (t) => {
        return t === 'dark'
            ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    };

    useEffect(() => {
        // Load once per session
        if (mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: getMapStyle(theme),
            center: [72.8777, 19.0760],
            zoom: 12,
            antialias: true,
            pitch: 45,
        });

        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        map.on('load', () => {
            mapRef.current = map;
            setMapInstance(map);
        });

        return () => {
            // Clean cleanup
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                setMapInstance(null);
            }
        };
    }, []);

    // Theme switching without reload
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setStyle(getMapStyle(theme));
        }
    }, [theme]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            {children}
        </div>
    );
});

export default MapContainer;
