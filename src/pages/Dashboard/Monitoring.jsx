import React, { useState } from 'react';
import { Database, Search, Filter, ShieldAlert } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const Monitoring = () => {
    const { logs } = useDashboard();
    const [filter, setFilter] = useState('ALL');

    const filteredLogs = logs.filter(l => filter === 'ALL' || l.type.toUpperCase() === filter);

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>System Monitoring</h1>
                    <p>Audit logs and hardware telemetry for the traffic cluster.</p>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="log-panel-header" style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Database size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Log Stream</span>
                    </div>

                    <div className="log-filters" style={{ display: 'flex', gap: '0.5rem' }}>
                        {['ALL', 'INFO', 'SUCCESS', 'ERROR'].map(type => (
                            <button
                                key={type}
                                className={`filter-btn ${filter === type ? 'active' : ''}`}
                                onClick={() => setFilter(type)}
                                style={{ fontSize: '0.7rem' }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="log-viewer-body" style={{
                    height: '600px',
                    overflowY: 'auto',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    background: '#050505'
                }}>
                    {filteredLogs.map(log => (
                        <div key={log.id} style={{
                            padding: '0.5rem 0',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            gap: '1rem'
                        }}>
                            <span style={{ opacity: 0.3, width: '80px' }}>[{log.time}]</span>
                            <span style={{
                                fontWeight: 700,
                                width: '70px',
                                color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#10b981' : '#3b82f6'
                            }}>
                                {log.type.toUpperCase()}
                            </span>
                            <span style={{ opacity: 0.8 }}>{log.msg}</span>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.2 }}>
                            No logs found for this filter cycle.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
