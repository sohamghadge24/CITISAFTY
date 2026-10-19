import React, { useState } from 'react';
import { FileText, Download, Send, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';
import { apiService } from '../../services/api';

const ReportGenerator = () => {
    const [incidentId, setIncidentId] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.generateOfficialReport(incidentId);
            setReport(res);
        } catch (err) {
            setError(err.message);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>Official Report Engine</h1>
                    <p>Generate structured AI-validated reports for legal and dispatch use.</p>
                </div>
            </header>

            <div className="secondary-metrics-row" style={{ gridTemplateColumns: '350px 1fr' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><FileText size={16} /> Report Parameters</h3>
                    <div className="test-form">
                        <div className="input-block">
                            <label>INCIDENT REFERENCE ID</label>
                            <input
                                className="dash-input"
                                placeholder="e.g. 1, 2, 3..."
                                value={incidentId}
                                onChange={e => setIncidentId(e.target.value)}
                            />
                        </div>
                        <button
                            className="refresh-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={handleGenerate}
                            disabled={!incidentId || loading}
                        >
                            {loading ? 'Processing...' : 'Generate Official Report'}
                        </button>
                    </div>

                    {error && (
                        <div className="error-box" style={{ marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.8rem', color: '#ef4444' }}>
                            <AlertTriangle size={14} style={{ marginBottom: '0.5rem' }} />
                            <div>{error}</div>
                        </div>
                    )}
                </div>

                <div className="glass-panel report-preview-panel" style={{ padding: '2rem', minHeight: '600px', background: '#fff', color: '#1e293b' }}>
                    {report ? (
                        <div className="report-template">
                            <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>SafeCity Intelligence Agency</h2>
                                    <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7 }}>Official Traffic Incident Protocol Report</p>
                                </div>
                                <ShieldCheck size={32} color="#1e293b" />
                            </div>

                            <div className="report-body" style={{ fontSize: '0.9rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b' }}>REPORT ID</label>
                                        <div style={{ fontWeight: 700 }}>{report.report_id}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b' }}>TIMESTAMP</label>
                                        <div style={{ fontWeight: 700 }}>{new Date(report.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>INCIDENT CLASSIFICATION</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div><strong>TYPE:</strong> {report.incident_details.type}</div>
                                        <div><strong>SEVERITY:</strong> {report.incident_details.severity}</div>
                                        <div style={{ gridColumn: 'span 2' }}><strong>LOCATION:</strong> {report.incident_details.location}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem' }}>OBSERVATIONAL DATA</h4>
                                    <p style={{ lineHeight: 1.6, opacity: 0.8 }}>{report.incident_details.description}</p>
                                </div>

                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>VERIFICATION STATUS</div>
                                        <div style={{ color: '#10b981', fontWeight: 900, fontSize: '0.8rem' }}>AI VALIDATED • TRAFFIC RELATED</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="text-btn" style={{ color: '#1e293b' }}><Printer size={16} /> Print</button>
                                        <button className="text-btn" style={{ color: '#1e293b' }}><Download size={16} /> Export PDF</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, flexDirection: 'column' }}>
                            <FileText size={64} style={{ marginBottom: '1rem' }} />
                            <p>Input Incident ID to generate official documentation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
