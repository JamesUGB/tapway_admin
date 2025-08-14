import { useState, useEffect } from 'react';
import { Table, Form, Button, Badge } from 'react-bootstrap';
import { getUsers, updateUserRole } from '../services/firestore';
import { ROLES } from '../constants/roles';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '../constants/departments';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar'; // ✅ Make sure this path is correct
import Navbar from '../components/Navbar';   // ✅ Make sure this path is correct

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleOptions = () => {
    return [
      { value: ROLES.CITIZEN, label: 'Citizen' },
      { value: ROLES.FIRE_RESPONDER, label: 'Fire Responder' },
      { value: ROLES.POLICE_RESPONDER, label: 'Police Responder' },
      { value: ROLES.PARAMEDIC_RESPONDER, label: 'Paramedic Responder' },
      { value: ROLES.FIRE_ADMIN, label: 'Fire Admin' },
      { value: ROLES.POLICE_ADMIN, label: 'Police Admin' },
      { value: ROLES.PARAMEDIC_ADMIN, label: 'Paramedic Admin' },
      { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
    ].filter(option =>
      currentUser.role === ROLES.SUPER_ADMIN ||
      !option.value.includes('super')
    );
  };

  const getDepartmentFromRole = (role) => {
    if (role.includes('fire')) return DEPARTMENTS.FIRE;
    if (role.includes('police')) return DEPARTMENTS.POLICE;
    if (role.includes('paramedic')) return DEPARTMENTS.PARAMEDIC;
    return null;
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid p-4">
          <h1 className="mb-4">User Management</h1>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.displayName || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>
                      {getDepartmentFromRole(user.role) ? (
                        <Badge bg="info">
                          {DEPARTMENT_LABELS[getDepartmentFromRole(user.role)]}
                        </Badge>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <Badge bg="primary">
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Form.Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser.uid}
                      >
                        {getRoleOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </main>
      </div>
    </div>
  );
}
