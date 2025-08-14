// src/hooks/useEmergencies.js
import { useState, useEffect } from 'react';
import { getEmergencies, getEmergencyById, updateEmergencyStatus } from '../services/firestore';

export const useEmergencies = (initialFilters = {}) => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  
  const fetchEmergencies = async (loadMore = false) => {
    try {
      setLoading(true);
      const { data, lastDoc: newLastDoc } = await getEmergencies({
        ...filters,
        lastDoc: loadMore ? lastDoc : null
      });
      
      setEmergencies(prev => loadMore ? [...prev, ...data] : data);
      setLastDoc(newLastDoc);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmergencies();
  }, [filters]);
  
  const changeStatus = async (emergencyId, newStatus, changedBy) => {
    try {
      await updateEmergencyStatus(emergencyId, newStatus, changedBy);
      // Update local state
      setEmergencies(prev => prev.map(emg => 
        emg.id === emergencyId ? {
          ...emg,
          status: newStatus,
          statusHistory: [
            ...emg.statusHistory,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              changedBy
            }
          ]
        } : emg
      ));
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };
  
  return {
    emergencies,
    loading,
    error,
    lastDoc,
    filters,
    setFilters,
    fetchMore: () => fetchEmergencies(true),
    changeStatus
  };
};