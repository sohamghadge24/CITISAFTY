import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Filter, Clock, Map as MapIcon, ChevronRight, AlertTriangle, Car, ShieldAlert, Navigation } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { apiService } from '../services/api';
import '../styles/Pages.css';

const IncidentDashboard = () => {
    const { incidents, setIncidents, setViewport } = useMapStore();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const load = async () => {
            const data = await apiService.getIncidents();
            setIncidents(data);
        };
        load();
    }, []);

    const handleIncidentClick = (incident) => {
        if (incident.lat && incident.lng) {
            setViewport([incident.lng, incident.lat], 15);
        }
    };

    const filteredIncidents = filter === 'All'
        ? (incidents || [])
        : (incidents || []).filter(i => i?.severity?.toLowerCase() === filter.toLowerCase());

    const getIconForType = (type) => {
        if (!type) return <ShieldAlert size={16} />;
        const t = type.toLowerCase();
        if (t.includes('accident')) return <Car size={16} />;
        if (t.includes('hazard')) return <AlertTriangle size={16} />;
        if (t.includes('congestion')) return <Navigation size={16} />;
        return <ShieldAlert size={16} />;
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="side-panel wide glass-panel"
        >
            <div className="panel-header">
                <LayoutDashboard className="header-icon" />
                <h2>SafeCity Incident Hub</h2>
            </div>

            <div className="filter-bar">
                <Filter size={16} />
                {['All', 'High', 'Medium', 'Low'].map(f => (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </motion.button>
                ))}
            </div>

            <div className="incident-list custom-scrollbar">
                <AnimatePresence>
                    {filteredIncidents.length === 0 ? (
                        <div className="empty-state">No incidents currently active in this sector.</div>
                    ) : (
                        filteredIncidents.map((incident, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="incident-card glass-panel clickable"
                                onClick={() => handleIncidentClick(incident)}
                            >
                                <div className={`severity-indicator ${incident.severity?.toLowerCase() || 'medium'}`}></div>
                                <div className="card-body">
                                    <div className="card-top">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                            {getIconForType(incident.type)}
                                            <h4>{incident.type}</h4>
                                        </div>
                                        <span className="timestamp" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="live-pulse" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444', animation: 'pulse 1.5s infinite' }}></div>
                                            <Clock size={12} />
                                            Just now
                                        </span>
                                    </div>
                                    <p>{incident.description || 'Impact analysis pending...'}</p>
                                    <div className="card-footer">
                                        <MapIcon size={14} />
                                        <span>{incident.lat?.toFixed(3)}, {incident.lng?.toFixed(3)} • {incident.city || 'Active Sector'}</span>
                                        <button className="expand-btn"><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default IncidentDashboard;
