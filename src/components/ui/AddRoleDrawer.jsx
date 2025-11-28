import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import GlobalDialog from '@/components/common/GlobalDialog';
import { useRoles } from '@/hooks/useRoles';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AddRoleDrawer({
  show,
  onHide,
  members
}) {
  const {
    roles,
    loading,
    error,
    createRole,
    editRole,
    removeRole,
    updateRoleMemberCounts
  } = useRoles();

  const [newRole, setNewRole] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [errors, setErrors] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasCalculatedCounts, setHasCalculatedCounts] = useState(false);

  // Memoize members data to prevent unnecessary effect triggers
  const membersData = useMemo(() => members, [members]);

  // Update member counts when both members and roles are loaded
  useEffect(() => {
    if (show && membersData && membersData.length > 0) {
      console.log('AddRoleDrawer: Updating role counts with members data');
      updateRoleMemberCounts(membersData);
    }
  }, [show, membersData, updateRoleMemberCounts]);

  // Reset calculation when drawer closes or members change
  useEffect(() => {
    if (!show) {
      setHasCalculatedCounts(false);
    }
  }, [show, membersData]);
  
  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setErrors({ newRole: 'Role name is required' });
      return;
    }

    setActionLoading(true);
    try {
      await createRole(newRole.trim());
      setNewRole('');
      setErrors({});
    } catch (err) {
      setErrors({ newRole: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const startEditRole = (role) => {
    setEditingRole(role);
    setEditRoleName(role.name);
  };

  const handleUpdateRole = async () => {
    if (!editRoleName.trim()) {
      setErrors({ editRoleName: 'Role name is required' });
      return;
    }

    setActionLoading(true);
    try {
      await editRole(editingRole.id, editRoleName.trim());
      setEditingRole(null);
      setEditRoleName('');
      setErrors({});
    } catch (err) {
      setErrors({ editRoleName: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    setActionLoading(true);
    try {
      await removeRole(roleToDelete.id);
      setShowDeleteDialog(false);
      setRoleToDelete(null);
      setErrors({});
    } catch (err) {
      setErrors({ delete: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setEditRoleName('');
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddRole();
    }
  };

  // GlobalDialog actions for delete confirmation
  const deleteDialogActions = [
    {
      label: 'Cancel',
      variant: 'secondary',
      onClick: () => setShowDeleteDialog(false),
      disabled: actionLoading
    },
    {
      label: actionLoading ? 'Deleting...' : 'Delete Role',
      variant: 'danger',
      onClick: confirmDelete,
      disabled: actionLoading
    }
  ];

  if (loading) {
    return (
      <Drawer show={show} onHide={onHide} title="Add & Manage Roles" size="md">
        <LoadingSpinner />
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        show={show}
        onHide={onHide}
        title="Add New Role"
        size="md"
      >
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {/* Add New Role Section */}
        <div className="mb-4 p-0 bg-transparent rounded">
          <Form.Group>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={newRole}
                onChange={(e) => {
                  setNewRole(e.target.value);
                  if (errors.newRole) setErrors({});
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter new role name"
                isInvalid={!!errors.newRole}
                disabled={actionLoading}
              />
              <Button 
                variant="primary" 
                onClick={handleAddRole}
                disabled={!newRole.trim() || actionLoading}
              >
                {actionLoading ? 'Adding...' : 'Add'}
              </Button>
            </div>
            <Form.Control.Feedback type="invalid">
              {errors.newRole}
            </Form.Control.Feedback>
          </Form.Group>
        </div>

        {/* Current Roles Section */}
        <div>
          <h6 className="mb-3">Current Roles</h6>
          {errors.delete && (
            <Alert variant="warning" className="mb-3">
              {errors.delete}
            </Alert>
          )}
          
          <ListGroup>
            {roles.map((role) => (
              <ListGroup.Item key={role.id} className="d-flex justify-content-between align-items-center">
                {editingRole?.id === role.id ? (
                  <div className="d-flex align-items-center gap-2 flex-grow-1">
                    <Form.Control
                      size="sm"
                      value={editRoleName}
                      onChange={(e) => {
                        setEditRoleName(e.target.value);
                        if (errors.editRoleName) setErrors({});
                      }}
                      isInvalid={!!errors.editRoleName}
                      disabled={actionLoading}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="p-1 d-flex align-items-center justify-content-center border-0"
                      style={{ width: '32px', height: '32px' }}
                      onClick={handleUpdateRole}
                      disabled={actionLoading}
                      title="Save"
                    >
                      <Check size={16} className="text-success" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="p-1 d-flex align-items-center justify-content-center border-0"
                      style={{ width: '32px', height: '32px' }}
                      onClick={cancelEdit}
                      disabled={actionLoading}
                      title="Cancel"
                    >
                      <X size={16} className="text-muted" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className={role.isDefault ? 'fw-bold' : ''}>{role.name}</span>
                        {role.isDefault && (
                          <Badge bg="light" text="dark" className="small">Default</Badge>
                        )}
                        <Badge 
                          bg={role.memberCount > 0 ? 'primary' : 'secondary'} 
                          className="small"
                        >
                          {/* {role.memberCount} member(s) */}
                        </Badge>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      {!role.isDefault && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 d-flex align-items-center justify-content-center border-0"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => startEditRole(role)}
                            disabled={actionLoading}
                            title="Edit"
                          >
                            <Pencil size={14} className="text-muted" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 d-flex align-items-center justify-content-center border-0"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleDeleteClick(role)}
                            disabled={actionLoading}
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-danger" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <div className="mt-4 p-3 bg-white rounded">
          <ul className="small text-muted mb-0 list-unstyled">
            <li>Note: Default roles cannot be edited or deleted</li>
          </ul>
        </div>
      </Drawer>

      {/* GlobalDialog for Delete Confirmation */}
      <GlobalDialog
        show={showDeleteDialog}
        onHide={() => !actionLoading && setShowDeleteDialog(false)}
        title="Confirm Delete Role"
        description={`Are you sure you want to delete the role "${roleToDelete?.name}"?`}
        body={
          <p className="text-muted small mb-0">
            This action cannot be undone. The role will be permanently removed from the system.
          </p>
        }
        actions={deleteDialogActions}
      />
    </>
  );
}