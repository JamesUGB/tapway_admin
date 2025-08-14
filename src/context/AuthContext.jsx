// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, login, logout } from '@/services/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err);
      return null;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { success, error, user } = await login(email, password);
      if (success) {
        const userDetails = await fetchUserData(user.uid);
        setCurrentUser(user);
        setUserData(userDetails);
        return { success: true };
      }
      setError(error);
      return { success: false, error };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        const userDetails = await fetchUserData(user.uid);
        setUserData(userDetails);
      } else {
        setUserData(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

 const value = {
    currentUser,
    userData,
    isAuthenticated: !!currentUser,
    isSuperAdmin: userData?.role === 'super_admin',
    isAdmin: userData ? ['fire_admin', 'police_admin', 'medical_admin'].includes(userData.role) : false,
    isResponder: userData ? ['fire_responder', 'police_responder', 'medical_responder'].includes(userData.role) : false,
    department: userData?.department || null,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshUserData: async () => {
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setUserData(data);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}