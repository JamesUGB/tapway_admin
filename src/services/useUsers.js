// src/hooks/useUsers.js
import { useState } from 'react';
import { getUsers, updateUserRole } from '../services/firestore';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userRes = await getUsers();
      setUsers(userRes);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers(prev => prev.map(user => 
        user.id === uid ? { ...user, role: newRole } : user
      ));
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateRole
  };
};