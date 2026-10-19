import React, { useState, useEffect } from 'react';
import { Activity, Database, Play, RefreshCcw } from 'lucide-react';
import { apiService } from '../../services/api';
import JsonViewer from '../../components/Dashboard/Admin/JsonViewer';

const TrafficTest = () => {
    const [trafficData, setTrafficData] = useState(null);
    const [loading, setLoading] = useState(false);

    const pullLiveTraffic = async () => {
        setLoading(true);
        try {
            const data = await apiService.getTrafficData();
            setTrafficData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        pullLiveTraffic();
    }, []);

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>Live Traffic Intelligence</h1>
                    <p>Direct view into the congestion scoring engine.</p>
                </div>
            </header>

            <div className="stats-grid-primary">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ACTIVE SEGMENTS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{trafficData?.length || 0}</div>
                        </div>
                        <Activity color="#3b82f6" />
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>QUERY STATUS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>Healthy</div>
                        </div>
                        <Database color="#10b981" />
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3><Play size={14} /> Raw Congestion Telemetry</h3>
                    <button className="refresh-btn" onClick={pullLiveTraffic} disabled={loading}>
                        {loading ? <RefreshCcw className="spinning" /> : 'Fetch Latest State'}
                    </button>
                </div>
                {trafficData ? (
                    <JsonViewer data={trafficData} />
                ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        Synchronizing with data layer...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficTest;
