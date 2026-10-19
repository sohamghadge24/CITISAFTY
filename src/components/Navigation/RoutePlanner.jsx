import React, { useState } from 'react';
import { Search, MapPin, Navigation, Info, AlertOctagon } from 'lucide-react';
import { tomtomService } from '../../services/tomtom';
import { useTheme } from '../../store/ThemeContext';
import '../../styles/glass.css';

const RoutePlanner = ({ onRouteSelected }) => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { mapInstance } = useTheme();

    const handleSearch = async () => {
        if (!source || !destination) return;
        setIsLoading(true);

        try {
            const srcRes = await tomtomService.geocode(source);
            const destRes = await tomtomService.geocode(destination);

            if (srcRes.length > 0 && destRes.length > 0) {
                const routesData = await tomtomService.getRouting(srcRes[0].pos, destRes[0].pos);
                setRoutes(routesData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const selectRoute = (route, index) => {
        onRouteSelected(route, index);
    };

    return (
        <div className="glass-panel route-planner-panel" style={{ width: '380px', margin: '1rem', overflow: 'hidden' }}>
            <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Intelligent Navigator</h2>

                <div className="search-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--accent-primary)' }} />
                        <input
                            type="text"
                            placeholder="Current location"
                            className="glass-input"
                            style={{ width: '100%', paddingLeft: '40px' }}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Navigation size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--accent-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Where to?"
                            className="glass-input"
                            style={{ width: '100%', paddingLeft: '40px' }}
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>

                    <button className="glass-button" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? 'Optimizing...' : 'Find Fastest Route'}
                    </button>
                </div>

                {routes.length > 0 && (
                    <div className="routes-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Alternative Routes Optimized</p>
                        {routes.map((route, idx) => (
                            <div
                                key={idx}
                                className="glass-card"
                                style={{ padding: '0.75rem', cursor: 'pointer', border: '1px solid var(--border-panel)' }}
                                onClick={() => selectRoute(route, idx)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600' }}>{Math.round(route.summary.travelTimeInSeconds / 60)} min</span>
                                    <span style={{ fontSize: '0.875rem' }}>{(route.summary.lengthInMeters / 1000).toFixed(1)} km</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {route.summary.trafficDelayInSeconds > 0 && (
                                        <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <AlertOctagon size={12} /> {Math.round(route.summary.trafficDelayInSeconds / 60)}m delay
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Live Traffic Aware</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoutePlanner;
