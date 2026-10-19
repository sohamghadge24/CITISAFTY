import React, { useState } from 'react';
import { Truck, Ambulance, Shield, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

const DispatchControl = () => {
    const [incidentId, setIncidentId] = useState('');
    const [authority, setAuthority] = useState('Traffic Police');
    const [priority, setPriority] = useState('Standard');
    const [dispatchStatus, setDispatchStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDispatch = async () => {
        setLoading(true);
        try {
            const res = await apiService.dispatchAuthority({
                incident_id: parseInt(incidentId),
                authority_type: authority,
                priority: priority
            });
            setDispatchStatus(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const authorities = [
        { name: 'Traffic Police', icon: <Shield size={20} />, color: '#3b82f6' },
        { name: 'Ambulance', icon: <Ambulance size={20} />, color: '#ef4444' },
        { name: 'Fire Department', icon: <Truck size={20} />, color: '#f59e0b' }
    ];

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>Dispatch Control Center</h1>
                    <p>Orchestrate emergency response and unit allocation.</p>
                </div>
            </header>

            <div className="secondary-metrics-row">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><Truck size={16} /> Strategy & Allocation</h3>
                    <div className="test-form">
                        <div className="input-block">
                            <label>INCIDENT REFERENCE</label>
                            <input className="dash-input" placeholder="e.g. 1" value={incidentId} onChange={e => setIncidentId(e.target.value)} />
                        </div>

                        <div className="input-block">
                            <label>TARGET AUTHORITY</label>
                            <div className="authority-picker" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {authorities.map(a => (
                                    <button
                                        key={a.name}
                                        className={`auth-btn ${authority === a.name ? 'active' : ''}`}
                                        onClick={() => setAuthority(a.name)}
                                        style={{
                                            padding: '1rem 0.5rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            background: authority === a.name ? `${a.color}22` : 'rgba(255,255,255,0.02)',
                                            color: authority === a.name ? a.color : '#94a3b8',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.65rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {a.icon}
                                        {a.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-block">
                            <label>PRIORITY LEVEL</label>
                            <select className="dash-select" value={priority} onChange={e => setPriority(e.target.value)}>
                                <option>Standard</option>
                                <option>Urgent</option>
                                <option>High Priority (Emergency)</option>
                            </select>
                        </div>

                        <button
                            className="refresh-btn"
                            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                            onClick={handleDispatch}
                            disabled={!incidentId || loading}
                        >
                            <Send size={16} /> Initiate Dispatch Sequence
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><Clock size={16} /> Active Dispatch Status</h3>
                    {dispatchStatus ? (
                        <div className="dispatch-success-panel" style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div className="success-icon" style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#10b981' }}>
                                <CheckCircle size={48} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unit Dispatched</h2>
                            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>ID: {dispatchStatus.dispatch_id} • Assigned to {authority}</p>

                            <div className="dispatch-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.25rem' }}>UNITS EN ROUTE</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{dispatchStatus.units_assigned}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.25rem' }}>EST. ARRIVAL</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{dispatchStatus.eta_minutes}m</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, flexDirection: 'column' }}>
                            <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
                            <p>No active dispatch sequence initiated.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DispatchControl;
