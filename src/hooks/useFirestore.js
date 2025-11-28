// src/hooks/useFirestore.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getUsers, 
  getEmergencies,
  getEmergenciesRealtime, // Add this import
  updateEmergencyStatus 
} from '../services/firestore';

export const useFirestore = (initialEmergencyFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [lastEmergencyDoc, setLastEmergencyDoc] = useState(null);
  const [filters, setFilters] = useState(initialEmergencyFilters);

  // Fetch users (unchanged)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userRes = await getUsers();
        setUsers(userRes);
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // REAL-TIME emergencies listener
  useEffect(() => {
    let unsubscribe;

    const setupRealtimeEmergencies = () => {
      try {
        setEmergencyLoading(true);
        
        unsubscribe = getEmergenciesRealtime(
          filters,
          (newEmergencies) => {
            setEmergencies(newEmergencies);
            setEmergencyLoading(false);
          },
          (error) => {
            console.error('Real-time emergencies error:', error);
            setEmergencyLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up real-time emergencies:', error);
        setEmergencyLoading(false);
      }
    };

    setupRealtimeEmergencies();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filters]);

  // Real-time emergencies method
  const getEmergenciesRealtimeHook = useCallback((config, onUpdate, onError) => {
    return getEmergenciesRealtime(config, onUpdate, onError);
  }, []);

  // Update emergency status
  const updateEmergencyStatusHook = useCallback((emergencyId, newStatus, changedBy, responderId, notes) => {
    return updateEmergencyStatus(emergencyId, newStatus, changedBy, responderId, notes);
  }, []);

  // For backward compatibility - manual load more
  const loadMoreEmergencies = async () => {
    if (!lastEmergencyDoc) return;
    
    try {
      setEmergencyLoading(true);
      const { data, lastDoc } = await getEmergencies({
        ...filters,
        lastDoc: lastEmergencyDoc
      });
      setEmergencies(prev => [...prev, ...data]);
      setLastEmergencyDoc(lastDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  return { 
    users, 
    emergencies, 
    loading: userLoading || emergencyLoading,
    userLoading,
    emergencyLoading,
    lastEmergencyDoc,
    filters,
    setFilters,
    loadMoreEmergencies,
    // New real-time methods
    getEmergenciesRealtime: getEmergenciesRealtimeHook,
    updateEmergencyStatus: updateEmergencyStatusHook
  };
};