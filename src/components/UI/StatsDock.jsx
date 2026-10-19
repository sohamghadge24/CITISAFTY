import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import '../../styles/StatsDock.css';

const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorClass }) => (
    <div className={`stat-card-bottom ${colorClass}`}>
        <div className="stat-content">
            <span className="stat-title">{title}</span>
            <div className="stat-value-row">
                <h2>{value}</h2>
                <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑' : '↓'} {trend}
                </span>
            </div>
            <span className="stat-subtitle">vs yesterday</span>
        </div>
        <div className="stat-icon-wrapper">
            <Icon size={24} />
        </div>
    </div>
);

const StatsDock = () => {
    return (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="stats-dock-container"
        >
            <StatCard 
                title="Total Incidents" 
                value="124" 
                trend="12%" 
                isPositive={false} 
                icon={ShieldCheck}
                colorClass="blue-gradient"
            />
            <StatCard 
                title="Low Severity" 
                value="48" 
                trend="8%" 
                isPositive={false} 
                icon={CheckCircle}
                colorClass="green-gradient"
            />
            <StatCard 
                title="Medium Severity" 
                value="39" 
                trend="5%" 
                isPositive={false} 
                icon={AlertTriangle}
                colorClass="orange-gradient"
            />
            <StatCard 
                title="High Severity" 
                value="37" 
                trend="15%" 
                isPositive={false} 
                icon={AlertCircle}
                colorClass="red-gradient"
            />
            <StatCard 
                title="Resolved Today" 
                value="86" 
                trend="20%" 
                isPositive={true} 
                icon={CheckCircle}
                colorClass="purple-gradient"
            />
            <StatCard 
                title="Avg. Response Time" 
                value="12.4" 
                trend="5%" 
                isPositive={true} 
                icon={Clock}
                colorClass="indigo-gradient"
            />
        </motion.div>
    );
};

export default StatsDock;
