import React, { useState } from 'react';
import { Camera, Play, RefreshCcw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InferencePanel = ({ onRun, loading, result }) => {
    const [preview, setPreview] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="inference-workspace">
            <div className="section-title">
                <Play size={14} /> Neural Inference Laboratory
            </div>

            <div
                className={`test-upload-area glass-panel ${preview ? 'has-image' : ''}`}
                onClick={() => document.getElementById('dash-upload').click()}
            >
                <input type="file" id="dash-upload" hidden onChange={handleUpload} />
                {preview ? (
                    <img src={preview} alt="Eval" className="eval-preview" />
                ) : (
                    <div className="eval-placeholder">
                        <Camera size={28} />
                        <span>Inject Vision Stream</span>
                    </div>
                )}
            </div>

            <button
                className="action-button"
                style={{ marginTop: '1.25rem' }}
                onClick={() => onRun(preview)}
                disabled={loading || !preview}
            >
                {loading ? <RefreshCcw className="spinning" /> : 'Execute Scene Analysis'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="eval-result-card glass-panel"
                        style={{ borderLeftColor: result.severity === 'Normal' ? '#3b82f6' : '#10b981' }}
                    >
                        <div className="res-header">
                            <ShieldCheck size={16} color={result.severity === 'Normal' ? '#3b82f6' : '#10b981'} />
                            <span>Inference Result: {result.severity === 'Normal' ? 'No Incident Detected' : result.severity}</span>
                        </div>
                        <div className="res-details">
                            <div className="res-item">
                                <span className="l">Confidence Score</span>
                                <span className="v">{(result.confidence * 100 || 88).toFixed(1)}%</span>
                            </div>
                            <div className="res-item">
                                <span className="l">Model Decision</span>
                                <span className="v">{result.mode || 'Neural-Heuristic Hybrid'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InferencePanel;
