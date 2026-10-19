import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './UI/Header';
import Sidebar from './UI/Sidebar';
import MapContainer from './Map/MapContainer';
import MapController from './Map/MapController';
import AreaAlertCard from './UI/AreaAlertCard';
import useMapStore from '../store/useMapStore';
import useGeolocation from '../hooks/useGeolocation';
import useTomTomTraffic from '../hooks/useTomTomTraffic';
import '../App.css';

const MainLayout = () => {
    useGeolocation();
    useTomTomTraffic();
    const location = useLocation();
    const {
        center,
        zoom,
        routes,
        activeRouteIndex,
        incidents: backendIncidents,
        tomtomIncidents,
        reports,
        trafficLayerEnabled,
        incidentLayerEnabled,
        userLocation,
        selectedRoute
    } = useMapStore();

    // Combine all incident sources for global intelligence with safety checks
    const allIncidents = [...(backendIncidents || []), ...(tomtomIncidents || [])].filter(Boolean);

    // Check for any active alerts
    const activeAlert = [...allIncidents, ...(reports || [])].find(i => {
        const sev = i?.severity?.toLowerCase();
        return sev === 'high' || sev === 'critical' || sev === 'evaluating...';
    }) || (allIncidents.length > 0 ? allIncidents[0] : null);

    const isHeavyRoute = selectedRoute && selectedRoute.congestion_level === 'heavy';
    const isIntelligencePage = ['/traffic', '/incidents', '/route'].includes(location.pathname);
    const showAlert = (activeAlert || isHeavyRoute || isIntelligencePage) && isIntelligencePage; // Only show on relevant pages

    return (
        <div className="app-shell">
            <Header />
            <Sidebar />

            {/* The Map stays here, persistent across all routes */}
            <div className="map-layout-wrapper">
                <MapContainer>
                    <MapController
                        center={center}
                        zoom={zoom}
                        routes={routes}
                        activeRouteIndex={activeRouteIndex}
                        incidents={allIncidents}
                        reports={reports}
                        trafficLayerEnabled={trafficLayerEnabled}
                        incidentEnabled={incidentLayerEnabled}
                        userLocation={userLocation}
                    />
                </MapContainer>
            </div>

            <main className="content-overlay">
                {activeAlert && (
                    <AreaAlertCard alert={activeAlert} />
                )}
                {/* Only the side panels or overlay content changes */}
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
