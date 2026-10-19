import React from 'react';
import { Binary, CheckCircle2 } from 'lucide-react';

const ModelSelector = ({ models, selectedModel, onSelect }) => {
    return (
        <div className="section-group">
            <label className="section-label">Neural Architectures</label>
            <div className="model-selector-grid">
                {models.map(m => (
                    <div
                        key={m.model_id}
                        className={`model-card-mini ${selectedModel === m.model_id ? 'active' : ''}`}
                        onClick={() => onSelect(m.model_id)}
                    >
                        <div className="m-icon-ring">
                            <Binary size={16} />
                        </div>
                        <div className="m-info">
                            <span className="m-name">{m.model_id.split('-').join(' ')}</span>
                            <span className="m-ver">Ver {m.version}</span>
                        </div>
                        {selectedModel === m.model_id && <CheckCircle2 size={14} className="active-check" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModelSelector;
