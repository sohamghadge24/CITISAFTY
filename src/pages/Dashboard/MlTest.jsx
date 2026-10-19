import React, { useState } from 'react';
import { Cpu, Image as ImageIcon, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { apiService } from '../../services/api';

const MlTest = () => {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('severity-hybrid-v2');

    const [error, setError] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const runInference = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await apiService.testMLModel(image, "Admin Testing Cluster Run");
            setResult(res);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect to ML Engine. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>Neural Intelligence Lab</h1>
                    <p>Real-time visual perception and semantic validation.</p>
                </div>
            </header>

            <div className="secondary-metrics-row">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><ImageIcon size={16} /> Scene Input</h3>
                    <div
                        className="upload-preview"
                        style={{
                            height: '240px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                        onClick={() => document.getElementById('admin-ml-upload').click()}
                    >
                        <input id="admin-ml-upload" type="file" hidden onChange={handleUpload} />
                        {image ? (
                            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.8rem' }}>Drop test scene or click to upload</div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>ARCHITECTURE STACK</label>
                        <select className="dash-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                            <option value="severity-hybrid-v2">CLIP-ResNet50 Hybrid (Production)</option>
                            <option value="accident-resnet">ResNet-50 Base</option>
                            <option value="accident-cnn">CNN Baseline</option>
                        </select>
                    </div>

                    <button className="refresh-btn" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} onClick={runInference} disabled={!image || loading}>
                        <Play size={16} /> Run Neural Task
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3><Cpu size={16} /> Inference Results</h3>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.8rem' }}>AI is analyzing scene context...</p>
                        </div>
                    ) : error ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textAlign: 'center', padding: '1rem' }}>
                            <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '0.9rem' }}>{error}</p>
                            <button className="glass-button" style={{ marginTop: '1rem', fontSize: '0.8rem' }} onClick={runInference}>Retry Analysis</button>
                        </div>
                    ) : result ? (
                        <div className="ml-results-content">
                            <div className="res-stat-row">
                                <div className="res-label">Semantic Relevance</div>
                                <div className={`res-val ${result.relevance?.status === 'TRAFFIC_RELATED' ? 'text-success' : 'text-error'}`}>
                                    {result.relevance?.status || 'VALID'}
                                </div>
                            </div>

                            <div className="res-stat-row">
                                <div className="res-label">Detected Severity</div>
                                <div className="res-val" style={{ color: result.severity === 'Critical' ? '#ef4444' : '#10b981' }}>
                                    {result.severity}
                                </div>
                            </div>

                            <div className="confidence-viz" style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                    <span>Confidence Score</span>
                                    <span>{(result.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="confidence-bar-bg" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${result.confidence * 100}%`,
                                        background: '#3b82f6',
                                        borderRadius: '4px',
                                        boxShadow: '0 0 10px #3b82f6'
                                    }}></div>
                                </div>
                            </div>

                            <div className="detections-list" style={{ marginTop: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Detected Features</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {result.detections?.map(label => (
                                        <span key={label} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="visual-description" style={{ marginTop: '1.5rem', borderLeft: '2px solid #3b82f6', paddingLeft: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#3b82f6' }}>AI Visual Description</div>
                                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.4', fontStyle: 'italic' }}>
                                    "{result.caption || "Generating semantic summary..."}"
                                </p>
                            </div>

                            <div className="decision-matrix" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.75rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Automated Protocol</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{result.action?.message || "No immediate emergency protocol triggered."}</div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                    {result.action?.units?.map(u => (
                                        <span key={u} style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem' }}>{u}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontStyle: 'italic' }}>
                            Upload image to begin inference...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MlTest;
