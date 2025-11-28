// C:\Users\Zino\Documents\tapway_admin\src\hooks\useRoles.js
import { useState, useEffect, useCallback, useContext } from 'react';
import { 
  getRoles, 
  addRole, 
  updateRole, 
  deleteRole,
  updateRoleMemberCount // Add this import
} from '@/services/firestore';
import { personnelPositions } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberCountsCache, setMemberCountsCache] = useState({});
  
  // Get current user from AuthContext for audit trail
  const { userData, department } = useAuth();

  // Load roles from Firestore
  const loadRoles = async () => {
    try {
      setLoading(true);
      const firestoreRoles = await getRoles();
      
      // Combine default roles with Firestore roles
      const defaultRoles = personnelPositions.map(position => ({
        id: `default-${position.value}`,
        name: position.value,
        isDefault: true,
        memberCount: 0, // Initialize with 0, will be updated by updateRoleMemberCounts
        // Default roles don't have audit trail
        createdBy: 'system',
        creatorDepartment: 'system',
        createdAt: null,
        updatedAt: null
      }));

      // Merge roles, giving priority to Firestore roles
      const allRoles = [...defaultRoles];
      firestoreRoles.forEach(firestoreRole => {
        const existingIndex = allRoles.findIndex(role => role.name === firestoreRole.name);
        if (existingIndex === -1) {
          allRoles.push({
            ...firestoreRole,
            isDefault: false,
            memberCount: firestoreRole.memberCount || 0 // Use Firestore stored count
          });
        } else {
          // Update the default role with Firestore data
          allRoles[existingIndex] = {
            ...allRoles[existingIndex],
            ...firestoreRole,
            isDefault: true,
            memberCount: firestoreRole.memberCount || allRoles[existingIndex].memberCount
          };
        }
      });

      setRoles(allRoles);
      setError(null);
    } catch (err) {
      setError('Failed to load roles: ' + err.message);
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update member count for roles - FIXED VERSION
  const updateRoleMemberCounts = useCallback(async (members) => {
    if (!members || members.length === 0) {
      console.log('No members provided for role count calculation');
      // Reset all counts to 0 if no members
      setRoles(prev => prev.map(role => ({ ...role, memberCount: 0 })));
      return;
    }

    console.log('Calculating member counts for roles. Total members:', members.length);
    
    const memberCounts = {};
    
    // Count members per role name (using personnelPosition)
    members.forEach(member => {
      if (member.personnelPosition) {
        const roleName = member.personnelPosition;
        memberCounts[roleName] = (memberCounts[roleName] || 0) + 1;
      }
    });

    console.log('Calculated role counts:', memberCounts);

    // Update the cache
    setMemberCountsCache(memberCounts);

    // Get current user info for audit trail
    const currentUserId = userData?.id || null;
    const currentUserDepartment = department || null;

    // Update roles with member counts and persist to Firestore
    setRoles(prev => {
      const updatedRoles = prev.map(role => {
        const newCount = memberCounts[role.name] || 0;
        
        // Only update Firestore for non-default roles and if count changed
        if (!role.isDefault && role.memberCount !== newCount) {
          console.log(`Updating Firestore for role ${role.name}: ${role.memberCount} -> ${newCount}`);
          updateRoleMemberCount(role.id, newCount, currentUserId, currentUserDepartment)
            .catch(err => console.error(`Failed to update Firestore for role ${role.name}:`, err));
        }
        
        return {
          ...role,
          memberCount: newCount
        };
      });

      return updatedRoles;
    });
  }, [userData, department]);

  // Add a new role with audit trail - UPDATED
  const createRole = async (roleName) => {
    try {
      // Check if role already exists
      const existingRole = roles.find(role => 
        role.name.toLowerCase() === roleName.toLowerCase()
      );
      
      if (existingRole) {
        throw new Error('Role already exists');
      }

      const roleData = {
        name: roleName.trim(),
        memberCount: 0 // Explicitly set to 0 for new roles
      };

      // Get current user info for audit trail
      const currentUserId = userData?.id || null;
      const currentUserDepartment = department || null;

      const roleId = await addRole(roleData, currentUserId, currentUserDepartment);
      
      // Update local state
      const newRole = { 
        id: roleId, 
        ...roleData, 
        isDefault: false,
        createdBy: currentUserId,
        creatorDepartment: currentUserDepartment,
        lastModifiedBy: currentUserId,
        lastModifiedDepartment: currentUserDepartment,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setRoles(prev => [...prev, newRole]);
      
      console.log(`Role "${roleName}" created by ${currentUserId} from ${currentUserDepartment}`);
      return roleId;
    } catch (err) {
      setError('Failed to create role: ' + err.message);
      throw err;
    }
  };

  // Update an existing role with audit trail - UPDATED
  const editRole = async (roleId, newName) => {
    try {
      // Check if new name already exists
      const existingRole = roles.find(role => 
        role.name.toLowerCase() === newName.toLowerCase() && role.id !== roleId
      );
      
      if (existingRole) {
        throw new Error('Role name already exists');
      }

      const roleData = { name: newName.trim() };
      
      // Get current user info for audit trail
      const currentUserId = userData?.id || null;
      const currentUserDepartment = department || null;

      // Only update in Firestore if it's not a default role
      const roleToUpdate = roles.find(role => role.id === roleId);
      if (!roleToUpdate.isDefault) {
        await updateRole(roleId, roleData, currentUserId, currentUserDepartment);
      }

      // Update local state - preserve memberCount
      setRoles(prev => prev.map(role =>
        role.id === roleId ? { 
          ...role, 
          ...roleData,
          memberCount: role.memberCount, // Preserve existing count
          lastModifiedBy: currentUserId,
          lastModifiedDepartment: currentUserDepartment,
          updatedAt: new Date()
        } : role
      ));
      
      console.log(`Role "${newName}" updated by ${currentUserId} from ${currentUserDepartment}`);
    } catch (err) {
      setError('Failed to update role: ' + err.message);
      throw err;
    }
  };

  // Delete a role with audit trail - UPDATED
  const removeRole = async (roleId) => {
    try {
      const roleToDelete = roles.find(role => role.id === roleId);
      
      if (roleToDelete.isDefault) {
        throw new Error('Cannot delete default roles');
      }

      if (roleToDelete.memberCount > 0) {
        throw new Error(`Cannot delete role "${roleToDelete.name}" because it is assigned to ${roleToDelete.memberCount} member(s)`);
      }

      // Get current user info for audit trail
      const currentUserId = userData?.id || null;
      const currentUserDepartment = department || null;

      // Delete from Firestore
      await deleteRole(roleId, currentUserId, currentUserDepartment);
      
      // Update local state
      setRoles(prev => prev.filter(role => role.id !== roleId));
      
      console.log(`Role "${roleToDelete.name}" deleted by ${currentUserId} from ${currentUserDepartment}`);
    } catch (err) {
      setError('Failed to delete role: ' + err.message);
      throw err;
    }
  };

  // Refresh roles
  const refreshRoles = () => {
    loadRoles();
  };

  // Get role by name - UTILITY FUNCTION
  const getRoleByName = useCallback((roleName) => {
    return roles.find(role => role.name === roleName);
  }, [roles]);

  // Get role by ID - UTILITY FUNCTION
  const getRoleById = useCallback((roleId) => {
    return roles.find(role => role.id === roleId);
  }, [roles]);

  useEffect(() => {
    loadRoles();
  }, []);

  // Remove the problematic cache effect as it's causing issues
  // The updateRoleMemberCounts function now handles everything

  return {
    roles,
    loading,
    error,
    createRole,
    editRole,
    removeRole,
    updateRoleMemberCounts,
    refreshRoles,
    getRoleByName,
    getRoleById
  };
};