import React, { useState } from 'react';
import { Navigation, Map as MapIcon, Play, RefreshCcw } from 'lucide-react';
import { apiService } from '../../services/api';

const RoutingTest = () => {
    const [start, setStart] = useState('New Delhi');
    const [dest, setDest] = useState('Noida');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const testRoute = async () => {
        setLoading(true);
        try {
            // Simulated geocoding + routing for test
            const s = { lat: 28.6139, lng: 77.2090 };
            const e = { lat: 28.5355, lng: 77.3910 };
            const routes = await apiService.getRoute(s, e);
            setResults(routes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>Routing Engine Test</h1>
                    <p>Validate OSRM logic and multi-route computation.</p>
                </div>
            </header>

            <div className="secondary-metrics-row">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><MapIcon size={16} /> Parameters</h3>
                    <div className="test-form">
                        <div className="input-block">
                            <label>Start Location</label>
                            <input className="dash-input" value={start} onChange={e => setStart(e.target.value)} />
                        </div>
                        <div className="input-block">
                            <label>Destination</label>
                            <input className="dash-input" value={dest} onChange={e => setDest(e.target.value)} />
                        </div>
                        <button className="refresh-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={testRoute} disabled={loading}>
                            {loading ? <RefreshCcw className="spinning" /> : <><Play size={16} /> Compute Routes</>}
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><Navigation size={16} /> Computed Logic Paths</h3>
                    {results ? (
                        <div className="route-results">
                            {results.map((r, i) => (
                                <div key={i} className="m-item" style={{ flexDirection: 'column', gap: '0.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>Route {i + 1} ({r.congestion_level})</strong>
                                        <span className="text-success">{r.eta_minutes} mins</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Distance: {r.distance_km}km | Engine: OSRM-V5</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontStyle: 'italic' }}>
                            Verify engine connectivity...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutingTest;
