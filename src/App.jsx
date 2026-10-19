import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './store/ThemeContext';
import MainLayout from './components/MainLayout';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, Globe, Loader2 } from 'lucide-react';

// Lazy loaded Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const TrafficPage = lazy(() => import('./pages/TrafficPage'));
const RoutePage = lazy(() => import('./pages/RoutePage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const IncidentDashboard = lazy(() => import('./pages/IncidentDashboard'));
const ModelDashboard = lazy(() => import('./pages/ModelDashboard'));
const ModelComparison = lazy(() => import('./pages/Intelligence/ModelComparison'));
const RetrainingMonitor = lazy(() => import('./pages/Intelligence/RetrainingMonitor'));
const ServerTesting = lazy(() => import('./pages/ServerTesting'));

// Adult Dashboard Suite
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const Overview = lazy(() => import('./pages/Dashboard/Overview'));
const ApiTest = lazy(() => import('./pages/Dashboard/ApiTest'));
const MlTest = lazy(() => import('./pages/Dashboard/MlTest'));
const RoutingTest = lazy(() => import('./pages/Dashboard/RoutingTest'));
const TrafficTest = lazy(() => import('./pages/Dashboard/TrafficTest'));
const Monitoring = lazy(() => import('./pages/Dashboard/Monitoring'));
const IncidentReview = lazy(() => import('./pages/Dashboard/IncidentReview'));
const ReportGenerator = lazy(() => import('./pages/Dashboard/ReportGenerator'));
const DispatchControl = lazy(() => import('./pages/Dashboard/DispatchControl'));

// Suspense Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-screen bg-slate-900">
    <Loader2 className="animate-spin text-blue-500" size={48} />
  </div>
);

// Placeholder Pages
// ... (rest of imports)
const HowItWorks = () => (
  <div className="home-overlay">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hero-card glass-panel tech-stack-panel"
    >
      <div className="hero-badge">Architecture Overview</div>
      <h2>SafeCity Digital Twin</h2>
      <div className="tech-grid">
        <div className="tech-item">
          <ShieldCheck size={24} color="#3b82f6" />
          <h4>Hybrid Perception</h4>
          <p>On-device computer vision classifies incidents in milliseconds using lightweight transformers.</p>
        </div>
        <div className="tech-item">
          <Cpu size={24} color="#10b981" />
          <h4>Decision Engine</h4>
          <p>Server-side authority logic validates severity and triggers emergency response protocols.</p>
        </div>
        <div className="tech-item">
          <Globe size={24} color="#f59e0b" />
          <h4>Real-time Sync</h4>
          <p>Stateless synchronization ensuring every authority node sees the same ground-truth reality.</p>
        </div>
      </div>
      <p className="tech-footer">Our system complies with Ministry of Intelligence (MoI) standards for smart city connectivity.</p>
    </motion.div>
  </div>
);

const Login = () => (
  <div className="home-overlay">
    <div className="hero-card glass-panel" style={{ maxWidth: '400px' }}>
      <h2>Authority Portal</h2>
      <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Secure access for traffic police and city planners.</p>
      <input type="email" placeholder="gov-id@safecity.in" className="glass-input" style={{ marginBottom: '1rem' }} />
      <input type="password" placeholder="••••••••" className="glass-input" style={{ marginBottom: '1.5rem' }} />
      <button className="primary-btn" style={{ width: '100%' }}>Initiate Secure Session</button>
    </div>
  </div>
);

import { useIncidentsWebSocket } from './hooks/useIncidentsWebSocket';

const App = () => {
  useIncidentsWebSocket();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin Dashboard - Highest Priority, Independent Layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="api-test" element={<ApiTest />} />
              <Route path="ml-test" element={<MlTest />} />
              <Route path="routing-test" element={<RoutingTest />} />
              <Route path="traffic-test" element={<TrafficTest />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="review" element={<IncidentReview />} />
              <Route path="reports" element={<ReportGenerator />} />
              <Route path="dispatch" element={<DispatchControl />} />
            </Route>

            {/* Public Application Layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="traffic" element={<TrafficPage />} />
              <Route path="route" element={<RoutePage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="incidents" element={<IncidentDashboard />} />
              <Route path="testing" element={<ServerTesting />} />
              <Route path="model-intelligence" element={<ModelDashboard />} />
              <Route path="model-comparison" element={<ModelComparison />} />
              <Route path="model-lifecycle" element={<RetrainingMonitor />} />

              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
