// src/hooks/useUserData.js
import { useState, useEffect } from 'react';
import { getUserById } from '../services/firestore';

const userCache = new Map();

export const useUserData = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    // Check cache first
    if (userCache.has(userId)) {
      setUser(userCache.get(userId));
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        userCache.set(userId, userData);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { user, loading, error };
};