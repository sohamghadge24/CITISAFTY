import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [stats, setStats] = useState({
        serverHealth: 'checking',
        latency: 0,
        activeModel: 'CLIP-ResNet-Hybrid',
        totalReports: 0,
        lastRetrain: '2h ago',
        trafficEngine: 'Healthy'
    });

    const [logs, setLogs] = useState([]);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{
            id: Date.now(),
            msg,
            type,
            time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const refreshStats = async () => {
        const start = Date.now();
        try {
            // Using existing traffic endpoint as health check
            const data = await apiService.getTrafficData();
            const latency = Date.now() - start;

            setStats(prev => ({
                ...prev,
                serverHealth: 'operational',
                latency,
                totalReports: prev.totalReports + 1 // Mock increment for demo
            }));
            addLog("System health check completed", "success");
        } catch (err) {
            setStats(prev => ({ ...prev, serverHealth: 'error' }));
            addLog("System health check failed", "error");
        }
    };

    useEffect(() => {
        refreshStats();
        const interval = setInterval(refreshStats, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardContext.Provider value={{ stats, logs, addLog, refreshStats }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
