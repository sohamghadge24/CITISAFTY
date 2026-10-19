import React, { useState } from 'react';
import { AlertTriangle, MapPin, Camera, Send, X } from 'lucide-react';
import '../../styles/glass.css';

const ReportOnlyMode = ({ onCancel, onSubmit }) => {
    const [reportType, setReportType] = useState('Accident');
    const [severity, setSeverity] = useState('Medium');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            type: reportType,
            severity,
            description,
            timestamp: new Date().toISOString(),
        });
    };

    return (
        <div className="glass-panel report-panel" style={{ width: '380px', margin: '1rem' }}>
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Report Incident</h2>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Incident Type</label>
                        <select
                            className="glass-input"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="Accident">Major Accident</option>
                            <option value="Construction">Road Construction</option>
                            <option value="Traffic">Heavy Congestion</option>
                            <option value="Hazard">Road Hazard / Pothole</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Severity Level</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {['Low', 'Medium', 'High'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`glass-button secondary ${severity === s ? 'active-severity' : ''}`}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.75rem',
                                        border: severity === s ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                    }}
                                    onClick={() => setSeverity(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Description</label>
                        <textarea
                            className="glass-input"
                            placeholder="Provide details for authorities..."
                            style={{ width: '100%', marginTop: '0.5rem', minHeight: '80px', resize: 'none' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-panel)', borderRadius: '0.75rem', cursor: 'pointer' }}>
                            <Camera size={20} style={{ color: 'var(--text-dim)' }} />
                        </div>
                        <button type="submit" className="glass-button" style={{ flex: 2 }}>
                            <Send size={18} /> Send Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportOnlyMode;
