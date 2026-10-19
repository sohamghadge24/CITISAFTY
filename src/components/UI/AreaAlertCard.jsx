import React from 'react';
import { Sun, Car, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../styles/AreaAlertCard.css';

const AreaAlertCard = ({ alert }) => {
    const navigate = useNavigate();

    if (!alert) return null;

    const type = alert.type || "Traffic Incident";
    const severity = alert.severity || "High";
    const city = alert.city || "Unknown Location";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="area-alert-container"
        >
            <div className="area-alert-header">
                <span className="area-name">Live Alert</span>
                <div className="weather-info">
                    <span className="temperature" style={{ fontSize: '0.85rem' }}>Just now</span>
                </div>
            </div>

            <div className="alert-content-box" onClick={() => navigate('/incidents')}>
                <div className="alert-icon-wrapper">
                    <Car size={22} color="white" fill="white" />
                </div>
                <div className="alert-text-content">
                    <div className="alert-title">{type}</div>
                    <div className="alert-description" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {city} • 
                        <span style={{ 
                            color: severity === 'Critical' ? '#b91c1c' : 
                                   severity === 'High' ? '#ef4444' : 
                                   severity === 'Medium' ? '#eab308' : '#10b981',
                            fontWeight: 700
                        }}>
                            {severity} Severity
                        </span>
                    </div>
                </div>
                <ChevronRight size={20} className="alert-chevron" />
            </div>
        </motion.div>
    );
};

export default AreaAlertCard;
