import React, { useState } from 'react';
import { Send, Terminal as TermIcon, Play } from 'lucide-react';
import JsonViewer from '../../components/Dashboard/Admin/JsonViewer';

const ApiTest = () => {
    const [endpoint, setEndpoint] = useState('/api/map/traffic');
    const [method, setMethod] = useState('GET');
    const [body, setBody] = useState('{\n  "incident_id": 1\n}');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            // Simulated fetch for any endpoint
            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'GET' ? body : undefined
            });
            const data = await res.json();
            setResponse({
                status: res.status,
                time: `${Date.now() - startTime}ms`,
                data
            });
        } catch (err) {
            setResponse({ status: 'ERROR', error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div>
                    <h1>API Debugger</h1>
                    <p>Stress test and validate production REST endpoints.</p>
                </div>
            </header>

            <div className="secondary-metrics-row" style={{ gridTemplateColumns: '400px 1fr' }}>
                <div className="test-form-container glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="test-form">
                        <div className="input-row" style={{ display: 'flex', gap: '0.5rem' }}>
                            <select className="dash-select" style={{ width: '100px' }} value={method} onChange={e => setMethod(e.target.value)}>
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                            <input
                                className="dash-input"
                                value={endpoint}
                                onChange={e => setEndpoint(e.target.value)}
                                placeholder="/api/v1/..."
                            />
                        </div>

                        <div className="input-block">
                            <label>Request Body (JSON)</label>
                            <textarea
                                className="dash-textarea"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                disabled={method === 'GET'}
                            />
                        </div>

                        <button className="refresh-btn" onClick={runTest} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? <TermIcon className="spinning" /> : <><Send size={16} /> Execute Request</>}
                        </button>
                    </div>
                </div>

                <div className="response-container glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Play size={14} /> Response Payload</span>
                        {response && (
                            <div className="res-meta" style={{ fontSize: '0.75rem' }}>
                                <span style={{ color: response.status < 400 ? '#10b981' : '#ef4444' }}>Status: {response.status}</span>
                                <span style={{ margin: '0 1rem', opacity: 0.5 }}>|</span>
                                <span style={{ opacity: 0.7 }}>Time: {response.time}</span>
                            </div>
                        )}
                    </div>
                    {response ? (
                        <JsonViewer data={response.data || response.error} />
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontStyle: 'italic' }}>
                            Waiting for execution...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiTest;
