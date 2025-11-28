//src\pages\usermanagement\MemberManagement.jsx
import { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useMembers } from '@/hooks/useMembers';
import MemberTable from '@/components/ui/MemberTable';
import AddMemberDrawer from '@/components/ui/AddMemberDrawer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlobalDialog from '@/components/common/GlobalDialog';

export default function MemberManagement() {
  const {
    members,
    loading,
    error,
    createMember,
    editMember,
    removeMember,
    toggleMemberStatus,
    refreshMembers
  } = useMembers();

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 🔹 State for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowDrawer(true);
  };

  const handleDeleteClick = (memberId) => {
    setMemberToDelete(memberId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setActionLoading(true);
    try {
      await removeMember(memberToDelete);
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
      setMemberToDelete(null);
    }
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    setActionLoading(true);
    try {
      await toggleMemberStatus(memberId, currentStatus);
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
        await editMember(editingMember.id, memberData);
      } else {
        await createMember(memberData);
      }

      // ✅ Reset editing state and close drawer after save
      setEditingMember(null);
      setShowDrawer(false);

    } catch (err) {
      console.error('Failed to save member:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingMember(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Member Management</h2>
      </div>

      <MemberTable
        members={members}
        onEdit={handleEdit}
        onDelete={handleDeleteClick} 
        onToggleStatus={handleToggleStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        setShowDrawer={setShowDrawer}
        actionLoading={actionLoading}
      />

      <AddMemberDrawer
        show={showDrawer}
        onHide={() => {
          setShowDrawer(false);
          setEditingMember(null);   // ✅ Reset editing state
        }}
        member={editingMember}
        onSave={handleSaveMember}
        loading={actionLoading}
      />

      {/* Delete confirmation dialog */}
      <GlobalDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        title="Confirm Deletion"
        body={
          <>
            <p>Are you sure you want to delete this member?</p>
            <p className="text-muted small">
              This action cannot be undone.
            </p>
          </>
        }
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setShowDeleteDialog(false)
          },
          {
            label: 'Delete',
            variant: 'danger',
            onClick: confirmDelete
          }
        ]}
      />
    </div>
  );
}
