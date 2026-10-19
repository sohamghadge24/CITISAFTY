import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Activity, Send, Database, ShieldCheck, RefreshCcw, Search } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/Pages.css';

const ServerTesting = () => {
    const [activeTab, setActiveTab] = useState('routing');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    // Test States
    const [routeData, setRouteData] = useState({ start: 'Mumbai', end: 'Pune' });
    const [mlImage, setMlImage] = useState(null);
    const [mlDesc, setMlDesc] = useState('image to test feature');
    const [mlResult, setMlResult] = useState(null);
    const [healthStatus, setHealthStatus] = useState(null);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setMlImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const runMLTest = async () => {
        if (!mlImage) {
            addLog("ERROR: Please upload an image for AI analysis", 'error');
            return;
        }
        setLoading(true);
        addLog("Sending Visual Data to ML Inference Server...", 'info');
        try {
            const result = await apiService.testMLModel(mlImage, mlDesc);
            setMlResult(result);
            addLog(`ML SUCCESS: Severity ${result.severity} (Conf: ${(result.confidence * 100).toFixed(1)}%)`, 'success');
            addLog(`ACTION: ${result.action.type}`, 'info');
        } catch (err) {
            addLog(`ML ENGINE ERROR: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const runRoutingTest = async () => {
        setLoading(true);
        addLog(`Initiating Routing Test: ${routeData.start} to ${routeData.end}`);
        try {
            const geocode = async (q) => {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
                    headers: { 'User-Agent': 'SafeCity-Test/1.0' }
                });
                const data = await res.json();
                return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
            };

            const s = await geocode(routeData.start);
            const e = await geocode(routeData.end);

            if (!s || !e) throw new Error("Geocoding failed for testing");

            const routes = await apiService.getRoute(s, e);
            addLog(`SUCCESS: Received ${routes.length} production routes from OSRM engine.`, 'success');
            console.log("Test Routes:", routes);
        } catch (err) {
            addLog(`ERROR: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const checkSystemHealth = async () => {
        addLog("Polling System Health Layer...");
        try {
            const data = await apiService.getTrafficData(); // Uses /map/traffic as proxy for health
            addLog(`SUCCESS: Data Layer Responsive. Active Segments: ${data.length}`, 'success');
            setHealthStatus("Operational");
        } catch (err) {
            addLog(`ERROR: System layer unreachable`, 'error');
            setHealthStatus("Down");
        }
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="side-panel wide glass-panel"
        >
            <div className="panel-header">
                <Terminal className="header-icon" />
                <h2>Authority Debugger</h2>
            </div>

            <div className="filter-bar">
                {['routing', 'perception', 'system'].map(tab => (
                    <button
                        key={tab}
                        className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="debugger-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'routing' && (
                    <div className="test-section motion-fade-in">
                        <h4>Production Routing Engine</h4>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Start"
                                value={routeData.start}
                                onChange={e => setRouteData({ ...routeData, start: e.target.value })}
                                className="glass-input"
                            />
                            <div style={{ margin: '0.5rem 0' }} />
                            <input
                                type="text"
                                placeholder="End"
                                value={routeData.end}
                                onChange={e => setRouteData({ ...routeData, end: e.target.value })}
                                className="glass-input"
                            />
                        </div>
                        <button className="action-button" onClick={runRoutingTest} disabled={loading}>
                            {loading ? <RefreshCcw className="spinning" /> : 'Stress Test OSRM'}
                        </button>
                    </div>
                )}

                {activeTab === 'perception' && (
                    <div className="test-section motion-fade-in">
                        <h4>Machine Intelligence Lab</h4>
                        <div className="form-group">
                            <label>Visual Input (Image)</label>
                            <div
                                className="upload-preview glass-panel"
                                onClick={() => document.getElementById('test-upload').click()}
                                style={{ height: '140px', marginBottom: '1rem', cursor: 'pointer' }}
                            >
                                <input id="test-upload" type="file" hidden onChange={handleImageChange} />
                                {mlImage ? (
                                    <img src={mlImage} alt="Test" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>Click to upload evidence scene</span>
                                )}
                            </div>
                            <label>Analysis Context</label>
                            <textarea
                                className="glass-input"
                                value={mlDesc}
                                onChange={e => setMlDesc(e.target.value)}
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                        <button className="action-button" onClick={runMLTest} disabled={loading}>
                            {loading ? <RefreshCcw className="spinning" /> : 'Run Scene Perception'}
                        </button>

                        {mlResult && (
                            <div className="ml-report glass-panel" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 700 }}>AI Inference Result</span>
                                    <span className={`congestion-tag ${mlResult.severity.toLowerCase()}`}>
                                        {mlResult.severity}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                    Confidence: {(mlResult.confidence * 100).toFixed(2)}%
                                </div>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong>Protocol:</strong> {mlResult.action.type}
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        Units: {mlResult.action.units.join(', ')}
                                    </div>
                                </div>
                                {mlResult.relevance && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>Semantic Status:</strong>
                                            <span style={{ color: mlResult.relevance.status === 'TRAFFIC_RELATED' ? '#22c55e' : '#ef4444' }}>
                                                {mlResult.relevance.status}
                                            </span>
                                        </div>
                                        <div style={{ opacity: 0.7 }}>Matched: {mlResult.relevance.best_match} (Score: {(mlResult.relevance.confidence * 100).toFixed(1)}%)</div>
                                    </div>
                                )}
                                {mlResult.detections && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#3b82f6' }}>
                                        <strong>AI Vision:</strong> {mlResult.detections.join(' • ')}
                                    </div>
                                )}
                                {mlResult.caption && (
                                    <div style={{ marginTop: '0.8rem', padding: '0.6rem', borderLeft: '3px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0 4px 4px 0', fontSize: '0.8rem', fontStyle: 'italic', color: '#94a3b8' }}>
                                        "{mlResult.caption}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="test-section motion-fade-in">
                        <h4>Backend Infrastructure Status</h4>
                        <div className="stat-card">
                            <span className="label">API Gateway</span>
                            <span className={`value ${healthStatus === 'Operational' ? 'success' : 'error'}`}>
                                {healthStatus || 'Pending Check...'}
                            </span>
                        </div>
                        <button className="action-button" onClick={checkSystemHealth}>
                            <Activity size={18} /> Ping Cluster
                        </button>
                    </div>
                )}

                <div className="log-console" style={{ marginTop: '2rem' }}>
                    <div className="section-title">
                        <Database size={14} />
                        SYSTEM LOGS
                    </div>
                    <div className="log-entries" style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        minHeight: '200px'
                    }}>
                        {logs.length === 0 && <span style={{ opacity: 0.4 }}>Idle...</span>}
                        {logs.map(log => (
                            <div key={log.id} style={{ marginBottom: '0.5rem', color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#22c55e' : '#94a3b8' }}>
                                [{log.time}] {log.msg}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="footer-status" style={{ marginTop: '1rem' }}>
                <ShieldCheck size={14} />
                <span>Backend Architecture Visualization Mode</span>
            </div>
        </motion.div>
    );
};

export default ServerTesting;
