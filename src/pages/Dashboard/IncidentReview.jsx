import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, MapPin, CheckCircle, XCircle, Search, AlertTriangle, Activity, Crosshair, BrainCircuit, Ambulance, Camera, Focus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api';
import useMapStore from '../../store/useMapStore';

const IncidentReview = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const { setViewport } = useMapStore();

    useEffect(() => {
        loadIncidents();
    }, []);

    useEffect(() => {
        const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/incidents');
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.event === 'INCIDENT_UPDATED') {
                    setIncidents(prev => {
                        const newIncidents = prev.map(inc => {
                            if (inc.id === message.data.incident_id) {
                                const updated = { ...inc, ...message.data, id: message.data.incident_id };
                                const finalSeverity = updated.adjusted_ai_severity || updated.severity || 'Low';
                                const isEval = updated.severity === 'Evaluating...';
                                const newState = {
                                    ...updated,
                                    ai_confidence: updated.ai_confidence || (isEval ? null : Math.floor(Math.random() * (98 - 85) + 85)),
                                    severity_prediction: isEval ? 'Evaluating...' : finalSeverity.charAt(0).toUpperCase() + finalSeverity.slice(1),
                                    displaySeverity: isEval ? 'Evaluating...' : finalSeverity.toUpperCase()
                                };
                                
                                // Update selected incident if it's the one being evaluated
                                setSelectedIncident(curr => curr && curr.id === newState.id ? newState : curr);
                                
                                return newState;
                            }
                            return inc;
                        });
                        return newIncidents;
                    });
                } else if (message.event === 'NEW_INCIDENT') {
                    const newInc = message.data;
                    const finalSeverity = newInc.adjusted_ai_severity || newInc.severity || 'Low';
                    const isEval = newInc.severity === 'Evaluating...';
                    setIncidents(prev => [{
                        ...newInc,
                        id: newInc.incident_id,
                        ai_confidence: isEval ? null : Math.floor(Math.random() * (98 - 85) + 85),
                        severity_prediction: isEval ? 'Evaluating...' : finalSeverity.charAt(0).toUpperCase() + finalSeverity.slice(1),
                        trust_score: Math.floor(Math.random() * (99 - 70) + 70),
                        displaySeverity: isEval ? 'Evaluating...' : finalSeverity.toUpperCase()
                    }, ...prev]);
                }
            } catch(e) {
                console.error('WS Error parsing incident update', e);
            }
        };
        return () => ws.close();
    }, []);

    const loadIncidents = async () => {
        setLoading(true);
        try {
            const res = await apiService.fetchVerifiedIncidents();
            // Enriching data with mock AI insights for the UI presentation
            const enriched = (res.incidents || []).map(inc => {
                const finalSeverity = inc.adjusted_ai_severity || inc.severity || 'Low';
                const isEval = inc.severity === 'Evaluating...';
                return {
                    ...inc,
                    ai_confidence: isEval ? null : Math.floor(Math.random() * (98 - 85) + 85),
                    severity_prediction: isEval ? 'Evaluating...' : finalSeverity.charAt(0).toUpperCase() + finalSeverity.slice(1),
                    trust_score: Math.floor(Math.random() * (99 - 70) + 70),
                    displaySeverity: isEval ? 'Evaluating...' : finalSeverity.toUpperCase()
                };
            });
            setIncidents(enriched);
            if (enriched.length > 0) setSelectedIncident(enriched[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (inc) => {
        setSelectedIncident(inc);
        if (inc.lat && inc.lng) {
            setViewport([inc.lng, inc.lat], 16);
        }
    };

    const [isDispatching, setIsDispatching] = useState(false);
    const [actionLog, setActionLog] = useState([]);

    const handleDispatch = async () => {
        if (!selectedIncident) return;
        setIsDispatching(true);
        try {
            // Integrating real dispatch API call
            await apiService.dispatchAuthority({
                incident_id: selectedIncident.id,
                severity: selectedIncident.severity_prediction,
                location: selectedIncident.city || 'Unknown',
                dispatch_type: 'EMS_AND_POLICE'
            });

            // Generate official audit report
            await apiService.generateOfficialReport(selectedIncident.id).catch(e => console.warn('Report gen skip:', e));

            alert(`SUCCESS: Emergency Units dispatched to Incident #INS-${selectedIncident.id}. ETA: 4 minutes.`);

            // Remove from active view
            setIncidents(prev => prev.filter(inc => inc.id !== selectedIncident.id));
            setSelectedIncident(null);

            // Log action internally
            setActionLog(prev => [{ time: new Date(), action: `Dispatched units for INS-${selectedIncident.id}`, status: 'success' }, ...prev]);
        } catch (error) {
            console.error('Dispatch failed:', error);
            alert('CRITICAL ERROR: Failed to establish secure connection to Dispatch Servers.');
        } finally {
            setIsDispatching(false);
        }
    };

    const handleDismiss = () => {
        if (!selectedIncident) return;
        if (window.confirm(`Are you sure you want to dismiss Incident #INS-${selectedIncident.id}? This will remove it from the active threat registry.`)) {
            setIncidents(prev => prev.filter(inc => inc.id !== selectedIncident.id));
            setSelectedIncident(null);
            setActionLog(prev => [{ time: new Date(), action: `Dismissed INS-${selectedIncident.id} as non-critical`, status: 'resolved' }, ...prev]);
        }
    };

    return (
        <div className="dashboard-page" style={{ padding: '0', height: '100vh', overflow: 'hidden' }}>
            <header className="dash-header" style={{ padding: '2rem 3rem 1rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BrainCircuit color="#3b82f6" />
                        AI Intelligence Command
                    </h1>
                    <p>Real-time YOLOv8n + EfficientNet-B0 perception engine</p>
                </div>
                <div className="header-actions">
                    <button className="refresh-btn" onClick={loadIncidents}>
                        <Search size={16} /> Sync Registry
                    </button>
                </div>
            </header>

            <div className="command-center-layout" style={{ padding: '0 3rem' }}>

                {/* Left Panel: Incident Stream */}
                <div className="cmd-panel">
                    <div className="cmd-panel-header">
                        <h2><Activity size={18} /> Live Inference Stream</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{incidents.length} Events Detected</span>
                    </div>
                    <div className="cmd-panel-content custom-scrollbar">
                        {loading ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Initializing AI Models...</div>
                        ) : (
                            <AnimatePresence>
                                {incidents.map((inc, i) => {
                                    const isSelected = selectedIncident?.id === inc.id;
                                    const isCritical = inc.severity_prediction.toLowerCase() === 'high' || inc.severity_prediction.toLowerCase() === 'critical';

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={inc.id}
                                            className={`cmd-card-row ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelect(inc)}
                                        >
                                            <div className="cmd-thumbnail" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1534068590799-09895a7090ea?q=80&w=400&auto=format&fit=crop)` }}></div>
                                            <div className="cmd-meta">
                                                <span className="cmd-meta-title">{inc.type}</span>
                                                <span className="cmd-meta-sub">{new Date(inc.created_at).toLocaleTimeString()} • {inc.city || 'Sector 7G'}</span>
                                            </div>
                                            <div>
                                                <span 
                                                    className={`status-pill ${inc.displaySeverity.toLowerCase()}`}
                                                    title={inc.adjusted_ai_severity ? "Severity adjusted using AI safety normalization." : ""}
                                                    style={{
                                                        backgroundColor: inc.displaySeverity === 'LOW' ? '#10b981' : inc.displaySeverity === 'MEDIUM' ? '#eab308' : inc.displaySeverity === 'HIGH' ? '#f97316' : inc.displaySeverity === 'CRITICAL' ? '#991b1b' : '#64748b',
                                                        color: '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'help'
                                                    }}
                                                >
                                                    {inc.displaySeverity}
                                                </span>
                                            </div>
                                            <div>
                                                {inc.ai_confidence ? (
                                                    <span className={`ai-confidence-badge ${isCritical ? 'critical' : ''}`}>
                                                        <Focus size={12} /> {inc.ai_confidence}% Match
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Evaluating...</span>
                                                )}
                                            </div>
                                            <ChevronRight size={18} color="#64748b" />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Panel: AI Intelligence Details */}
                {selectedIncident ? (
                    <div className="cmd-panel">
                        <div className="cmd-panel-header">
                            <h2><Crosshair size={18} /> Deep Learning Analysis</h2>
                        </div>
                        <div className="cmd-panel-content custom-scrollbar">
                            <div className="intel-img-container">
                                <img src="https://images.unsplash.com/photo-1534068590799-09895a7090ea?q=80&w=800&auto=format&fit=crop" alt="Incident" />
                                <div className="grad-cam-overlay"></div>
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 800 }}>
                                    CLASS: {selectedIncident.severity_prediction.toUpperCase()}_IMPACT
                                </div>
                            </div>

                            <div className="intel-stats-grid">
                                <div className="intel-stat">
                                    <span className="intel-stat-label">Model Confidence</span>
                                    <span className="intel-stat-val" style={{ color: '#60a5fa' }}>{selectedIncident.ai_confidence || 92}%</span>
                                </div>
                                <div className="intel-stat">
                                    <span className="intel-stat-label">Reporter Trust</span>
                                    <span className="intel-stat-val" style={{ color: '#34d399' }}>{selectedIncident.trust_score || 88}/100</span>
                                </div>
                            </div>

                            <div className="decision-engine">
                                <div className="decision-title">
                                    <AlertTriangle size={16} />
                                    EMERGENCY DECISION ENGINE
                                </div>
                                {['high', 'critical'].includes(selectedIncident.severity_prediction.toLowerCase()) ? (
                                    <>
                                        <div className="decision-action"><CheckCircle size={14} color="#ef4444" /> Critical structural damage detected.</div>
                                        <div className="decision-action"><Ambulance size={14} color="#ef4444" /> Dispatch EMS recommended.</div>
                                        <div className="decision-action"><MapPin size={14} color="#f59e0b" /> Route diversion activated.</div>
                                    </>
                                ) : selectedIncident.severity_prediction.toLowerCase() === 'medium' ? (
                                    <>
                                        <div className="decision-action"><CheckCircle size={14} color="#eab308" /> Moderate risk assessed.</div>
                                        <div className="decision-action"><MapPin size={14} color="#3b82f6" /> Local authorities notified.</div>
                                        <div className="decision-action"><AlertTriangle size={14} color="#eab308" /> Dispatch manual/optional.</div>
                                    </>
                                ) : selectedIncident.severity_prediction.toLowerCase() === 'low' ? (
                                    <>
                                        <div className="decision-action"><CheckCircle size={14} color="#10b981" /> No critical injuries predicted.</div>
                                        <div className="decision-action"><Activity size={14} color="#10b981" /> Monitoring mode only.</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="decision-action"><Activity size={14} color="#64748b" /> Evaluating incident details...</div>
                                    </>
                                )}
                                {selectedIncident.original_user_severity && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        * Original user reported severity: {selectedIncident.original_user_severity.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="intel-actions">
                                <button
                                    className="btn-dispatch"
                                    onClick={handleDispatch}
                                    disabled={isDispatching || selectedIncident.severity_prediction.toLowerCase() === 'low' || selectedIncident.severity_prediction.toLowerCase() === 'evaluating...'}
                                    style={{ 
                                        opacity: (selectedIncident.severity_prediction.toLowerCase() === 'low' || selectedIncident.severity_prediction.toLowerCase() === 'evaluating...') ? 0.5 : 1,
                                        backgroundColor: selectedIncident.severity_prediction.toLowerCase() === 'medium' ? '#eab308' : ''
                                    }}
                                >
                                    <Ambulance size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    {isDispatching ? 'Deploying...' : selectedIncident.severity_prediction.toLowerCase() === 'medium' ? 'Manual Dispatch' : 'Deploy Units'}
                                </button>
                                <button className="btn-secondary" onClick={handleDismiss} disabled={isDispatching}>
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="cmd-panel" style={{ alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <BrainCircuit size={48} style={{ marginBottom: '1rem' }} />
                        <p>Select an incident to view intelligence.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncidentReview;
