import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Database, Info } from 'lucide-react';
import { apiService } from '../../services/api';

const ModelComparison = () => {
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComparison();
    }, []);

    const loadComparison = async () => {
        setLoading(true);
        try {
            const models = await apiService.fetchModels();
            const ids = models.map(m => m.model_id);
            const data = await apiService.compareModels(ids);
            setComparisonData(data);
        } catch (err) {
            console.error(err);
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
                <ArrowRightLeft className="header-icon" />
                <div>
                    <h2>Delta Matrix</h2>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Side-by-Side Neural Comparison</p>
                </div>
            </div>

            <div className="dashboard-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div className="loading-state">Synchronizing Neural Weights...</div>
                ) : (
                    <div className="comparison-list">
                        {comparisonData.map(item => (
                            <div key={item.model_id} className="comp-row glass-panel">
                                <div className="comp-name">{item.model_id.split('-').join(' ')}</div>
                                <div className="comp-bars">
                                    <div className="bar-group">
                                        <label>ACC</label>
                                        <div className="bar-wrap">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.metrics.accuracy * 100}%` }}
                                            />
                                        </div>
                                        <span className="v">{(item.metrics.accuracy * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="bar-group">
                                        <label>F1</label>
                                        <div className="bar-wrap">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.metrics.f1_score * 100}%` }}
                                                style={{ background: '#10b981' }}
                                            />
                                        </div>
                                        <span className="v">{(item.metrics.f1_score * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="research-note glass-panel" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', opacity: 0.8 }}>
                        <Info size={24} color="#3b82f6" />
                        <p>This matrix compares production-grade architectures against community-contributed light models. Metrics are validated against the <strong>SafeCity Baseline Dataset (v.4.2)</strong>.</p>
                    </div>
                </div>
            </div>

            <div className="footer-status">
                <Database size={12} />
                <span>Delta Engine: Batch-Compare Mode</span>
            </div>
        </motion.div>
    );
};

export default ModelComparison;
