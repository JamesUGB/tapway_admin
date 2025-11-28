// src/hooks/useRoleBasedEmergencies.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  updateEmergencyStatus,
  getEmergenciesRealtime // Use the enhanced real-time function
} from '../services/firestore';

export const useRoleBasedEmergencies = (initialFilters = {}) => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { userData } = useAuth();
  
  // Real-time listener setup
  useEffect(() => {
    if (!userData) return;

    let unsubscribe;

    const setupRealtimeListener = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build config for real-time query
        const config = {
          status: filters.status || null,
          department: filters.department || null,
          limit: 50,
          lastDoc: null
        };

        console.log('Setting up enhanced real-time listener');

        // Use enhanced getEmergenciesRealtime with user details
        unsubscribe = getEmergenciesRealtime(
          config,
          userData.role,
          userData.department,
          (result) => {
            const { data: enhancedEmergencies, lastDoc: newLastDoc } = result;
            
            console.log('Enhanced real-time update:', enhancedEmergencies.length, 'emergencies');
            
            // Verify user data is included
            if (enhancedEmergencies.length > 0) {
              const sample = enhancedEmergencies[0];
              console.log('Sample emergency with user data:', {
                id: sample.id,
                hasUserInfo: !!sample.userInfo,
                userName: sample.userInfo?.name || sample.userInfo?.displayName || 'No name',
                location: sample.location?.formattedAddress || sample.location?.address || 'No address'
              });
            }
            
            setEmergencies(enhancedEmergencies);
            setLastDoc(newLastDoc);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error('Enhanced real-time listener error:', err);
          }
        );

      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData, filters.status, filters.department]);

  // Keep fetchEmergencies for backward compatibility if needed
  const fetchEmergencies = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userData) {
        console.log('No user data available, skipping fetch');
        setLoading(false);
        return;
      }
      
      // This uses the original one-time fetch function
      const { data, lastDoc: newLastDoc } = await getEmergenciesWithDetails({
        ...filters,
        lastDoc: loadMore ? lastDoc : null
      }, userData.role, userData.department);
      
      setEmergencies(prev => loadMore ? [...prev, ...data] : data);
      setLastDoc(newLastDoc);
    } catch (err) {
      setError(err);
      console.error('Error fetching emergencies:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const changeStatus = useCallback(async (emergencyId, newStatus, changedBy, responderId = null, notes = '') => {
    try {
      await updateEmergencyStatus(emergencyId, newStatus, changedBy, responderId, notes);
      return true;
    } catch (err) {
      setError(err);
      console.error('Error changing status:', err);
      throw err;
    }
  }, []);
  
  const refreshAll = useCallback(() => {
    setLoading(true);
  }, []);

  const fetchMore = useCallback(() => {
    console.log('Load more functionality might work differently with real-time updates');
  }, []);

  return {
    emergencies,
    loading,
    error,
    lastDoc,
    filters,
    setFilters,
    fetchMore,
    refreshAll,
    changeStatus
  };
};