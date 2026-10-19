import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, AlertCircle, FileText, Send, Activity, Bookmark, Bell, Award, HelpCircle, Settings, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../styles/Sidebar.css';

const Sidebar = () => {
    return (
        <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="app-sidebar glass-panel"
        >
            <div className="user-profile">
                <img src="https://ui-avatars.com/api/?name=Soham+K&background=4f46e5&color=fff" alt="User Avatar" className="avatar" />
                <div className="user-info">
                    <span className="user-name">Soham K.</span>
                    <span className="user-role badge-user">User</span>
                    <span className="user-location"><MapPin size={10} /> Pune, India</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/traffic" className="side-link">
                    <MapPin size={18} />
                    <span>Live Map</span>
                </NavLink>
                <NavLink to="/route" className="side-link">
                    <Activity size={18} />
                    <span>Traffic Explorer</span>
                </NavLink>
                <NavLink to="/report" className="side-link">
                    <Send size={18} />
                    <span>Report Incident</span>
                </NavLink>
                <NavLink to="/incidents" className="side-link">
                    <FileText size={18} />
                    <span>My Reports</span>
                </NavLink>

            </nav>

            <button className="sos-btn">
                <ShieldAlert size={20} />
                <div className="sos-text">
                    <strong>SOS Emergency</strong>
                    <span>Tap for immediate help</span>
                </div>
            </button>
        </motion.aside>
    );
};

export default Sidebar;
