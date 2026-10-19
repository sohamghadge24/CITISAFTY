import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Search, ArrowRightLeft, Clock, Route as RouteIcon } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { apiService } from '../services/api';
import '../styles/Pages.css';

const RoutePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        setRoutes,
        setActiveRoute,
        routes,
        activeRouteIndex,
        startLocation,
        destination,
        selectedRoute,
        resetRoute,
        userLocation
    } = useMapStore();

    const [startInput, setStartInput] = useState(searchParams.get('start') || '');
    const [destInput, setDestInput] = useState(searchParams.get('end') || '');
    const [loading, setLoading] = useState(false);

    // Sync inputs when URL changes
    useEffect(() => {
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        if (start) setStartInput(start);
        if (end) setDestInput(end);

        if (start && end) {
            calculateRoute(start, end);
        }
    }, [searchParams]);

    const calculateRoute = async (start = startInput, dest = destInput) => {
        if (!start || !dest) return;
        setLoading(true);
        try {
            const geocode = async (query) => {
                const cleanQuery = query.trim();
                if (cleanQuery.toLowerCase() === 'my location' && userLocation) {
                    return { lat: userLocation.lat, lng: userLocation.lng };
                }

                // Primary: Try Photon API (ElasticSearch based, highly forgiving for unstructured text)
                // Restricting BBOX to India roughly (68.1,6.7,97.4,35.5)
                try {
                    const response = await fetch(
                        `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&bbox=68.1,6.7,97.4,35.5&limit=1`
                    );
                    const data = await response.json();
                    if (data && data.features && data.features.length > 0) {
                        const coords = data.features[0].geometry.coordinates;
                        return { lat: coords[1], lng: coords[0] }; // Photon returns [lon, lat]
                    }
                } catch (e) {
                    console.warn("Photon geocoding failed, falling back to Nominatim...", e);
                }

                // Fallback: Strict Nominatim OSM Search - Restricted to India
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=in&limit=1`,
                        {
                            headers: {
                                'User-Agent': 'SafeCity-Traffic-Intelligence-App/1.0 (academic research)'
                            }
                        }
                    );
                    const data = await response.json();
                    return data && data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
                } catch (e) {
                    console.error("Geocoding fetch completely failed", e);
                    return null;
                }
            };

            const origin = await geocode(start);
            const target = await geocode(dest);

            if (!origin || !target) {
                alert(`Location not found: ${!origin ? start : dest}`);
                return;
            }

            const multiRoutes = await apiService.getRoute(origin, target);
            setRoutes(origin, target, multiRoutes);

            // Only update URL if different to avoid infinite loop
            if (searchParams.get('start') !== start || searchParams.get('end') !== dest) {
                setSearchParams({ start, end: dest });
            }
        } catch (error) {
            console.error('Routing failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="side-panel glass-panel"
        >
            <div className="panel-header">
                <Navigation className="header-icon" />
                <h2>Pathfinder Engine</h2>
            </div>

            <div className="input-group">
                <div className="input-row">
                    <MapPin size={18} className="input-icon" style={{ color: '#3b82f6' }} />
                    <input
                        type="text"
                        placeholder="Origin Point"
                        value={startInput}
                        onChange={(e) => setStartInput(e.target.value)}
                    />
                </div>
                <div className="input-divider">
                    <ArrowRightLeft size={16} />
                </div>
                <div className="input-row">
                    <MapPin size={18} className="input-icon" style={{ color: '#ef4444' }} />
                    <input
                        type="text"
                        placeholder="Destination"
                        value={destInput}
                        onChange={(e) => setDestInput(e.target.value)}
                    />
                </div>
            </div>

            <button
                className={`action-button ${loading ? 'loading' : ''}`}
                onClick={() => calculateRoute()}
                disabled={loading}
            >
                {loading ? 'Analyzing Traffic Patterns...' : 'Compute Optimal Path'}
            </button>

            {routes && routes.length > 0 && (
                <div className="routes-container">
                    <h3>Suggested Paths</h3>
                    <div className="route-options-list">
                        {routes.map((route, idx) => (
                            <motion.div
                                key={route.route_id}
                                whileHover={{ x: 5 }}
                                className={`route-option-card ${idx === activeRouteIndex ? 'active' : ''}`}
                                onClick={() => setActiveRoute(idx)}
                            >
                                <div className="route-header">
                                    <span className="route-name">{idx === 0 ? 'Optimal Route' : `Alternative ${idx}`}</span>
                                    <span className={`congestion-tag ${route.congestion_level}`}>
                                        {route.congestion_level.toUpperCase()} TRAFFIC
                                    </span>
                                </div>
                                <div className="route-stats">
                                    <div className="r-stat">
                                        <Clock size={14} />
                                        <span>{route.traffic_adjusted_eta} mins</span>
                                    </div>
                                    <div className="r-stat">
                                        <RouteIcon size={14} />
                                        <span>{route.distance_km} km</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="reset-btn" onClick={resetRoute}>Clear Explorer State</button>
                </div>
            )}
        </motion.div>
    );
};

export default RoutePage;
