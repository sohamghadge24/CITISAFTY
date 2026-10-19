import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, ShieldCheck } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import RegionSelector from '../components/UI/RegionSelector';
import '../styles/Pages.css';

const TrafficPage = () => {
    const { trafficLayerEnabled, toggleTraffic } = useMapStore();

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="side-panel glass-panel"
        >
            <div className="panel-header">
                <Activity className="header-icon" />
                <h2>Live Intelligence</h2>
            </div>



            <div className="control-section">
                <h3>Map Layers</h3>
                <button
                    className={`layer-toggle ${trafficLayerEnabled ? 'active' : ''}`}
                    onClick={toggleTraffic}
                >
                    <Thermometer size={18} />
                    <span>Real-time Traffic Overlay</span>
                    <div className="toggle-switch"></div>
                </button>
            </div>

            <RegionSelector />

            <div className="legend-section">
                <h3>Legend</h3>
                <div className="legend-item">
                    <div className="color-dot" style={{ background: '#3b82f6' }}></div>
                    <span>Fluid Flow (0-15m delay)</span>
                </div>
                <div className="legend-item">
                    <div className="color-dot" style={{ background: '#eab308' }}></div>
                    <span>Moderate (15-30m delay)</span>
                </div>
                <div className="legend-item">
                    <div className="color-dot" style={{ background: '#ef4444' }}></div>
                    <span>Heavy Congestion (30m+)</span>
                </div>
            </div>

            <div className="footer-status">
                <ShieldCheck size={14} />
                <span>Verified by SafeCity AI v2.0</span>
            </div>
        </motion.div>
    );
};

export default TrafficPage;
