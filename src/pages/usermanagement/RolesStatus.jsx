import { useState, useEffect, useMemo } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useMembers } from '@/hooks/useMembers';
import { useRoles } from '@/hooks/useRoles';
import RolesStatusTable from '@/components/ui/RolesStatusTable';
import EditMemberDrawer from '@/components/ui/EditRoleMemberDrawer';
import AddRoleDrawer from '@/components/ui/AddRoleDrawer';
import ManageRolesDrawer from '@/components/ui/ManageRolesDrawer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RolesStatus() {
  const {
    members,
    loading: membersLoading,
    error: membersError,
    editMember,
    toggleMemberStatus,
    refreshMembers
  } = useMembers();

  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    updateRoleMemberCounts,
    refreshRoles
  } = useRoles();

  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showAddRoleDrawer, setShowAddRoleDrawer] = useState(false);
  const [showManageRolesDrawer, setShowManageRolesDrawer] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [hasCalculatedCounts, setHasCalculatedCounts] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize members data to prevent unnecessary effect triggers
  const membersData = useMemo(() => members, [members]);

  // Update role member counts when both members and roles are loaded
  useEffect(() => {
    if (membersData && 
        membersData.length > 0 && 
        !membersLoading && 
        !rolesLoading && 
        !hasCalculatedCounts) {
      console.log('RolesStatus: Calculating role member counts with', membersData.length, 'members');
      updateRoleMemberCounts(membersData);
      setHasCalculatedCounts(true);
    }
  }, [membersData, membersLoading, rolesLoading, updateRoleMemberCounts, hasCalculatedCounts]);

  // Reset calculation flag when members change significantly
  useEffect(() => {
    if (membersData && membersData.length > 0) {
      setHasCalculatedCounts(false);
    }
  }, [membersData]);

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowEditDrawer(true);
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    setActionLoading(true);
    try {
      await toggleMemberStatus(memberId, currentStatus);
      // Refresh members to get updated data and recalculate counts
      refreshMembers();
      setHasCalculatedCounts(false);
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (err) {
      console.error('Failed to toggle member status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMember = async (memberData) => {
    setActionLoading(true);
    try {
      if (editingMember) {
        console.log('Saving member with data:', memberData);
        
        // Create the updated data object properly
        const updatedData = {
          ...memberData,
          // Ensure these fields are included if they're in memberData
          personnelPosition: memberData.personnelPosition || editingMember.personnelPosition,
          dutyStatus: memberData.dutyStatus || editingMember.dutyStatus
        };

        await editMember(editingMember.id, updatedData);
        
        // Refresh members to get updated data
        await refreshMembers();
        
        // Recalculate role counts
        await updateRoleMemberCounts(members);
        
        // Reset the calculation flag to force recalculation
        setHasCalculatedCounts(false);
        
        // Trigger refresh for RolesStatusTable
        setRefreshTrigger(prev => prev + 1);
        
        console.log('Member saved successfully, role counts recalculated');
      }

      // ✅ Reset editing state and close drawer after save
      setEditingMember(null);
      setShowEditDrawer(false);

    } catch (err) {
      console.error('Failed to save member:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseEditDrawer = () => {
    setShowEditDrawer(false);
    setEditingMember(null);
  };

  // Force refresh when roles are updated (e.g., after adding/deleting roles)
  useEffect(() => {
    if (membersData && membersData.length > 0) {
      updateRoleMemberCounts(membersData);
    }
  }, [roles.length]); // Refresh when roles change

  // Combine loading states
  const loading = membersLoading || rolesLoading;
  const error = membersError || rolesError;

  // Debug logging
  useEffect(() => {
    if (!loading && members && roles) {
      console.log('Current state:', {
        membersCount: members.length,
        rolesCount: roles.length,
        rolesWithMembers: roles.map(r => ({ name: r.name, count: r.memberCount })),
        hasCalculatedCounts: hasCalculatedCounts,
        refreshTrigger: refreshTrigger
      });
    }
  }, [loading, members, roles, hasCalculatedCounts, refreshTrigger]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Roles & Status Management</h2>
      </div>

      <RolesStatusTable
        members={members}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        setShowAddRoleDrawer={setShowAddRoleDrawer}
        setShowManageRolesDrawer={setShowManageRolesDrawer}
        actionLoading={actionLoading}
        refreshTrigger={refreshTrigger} // Pass refresh trigger
      />

      {/* Edit Member Drawer - Only for editing member details */}
      <EditMemberDrawer
        show={showEditDrawer}
        onHide={handleCloseEditDrawer}
        member={editingMember}
        onSave={handleSaveMember}
        loading={actionLoading}
        editableFields={['personnelPosition', 'dutyStatus']}
      />

      {/* Add Role Drawer - Dedicated for adding and managing roles */}
      <AddRoleDrawer
        show={showAddRoleDrawer}
        onHide={() => setShowAddRoleDrawer(false)}
        members={members}
      />

      {/* Manage Roles Drawer - For viewing all roles */}
      <ManageRolesDrawer
        show={showManageRolesDrawer}
        onHide={() => setShowManageRolesDrawer(false)}
        members={members}
      />
    </div>
  );
}