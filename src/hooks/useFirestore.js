// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { getUsers, getEmergencies } from '../services/firestore';

export const useFirestore = (initialEmergencyFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [lastEmergencyDoc, setLastEmergencyDoc] = useState(null);
  const [filters, setFilters] = useState(initialEmergencyFilters);

  // Fetch users (unchanged as it's simple)
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

  // Fetch emergencies with new pattern
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        setEmergencyLoading(true);
        const { data, lastDoc } = await getEmergencies(filters);
        setEmergencies(data);
        setLastEmergencyDoc(lastDoc);
      } catch (err) {
        console.error(err);
      } finally {
        setEmergencyLoading(false);
      }
    };

    fetchEmergencies();
  }, [filters]);

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
    loadMoreEmergencies
  };
};