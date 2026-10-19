import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Zap, Globe, Cpu } from 'lucide-react';
import '../styles/HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-overlay">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-card glass-panel"
            >
                <div className="hero-badge">
                    <Zap size={14} />
                    <span>Active Intelligent Infrastructure</span>
                </div>
                <h1>Empowering Urban <span>Safety & Intelligence</span></h1>
                <p>
                    Experience the next generation of smart city traffic management.
                    Real-time AI analysis, predictive routing, and decentralized incident response.
                </p>
                <div className="hero-actions">
                    <button className="primary-btn" onClick={() => navigate('/traffic')}>
                        Launch Live Explorer
                        <ArrowRight size={18} />
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/how-it-works')}>
                        Technology Stack
                    </button>
                </div>
            </motion.div>

            <div className="feature-grid">
                {[
                    { icon: <Cpu />, title: "Hybrid AI", desc: "Edge perception meets server logic" },
                    { icon: <Globe />, title: "Global Sync", desc: "Stateless real-time synchronization" },
                    { icon: <ShieldCheck />, title: "Secure Gov", desc: "Enterprise-grade authority portal" }
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="feature-mini-card glass-panel"
                    >
                        <div className="f-icon">{f.icon}</div>
                        <h4>{f.title}</h4>
                        <p>{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
