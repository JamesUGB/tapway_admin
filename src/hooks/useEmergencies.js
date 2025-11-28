// src/hooks/useEmergencies.js
import { useState, useEffect, useContext } from 'react';
import { 
  getEmergencyById, 
  updateEmergencyStatus,
  getEmergenciesWithDetails 
} from '../services/firestore';
import { AuthContext } from '../context/AuthContext';

export const useEmergencies = (initialFilters = {}) => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { userData } = useContext(AuthContext);
  
const fetchEmergencies = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the enhanced function with role-based filtering
      const { data, lastDoc: newLastDoc } = await getEmergenciesWithDetails({
        ...filters,
        lastDoc: loadMore ? lastDoc : null
      }, userData?.role);
      
      setEmergencies(prev => loadMore ? [...prev, ...data] : data);
      setLastDoc(newLastDoc);
    } catch (err) {
      setError(err);
      console.error('Error fetching emergencies:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userData) { // Only fetch when user data is available
      fetchEmergencies();
    }
  }, [filters, userData]); // Add userData as dependency
  
  const changeStatus = async (emergencyId, newStatus, changedBy, notes = '') => {
    try {
      // Update status in Firestore
      await updateEmergencyStatus(emergencyId, newStatus, changedBy, notes);
      
      // Update local state
      setEmergencies(prev => prev.map(emg => 
        emg.id === emergencyId ? {
          ...emg,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusHistory: [
            ...(emg.statusHistory || []),
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              changedBy
            }
          ],
          // If status is resolved, set resolvedAt timestamp
          ...(newStatus === 'resolved' && { 
            resolvedAt: new Date().toISOString() 
          })
        } : emg
      ));
      
      return true;
    } catch (err) {
      setError(err);
      console.error('Error changing status:', err);
      return false;
    }
  };
  
  const refreshEmergency = async (emergencyId) => {
    try {
      const updatedEmergency = await getEmergencyById(emergencyId);
      setEmergencies(prev => prev.map(emg => 
        emg.id === emergencyId ? updatedEmergency : emg
      ));
    } catch (err) {
      console.error('Error refreshing emergency:', err);
    }
  };
  
  const refreshAll = () => {
    fetchEmergencies();
  };
  
  return {
    emergencies,
    loading,
    error,
    lastDoc,
    filters,
    setFilters,
    fetchMore: () => fetchEmergencies(true),
    changeStatus,
    refreshEmergency,
    refreshAll
  };
};