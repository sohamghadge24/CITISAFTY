import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Code2, Cpu,
    Navigation, Activity, Settings,
    ShieldAlert, Database, FileText, Truck
} from 'lucide-react';
import { DashboardProvider } from '../../context/DashboardContext';
import '../../styles/Dashboard.css';

const DashboardLayout = () => {
    return (
        <DashboardProvider>
            <div className="dashboard-container">
                <aside className="dash-sidebar">
                    <div className="dash-logo">
                        <ShieldAlert size={24} />
                        <span>Authority Hub</span>
                    </div>

                    <nav className="dash-nav">
                        <NavLink to="" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={18} /> Overview
                        </NavLink>
                        <NavLink to="api-test" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Code2 size={18} /> API Debugger
                        </NavLink>
                        <NavLink to="ml-test" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Cpu size={18} /> ML Intelligence
                        </NavLink>
                        <NavLink to="routing-test" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Navigation size={18} /> Routing Engine
                        </NavLink>
                        <NavLink to="traffic-test" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Activity size={18} /> Live Traffic
                        </NavLink>

                        <div className="nav-divider" style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Operational</div>

                        <NavLink to="review" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <ShieldAlert size={18} /> Incident Review
                        </NavLink>
                        <NavLink to="reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <FileText size={18} /> Report Generator
                        </NavLink>
                        <NavLink to="dispatch" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Truck size={18} /> Dispatch Control
                        </NavLink>

                        <div className="nav-divider" style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

                        <NavLink to="monitoring" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Database size={18} /> System Monitoring
                        </NavLink>
                    </nav>

                    <div style={{ marginTop: 'auto' }}>
                        <NavLink to="/" className="nav-item">
                            <Settings size={18} /> Back to App
                        </NavLink>
                    </div>
                </aside>

                <main className="dash-main">
                    <Outlet />
                </main>
            </div>
        </DashboardProvider>
    );
};

export default DashboardLayout;
