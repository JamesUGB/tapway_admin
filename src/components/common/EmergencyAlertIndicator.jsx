import React, { useState } from 'react';
import { AlertTriangle, Bell, BellOff, Eye, EyeOff } from 'lucide-react';
import useEmergencyAlerts from '@/hooks/useEmergencyAlerts';
import { useAuth } from '@/context/AuthContext';

const EmergencyAlertIndicator = () => {
  const { pendingEmergencies, hasNewAlert } = useEmergencyAlerts();
  const { isAdmin, isResponder } = useAuth();
  const [showControls, setShowControls] = useState(false);

  // Only show for admin and responder roles
  if (!isAdmin && !isResponder) return null;

  if (pendingEmergencies.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 m-3 z-1050" style={{ marginTop: '80px' }}>
      <div className="position-relative">
        <div 
          className="d-flex align-items-center bg-white rounded shadow-lg p-3 border-start border-4 border-danger"
          style={{ minWidth: '220px' }}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <AlertTriangle className="text-danger me-2" size={20} />
          <div className="flex-grow-1">
            <p className="fw-semibold mb-0 small">
              {pendingEmergencies.length} Emergency Alert(s)
            </p>
            <p className="text-muted mb-0 small">
              {showControls ? 'Click alerts to view' : 'Action required'}
            </p>
          </div>
          
          {showControls && (
            <div className="ms-2 d-flex gap-1">
              <button 
                className="btn btn-sm btn-outline-secondary p-1"
                title="View Alerts"
                onClick={() => {/* You can add manual show logic here */}}
              >
                <Eye size={14} />
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary p-1"
                title="Snooze Alerts"
                onClick={() => {/* You can add snooze logic here */}}
              >
                <BellOff size={14} />
              </button>
            </div>
          )}
        </div>
        
        {/* Pulsing animation for new alerts */}
        {hasNewAlert && (
          <div className="position-absolute top-0 end-0 translate-middle">
            <span className="position-absolute animate-ping inline-flex rounded-full bg-danger opacity-75"
                  style={{ width: '12px', height: '12px' }}></span>
            <span className="relative inline-flex rounded-full bg-danger"
                  style={{ width: '12px', height: '12px' }}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlertIndicator;