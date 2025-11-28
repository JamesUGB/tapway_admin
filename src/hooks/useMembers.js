// src/hooks/useMembers.js
import { useState, useEffect } from 'react';
import { 
  getMembers, 
  getMembersByDepartment,
  addMember, 
  updateMember, 
  deleteMember,
  updateMemberStatus 
} from '@/services/firestore';
import { useAuth } from './useAuth';
import { getDepartmentFromRole } from '@/utils/roleHelpers';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useAuth();

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      let membersData;
      
      if (userData?.role === 'super_admin') {
        membersData = await getMembers();
      } else {
        const userDepartment = getDepartmentFromRole(userData?.role, userData?.department);
        membersData = await getMembersByDepartment(userDepartment);
      }
      
      // Ensure all members have the new fields with default values
      const processedMembers = membersData.map(member => ({
        ...member,
        middleName: member.middleName || member.middleInitial || '', // Handle migration from middleInitial
        employmentType: member.employmentType || 'Regular', // Default value
        remarks: member.remarks || '',
        dutyStatus: member.dutyStatus || 'Off Duty' // Default value
      }));
      
      setMembers(processedMembers);
      setError(null);
    } catch (err) {
      setError('Failed to load members: ' + err.message);
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMember = async (memberData) => {
    try {
      setLoading(true);
      // Ensure required fields are present
      const completeMemberData = {
        ...memberData,
        employmentType: memberData.employmentType || 'Regular',
        dutyStatus: memberData.dutyStatus || 'Off Duty',
        remarks: memberData.remarks || ''
      };
      
      await addMember(completeMemberData);
      await loadMembers();
    } catch (err) {
      setError('Failed to create member: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editMember = async (memberId, memberData) => {
    try {
      setLoading(true);
      // Ensure required fields are present
      const completeMemberData = {
        ...memberData,
        employmentType: memberData.employmentType || 'Regular',
        dutyStatus: memberData.dutyStatus || 'Off Duty'
      };
      
      await updateMember(memberId, completeMemberData);
      await loadMembers();
    } catch (err) {
      setError('Failed to update member: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      setLoading(true);
      await deleteMember(memberId);
      await loadMembers();
    } catch (err) {
      setError('Failed to delete member: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberStatus = async (memberId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateMemberStatus(memberId, newStatus);
      await loadMembers();
    } catch (err) {
      setError('Failed to update member status: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData !== undefined) {
      loadMembers();
    }
  }, [userData]);

  return {
    members,
    loading,
    error,
    createMember,
    editMember,
    removeMember,
    toggleMemberStatus,
    refreshMembers: loadMembers,
    userDepartment: getDepartmentFromRole(userData?.role, userData?.department),
    isSuperAdmin: userData?.role === 'super_admin'
  };
};