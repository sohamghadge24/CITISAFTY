import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Database, RefreshCcw, Activity } from 'lucide-react';

const RetrainingMonitor = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="side-panel wide glass-panel"
        >
            <div className="panel-header">
                <LineChart className="header-icon" />
                <div>
                    <h2>Neural Lifecycle</h2>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Retraining & Dataset Monitoring</p>
                </div>
            </div>

            <div className="dashboard-content custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="retraining-stats">
                    <div className="cycle-card glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 700 }}>Continuous Learning Status</span>
                            <span className="congestion-tag low">Operational</span>
                        </div>

                        <div className="cycle-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="ci-item">
                                <span className="l">Last Training Sync</span>
                                <span className="v">1.4h Ago</span>
                            </div>
                            <div className="ci-item">
                                <span className="l">Dataset Growth</span>
                                <span className="v text-success">+ 2,410 Samples</span>
                            </div>
                        </div>
                    </div>

                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Activity size={14} /> Knowledge Acquisition Curve
                    </div>

                    <div className="mock-graph glass-panel" style={{ height: '180px', background: 'rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                                d="M 0 80 Q 20 70, 40 40 T 80 20 L 100 10"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                            />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '0.6rem', opacity: 0.4 }}>T-24h Progress</div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button className="action-button" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <RefreshCcw size={16} /> Initiate Retraining Cycle
                        </button>
                    </div>
                </div>
            </div>

            <div className="footer-status">
                <Database size={12} />
                <span>Dataset: v4.2-Community_Authored</span>
            </div>
        </motion.div>
    );
};

export default RetrainingMonitor;
