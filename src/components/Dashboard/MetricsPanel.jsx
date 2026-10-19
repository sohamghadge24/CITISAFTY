import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Zap, Clock } from 'lucide-react';

const MetricsPanel = ({ metrics, loading }) => {
    if (loading) return <div className="metrics-loading glass-panel">Analyzing Neural Weights...</div>;
    if (!metrics) return null;

    const items = [
        { label: 'Accuracy', value: metrics.accuracy, icon: <Target size={14} />, color: '#3b82f6' },
        { label: 'F1-Score', value: metrics.f1_score, icon: <Activity size={14} />, color: '#10b981' },
        { label: 'Latency', value: metrics.latency_ms + 'ms', icon: <Zap size={14} />, color: '#f59e0b', raw: true },
    ];

    return (
        <div className="metrics-grid-view">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="metric-box glass-panel"
                >
                    <div className="m-header">
                        {item.icon}
                        <span className="m-label">{item.label}</span>
                    </div>
                    <span className="m-value" style={{ color: item.color }}>
                        {item.raw ? item.value : (item.value * 100).toFixed(1) + '%'}
                    </span>
                    {!item.raw && (
                        <div className="m-progress">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value * 100}%` }}
                                style={{ background: item.color }}
                            />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default MetricsPanel;
