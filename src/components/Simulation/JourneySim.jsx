import React, { useState, useEffect } from 'react';
import { Play, Square, Navigation2, Clock, MapPin, Gauge } from 'lucide-react';
import '../../styles/glass.css';

const JourneySimulation = ({ route, onPositionUpdate, onExit }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [pointIndex, setPointIndex] = useState(0);
    const [eta, setEta] = useState(0);
    const [distanceRemaining, setDistanceRemaining] = useState(0);
    const [speed, setSpeed] = useState(0);

    useEffect(() => {
        if (!route || !isPlaying) {
            setSpeed(0);
            return;
        }

        const interval = setInterval(() => {
            setPointIndex((prev) => {
                if (prev >= route.points.length - 1) {
                    setIsPlaying(false);
                    setSpeed(0);
                    clearInterval(interval);
                    return prev;
                }
                const next = prev + 1;
                onPositionUpdate({
                    lng: route.points[next][0],
                    lat: route.points[next][1]
                });

                // Mock speed variation
                setSpeed(Math.floor(Math.random() * 20) + 40);

                return next;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [isPlaying, route]);

    useEffect(() => {
        if (route) {
            const remainingRatio = 1 - (pointIndex / route.points.length);
            setEta(Math.round((route.summary.travelTimeInSeconds / 60) * remainingRatio));
            setDistanceRemaining(((route.summary.lengthInMeters / 1000) * remainingRatio).toFixed(1));
        }
    }, [route, pointIndex]);

    return (
        <div className="glass-panel journey-panel simulation-active" style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 3rem)',
            maxWidth: '800px',
            padding: '1.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <div className="sim-stat">
                        <span className="stat-label">ETA</span>
                        <span className="stat-value primary">{eta} <small>min</small></span>
                    </div>
                    <div className="sim-stat">
                        <span className="stat-label">Distance</span>
                        <span className="stat-value">{distanceRemaining} <small>km</small></span>
                    </div>
                    <div className="sim-stat">
                        <span className="stat-label">Velocity</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Gauge size={14} color="var(--accent-primary)" />
                            <span className="stat-value">{speed} <small>km/h</small></span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`glass-button ${isPlaying ? 'secondary pause' : 'play-btn'}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{ borderRadius: '1rem', minWidth: '160px' }}
                    >
                        {isPlaying ? (
                            <><Square size={18} fill="currentColor" /> Pause Sim</>
                        ) : (
                            <><Play size={18} fill="currentColor" /> Start Drive</>
                        )}
                    </button>
                    <button className="glass-button secondary" onClick={onExit} style={{ width: '45px', padding: '0', borderRadius: '1rem' }}>
                        <Square size={18} />
                    </button>
                </div>
            </div>

            <div className="simulation-track">
                <div
                    className="track-progress"
                    style={{
                        width: `${(pointIndex / (route.points.length - 1)) * 100}%`
                    }}
                />
            </div>

            <style>{`
        .sim-stat { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 2px; }
        .stat-value { font-size: 1.4rem; font-weight: 800; font-variant-numeric: tabular-nums; }
        .stat-value.primary { color: var(--accent-primary); }
        .stat-value small { font-size: 0.8rem; font-weight: 400; opacity: 0.6; }
        
        .simulation-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; position: relative; }
        .track-progress { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); transition: width 0.15s linear; box-shadow: 0 0 10px var(--accent-primary); }
        
        .play-btn { background: var(--accent-primary) !important; color: white !important; border: none !important; }
        .pause { background: rgba(255,255,255,0.05) !important; }
      `}</style>
        </div>
    );
};

export default JourneySimulation;
