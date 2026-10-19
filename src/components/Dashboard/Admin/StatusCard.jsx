import React from 'react';

const StatusCard = ({ label, value, icon, status, sub }) => {
    return (
        <div className="status-card">
            <div className="sc-header">
                {icon}
                {status && <div className={`status-indicator ${status}`} />}
            </div>
            <div className="sc-body">
                <div className="sc-label" style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    {label}
                </div>
                <div className="sc-value">{value}</div>
            </div>
            {sub && <div className="sc-sub">{sub}</div>}
        </div>
    );
};

export default StatusCard;
