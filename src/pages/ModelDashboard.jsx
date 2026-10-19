import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, ArrowRightLeft, Database } from 'lucide-react';
import { apiService } from '../services/api';
import useMapStore from '../store/useMapStore';

// Modular Components
import ModelSelector from '../components/Dashboard/ModelSelector';
import MetricsPanel from '../components/Dashboard/MetricsPanel';
import InferencePanel from '../components/Dashboard/InferencePanel';

const ModelDashboard = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const { setViewport } = useMapStore();

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const data = await apiService.fetchModels();
            setModels(data);
            if (data.length > 0) handleModelSelect(data[0].model_id);
        } catch (err) {
            console.error("Dashboard failed to load neural registry", err);
        }
    };

    const handleModelSelect = async (modelId) => {
        setSelectedModel(modelId);
        setLoading(true);
        try {
            const data = await apiService.getModelMetrics(modelId);
            setMetrics(data);
        } catch (err) {
            console.error("Failed to fetch model metrics", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInferenceRun = async (imageData) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/models/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: selectedModel,
                    input_data: { image: imageData, metadata: { description: "Dashboard Hub Test" } }
                })
            });
            const data = await response.json();
            setTestResult(data.result);

            // Map Synchronization
            if (data.result.severity === 'Critical') {
                setViewport([72.8777, 19.0760], 15);
            }
        } catch (err) {
            console.error("Inference cluster error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="side-panel wide glass-panel"
        >
            <div className="panel-header">
                <Cpu className="header-icon" />
                <div>
                    <h2>Intelligence Command</h2>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.05em' }}>
                        Neural Monitoring & Diagnostics
                    </p>
                </div>
            </div>

            <div className="tab-control">
                <button
                    className={`tab-btn ${!comparisonMode ? 'active' : ''}`}
                    onClick={() => setComparisonMode(false)}
                >
                    <Layers size={14} /> Neural Performance
                </button>
                <button
                    className="tab-btn"
                    onClick={() => window.location.hash = '#/model-comparison'}
                >
                    <ArrowRightLeft size={14} /> Delta Analysis
                </button>
            </div>

            <div className="dashboard-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                <ModelSelector
                    models={models}
                    selectedModel={selectedModel}
                    onSelect={handleModelSelect}
                />

                <MetricsPanel
                    metrics={metrics}
                    loading={loading}
                />

                <div style={{ height: '1.5rem' }} />

                <InferencePanel
                    onRun={handleInferenceRun}
                    loading={loading}
                    result={testResult}
                />
            </div>

            <div className="footer-status">
                <Database size={12} />
                <span>Cluster Node: SafeCity-Alpha (Active)</span>
            </div>
        </motion.div>
    );
};

export default ModelDashboard;
