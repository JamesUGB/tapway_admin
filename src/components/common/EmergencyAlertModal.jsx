import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, User, Phone, AlertTriangle, X, Bell, BellOff } from 'lucide-react';
import { getEmergencyColor } from '@/constants/emergencyColors';
import { getEmergenciesRealtime } from '@/services/firestore';
import { useAuth } from '@/context/AuthContext';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';
import 'leaflet/dist/leaflet.css';

const EmergencyAlertModal = () => {
  const { userData, isAuthenticated } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [show, setShow] = useState(false);
  const [currentEmergencyIndex, setCurrentEmergencyIndex] = useState(0);
  const [userDismissed, setUserDismissed] = useState(new Set());
  const [snoozeUntil, setSnoozeUntil] = useState(null);
  const [autoShow, setAutoShow] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !userData?.department) return;

    const departmentMap = {
      police_admin: 'PNP',
      fire_admin: 'BFP',
      medical_admin: 'MDDRMO',
      police_responder: 'PNP',
      fire_responder: 'BFP',
      medical_responder: 'MDDRMO'
    };

    const userDepartment = departmentMap[userData.role] || userData.department;

    const unsubscribe = getEmergenciesRealtime(
      {
        status: EMERGENCY_STATUS.PENDING,
        department: userDepartment
      },
      userData.role,
      userData.department,
      (result) => {
        const pendingEmergencies = result.data.filter(
          emergency => emergency.status === EMERGENCY_STATUS.PENDING
        );
        
        setEmergencies(pendingEmergencies);
        
        const shouldAutoShow = autoShow && 
          pendingEmergencies.length > 0 && 
          !show && 
          !snoozeUntil &&
          pendingEmergencies.some(emergency => !userDismissed.has(emergency.id));
        
        if (shouldAutoShow) {
          setShow(true);
          setCurrentEmergencyIndex(0);
        }
        
        if ((pendingEmergencies.length === 0 || 
            pendingEmergencies.every(emergency => userDismissed.has(emergency.id))) && 
            show) {
          setShow(false);
        }
      },
      (error) => {
        console.error('Error in real-time emergency listener:', error);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, userData, show, userDismissed, snoozeUntil, autoShow]);

  useEffect(() => {
    if (snoozeUntil && new Date() > snoozeUntil) {
      setSnoozeUntil(null);
    }
  }, [snoozeUntil]);

  const handleClose = () => {
    if (currentEmergency) {
      setUserDismissed(prev => new Set([...prev, currentEmergency.id]));
    }
    setShow(false);
  };

  const handleSnooze = (minutes = 5) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
    setSnoozeUntil(snoozeTime);
    setShow(false);
  };

  const handleAcknowledgeAll = () => {
    const allEmergencyIds = emergencies.map(emergency => emergency.id);
    setUserDismissed(prev => new Set([...prev, ...allEmergencyIds]));
    setShow(false);
  };

  const handleNext = () => {
    if (currentEmergencyIndex < emergencies.length - 1) {
      setCurrentEmergencyIndex(currentEmergencyIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentEmergencyIndex > 0) {
      setCurrentEmergencyIndex(currentEmergencyIndex - 1);
    }
  };

  const activeEmergencies = emergencies.filter(emergency => !userDismissed.has(emergency.id));
  const currentEmergency = activeEmergencies[currentEmergencyIndex];

  useEffect(() => {
    if (activeEmergencies.length === 0) {
      setShow(false);
    } else if (currentEmergencyIndex >= activeEmergencies.length) {
      setCurrentEmergencyIndex(Math.max(0, activeEmergencies.length - 1));
    }
  }, [activeEmergencies, currentEmergencyIndex]);

  if (!show || !currentEmergency || snoozeUntil) return null;

  const emergencyColor = getEmergencyColor(currentEmergency.emergencyType);
  const userInfo = currentEmergency.userInfo || currentEmergency.citizenInfo;

  return (
    <>
      {/* Custom Backdrop with Blur */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1040
        }}
        onClick={handleClose}
      />

      <Modal
        show={show}
        onHide={handleClose}
        centered
        backdrop={false}
        keyboard={false}
        size="md"
        className="emergency-alert-modal"
        style={{ maxHeight: '90vh', zIndex: 1050 }}
      >
      {/* Compact Header */}
      <div 
        className="d-flex align-items-center justify-content-between px-3 py-2 text-white"
        style={{ backgroundColor: emergencyColor.primary }}
      >
        <div className="d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          <span className="fw-semibold small text-uppercase">{currentEmergency.emergencyType}</span>
          {activeEmergencies.length > 1 && (
            <span className="badge bg-white bg-opacity-25 rounded-pill px-2">
              {currentEmergencyIndex + 1}/{activeEmergencies.length}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white btn-sm"
          onClick={handleClose}
        ></button>
      </div>

      <Modal.Body className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Auto-show Toggle - Compact (COMMENTED) */}
        {/* <div className="d-flex align-items-center justify-content-between py-2 px-3 bg-light rounded mb-3">
          <small className="text-muted">Auto-show alerts</small>
          <Form.Check
            type="switch"
            checked={autoShow}
            onChange={(e) => setAutoShow(e.target.checked)}
          />
        </div> */}

        {/* Citizen Info - Inline */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <User size={16} className="text-muted" />
            <span className="fw-semibold">{userInfo?.firstName} {userInfo?.lastName}</span>
          </div>
          {userInfo?.phone && (
            <div className="d-flex align-items-center gap-2 text-muted small">
              <Phone size={14} />
              <span>{userInfo.phone}</span>
            </div>
          )}
        </div>

        {/* Location - Compact */}
        <div className="mb-3">
          <div className="d-flex align-items-start gap-2">
            <MapPin size={16} className="text-muted mt-1 flex-shrink-0" />
            <div className="flex-grow-1">
              <p className="mb-1 small">
                {currentEmergency.location?.address?.formatted || 
                currentEmergency.location?.address?.street || 
                'Location unavailable'}
              </p>
              {currentEmergency.location?.address?.barangay && (
                <small className="text-muted">Brgy. {currentEmergency.location.address.barangay}</small>
              )}
            </div>
          </div>
        </div>

        {/* Coordinates - Minimal */}
        {currentEmergency.location?.coordinates && (
          <div className="mb-3 p-2 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center small text-muted">
              <span>Lat: {currentEmergency.location.coordinates.latitude?.toFixed(4)}</span>
              <span>Lng: {currentEmergency.location.coordinates.longitude?.toFixed(4)}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {/* {currentEmergency.description && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Details</small>
            <p className="small mb-0">{currentEmergency.description}</p>
          </div>
        )} */}

        {/* Time */}
        <div className="small text-muted">
          {currentEmergency.createdAt ? 
            new Date(currentEmergency.createdAt).toLocaleString() : 
            'Just now'}
        </div>
      </Modal.Body>

{/* Footer */}
<div className="border-top p-2">

  {/* Navigation + Acknowledge + All */}
  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
    
    {/* Previous/Next */}
    <div className="d-flex gap-1">
      {activeEmergencies.length > 1 && (
        <>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePrevious}
            disabled={currentEmergencyIndex === 0}
          >
            ←
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNext}
          >
            {currentEmergencyIndex === activeEmergencies.length - 1 ? '✓' : '→'}
          </Button>
        </>
      )}
    </div>

    {/* Right side_controls */}
    <div className="d-flex gap-2 align-items-center">
      {/* Acknowledge */}
      <Button
        size="sm"
        onClick={handleClose}
        style={{ 
          backgroundColor: emergencyColor.primary,
          borderColor: emergencyColor.primary,
          minWidth: '100px'
        }}
      >
        Acknowledge
      </Button>

      {/* Acknowledge All */}
      {activeEmergencies.length > 1 && (
        <Button
          variant="link"
          size="sm"
          className="text-danger text-decoration-none p-1"
          onClick={handleAcknowledgeAll}
        >
          All ({activeEmergencies.length})
        </Button>
      )}
    </div>
  </div>

  {/* Snooze Options */}
  <div className="d-flex justify-content-between align-items-center gap-2 px-1">
    <div className="d-flex gap-1">
      <Button
        variant="link"
        size="sm"
        className="text-muted text-decoration-none p-1"
        onClick={() => handleSnooze(5)}
      >
        <BellOff size={14} className="me-1" />
        5m
      </Button>
      <Button
        variant="link"
        size="sm"
        className="text-muted text-decoration-none p-1"
        onClick={() => handleSnooze(15)}
      >
        <BellOff size={14} className="me-1" />
        15m
      </Button>
    </div>
  </div>

</div>

    </Modal>
    </>
  );
};

export default EmergencyAlertModal;