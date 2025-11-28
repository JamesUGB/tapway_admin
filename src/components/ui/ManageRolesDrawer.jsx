import React, { useState, useEffect } from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import Drawer from '@/components/common/Drawer';
import { useRoles } from '@/hooks/useRoles';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ManageRolesDrawer({
  show,
  onHide,
  members
}) {
  const { roles, loading, error, updateRoleMemberCounts } = useRoles();

  // Update member counts when members change
useEffect(() => {
  if (show && members && members.length > 0) {
    console.log('ManageRolesDrawer: Updating role counts with members data');
    updateRoleMemberCounts(members);
  }
}, [show, members, updateRoleMemberCounts]);

  if (loading) {
    return (
      <Drawer show={show} onHide={onHide} title="View All Roles" size="md">
        <LoadingSpinner />
      </Drawer>
    );
  }

  return (
    <Drawer
      show={show}
      onHide={onHide}
      title="All Roles"
      size="md"
    >
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
{/* 
      <div className="mb-3">
        <p className="text-muted">
          This view shows all available roles in the system. To add, edit, or delete roles, 
          use the "Add Role" drawer.
        </p>
      </div> */}

      <ListGroup>
        {roles.map((role) => (
          <ListGroup.Item key={role.id} className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <span className={role.isDefault ? 'fw-bold' : ''}>{role.name}</span>
                {role.isDefault && (
                  <Badge bg="light" text="dark" className="small">Default</Badge>
                )}
              </div>
              <small className="text-muted">
                {role.memberCount} member(s) assigned to this role
              </small>
            </div>
            <Badge 
              bg={role.memberCount > 0 ? 'primary' : 'secondary'}
            >
              {role.memberCount}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <div className="mt-4 p-3 bg-light rounded">
        <h6 className="small">Role Statistics</h6>
        <div className="small text-muted">
          <div>Total Roles: <strong>{roles.length}</strong></div>
          <div>Default Roles: <strong>{roles.filter(r => r.isDefault).length}</strong></div>
          <div>Custom Roles: <strong>{roles.filter(r => !r.isDefault).length}</strong></div>
          <div>Total Members Assigned: <strong>{roles.reduce((sum, role) => sum + role.memberCount, 0)}</strong></div>
        </div>
      </div>
    </Drawer>
  );
}