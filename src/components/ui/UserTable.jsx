// src/components/ui/UserTable.jsx
import React from 'react';

export const UserTable = ({ users, onRoleUpdate }) => {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.uid}>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td><span className="badge bg-primary">{user.role}</span></td>
            <td>
              <select
                defaultValue={user.role}
                onChange={(e) => onRoleUpdate(user.uid, e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="citizen">Citizen</option>
                <option value="fire_admin">Fire Admin</option>
                <option value="police_admin">Police Admin</option>
                <option value="paramedic_admin">Paramedic Admin</option>
                <option value="fire_responder">Fire Responder</option>
                <option value="police_responder">Police Responder</option>
                <option value="paramedic_responder">Paramedic Responder</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};