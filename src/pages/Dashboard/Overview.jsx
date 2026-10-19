import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Server, Database, Cpu,
    RefreshCcw, AlertTriangle, CheckCircle,
    BarChart, Clock
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import StatusCard from '../../components/Dashboard/Admin/StatusCard';
import '../../styles/Dashboard.css';

const Overview = () => {
    const { stats, refreshStats } = useDashboard();

    return (
        <div className="dashboard-page overview-grid">
            <header className="dash-header">
                <div>
                    <h1>Cluster Overview</h1>
                    <p>Production monitoring for traffic intelligence nodes.</p>
                </div>
                <button className="refresh-btn" onClick={refreshStats}>
                    <RefreshCcw size={16} /> Sync
                </button>
            </header>

            <div className="stats-grid-primary">
                <StatusCard
                    label="Server Health"
                    value={stats.serverHealth.toUpperCase()}
                    icon={<Server />}
                    status={stats.serverHealth === 'operational' ? 'success' : 'error'}
                    sub="API Gateway (Port 8000)"
                />
                <StatusCard
                    label="API Latency"
                    value={`${stats.latency}ms`}
                    icon={<Activity />}
                    status={stats.latency < 200 ? 'success' : 'warning'}
                    sub="Avg Response Time"
                />
                <StatusCard
                    label="Active Neural Node"
                    value={stats.activeModel}
                    icon={<Cpu />}
                    sub="ResNet50 + CLIP v2"
                />
                <StatusCard
                    label="Traffic Engine"
                    value={stats.trafficEngine}
                    icon={<Database />}
                    status="success"
                    sub="PostgreSQL + OSRM"
                />
            </div>

            <div className="secondary-metrics-row">
                <div className="metric-panel glass-panel">
                    <h3><BarChart size={16} /> Intelligence Lifecycle</h3>
                    <div className="metric-content">
                        <div className="m-item">
                            <span>Last Retrain Cycle</span>
                            <strong>{stats.lastRetrain}</strong>
                        </div>
                        <div className="m-item">
                            <span>Total Reports Validated</span>
                            <strong>{stats.totalReports}</strong>
                        </div>
                    </div>
                </div>

                <div className="metric-panel glass-panel">
                    <h3><Clock size={16} /> System Uptime</h3>
                    <div className="uptime-viz">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div key={i} className="uptime-bar active"></div>
                        ))}
                    </div>
                    <span className="uptime-label">99.98% Monthly Uptime</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
