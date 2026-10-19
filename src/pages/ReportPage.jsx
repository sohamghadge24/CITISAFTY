import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Camera, Map, Send, ShieldAlert } from 'lucide-react';
import useMapStore from '../store/useMapStore';
import { apiService } from '../services/api';
import '../styles/Pages.css';

const ReportPage = () => {
    const { addReport, userLocation } = useMapStore();
    const [report, setReport] = useState({
        type: 'Accident',
        description: '',
        severity: 'Medium'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Use real user location if available, otherwise default to Mumbai center
            const newReport = {
                ...report,
                lat: userLocation ? userLocation.lat : 19.0760,
                lng: userLocation ? userLocation.lng : 72.8777,
                timestamp: new Date().toISOString(),
                image: imagePreview
            };

            await apiService.submitIncident(newReport);
            addReport(newReport); 
            alert('Incident logged successfully. AI is processing the impact.');
            setReport({ type: 'Accident', description: '', severity: 'Medium' });
            setImagePreview(null);
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="side-panel glass-panel"
        >
            <div className="panel-header">
                <AlertTriangle className="header-icon" style={{ color: '#f59e0b' }} />
                <h2>Incident Dispatch</h2>
            </div>

            <form className="report-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Incident Category</label>
                    <select
                        value={report.type}
                        onChange={(e) => setReport({ ...report, type: e.target.value })}
                    >
                        <option>Accident</option>
                        <option>Road Hazard</option>
                        <option>Construction</option>
                        <option>Traffic Violation</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Severity Level</label>
                    <div className="severity-selector">
                        {['Low', 'Medium', 'High', 'Critical'].map(level => (
                            <button
                                key={level}
                                type="button"
                                className={`sev-btn ${report.severity === level ? 'active' : ''} ${level.toLowerCase()}`}
                                onClick={() => setReport({ ...report, severity: level })}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Incident Details</label>
                    <textarea
                        placeholder="Context for AI analysis..."
                        value={report.description}
                        onChange={(e) => setReport({ ...report, description: e.target.value })}
                    ></textarea>
                </div>

                <div
                    className="upload-preview glass-panel"
                    onClick={() => document.getElementById('image-upload').click()}
                    style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                >
                    <input
                        type="file"
                        id="image-upload"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <>
                            <Camera size={24} />
                            <span>Attach Visual Evidence</span>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                >
                    <Send size={18} />
                    <span>{isSubmitting ? 'Syncing...' : 'Dispatch Report'}</span>
                </button>
            </form>

            <div className="safety-note">
                <ShieldAlert size={14} />
                <p>Ensuring public safety through decentralized intelligence.</p>
            </div>
        </motion.div>
    );
};

export default ReportPage;
