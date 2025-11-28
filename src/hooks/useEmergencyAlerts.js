import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEmergenciesRealtime } from '@/services/firestore';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';

export const useEmergencyAlerts = () => {
  const { currentUser, userData, isAuthenticated } = useAuth();
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [userDismissed, setUserDismissed] = useState(new Set());
  const [snoozeUntil, setSnoozeUntil] = useState(null);

  // Load persisted data from localStorage
  useEffect(() => {
    if (!userData?.id) return;
    
    const key = `emergencyAlerts_${userData.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.dismissed) setUserDismissed(new Set(data.dismissed));
        if (data.snoozeUntil && new Date(data.snoozeUntil) > new Date()) {
          setSnoozeUntil(new Date(data.snoozeUntil));
        }
      } catch (error) {
        console.error('Error loading emergency alert settings:', error);
      }
    }
  }, [userData?.id]);

  // Save to localStorage when dismissed or snoozed changes
  useEffect(() => {
    if (!userData?.id) return;
    
    const key = `emergencyAlerts_${userData.id}`;
    const data = {
      dismissed: Array.from(userDismissed),
      snoozeUntil: snoozeUntil?.toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
  }, [userDismissed, snoozeUntil, userData?.id]);

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
        const newPendingEmergencies = result.data.filter(
          emergency => emergency.status === EMERGENCY_STATUS.PENDING
        );

        // Filter out dismissed emergencies
        const activeEmergencies = newPendingEmergencies.filter(
          emergency => !userDismissed.has(emergency.id)
        );

        // Check if there are new emergencies (not dismissed)
        if (activeEmergencies.length > pendingEmergencies.length) {
          setHasNewAlert(true);
        }

        setPendingEmergencies(newPendingEmergencies);
      },
      (error) => {
        console.error('Error in emergency alerts hook:', error);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, userData, pendingEmergencies.length, userDismissed, snoozeUntil]);

  const clearNewAlert = () => {
    setHasNewAlert(false);
  };

  const dismissEmergency = (emergencyId) => {
    setUserDismissed(prev => new Set([...prev, emergencyId]));
  };

  const snoozeAlerts = (minutes) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
    setSnoozeUntil(snoozeTime);
  };

  const clearSnooze = () => {
    setSnoozeUntil(null);
  };

  const clearAllDismissed = () => {
    setUserDismissed(new Set());
  };

  return {
    pendingEmergencies,
    hasNewAlert,
    userDismissed,
    snoozeUntil,
    clearNewAlert,
    dismissEmergency,
    snoozeAlerts,
    clearSnooze,
    clearAllDismissed
  };
};

export default useEmergencyAlerts;