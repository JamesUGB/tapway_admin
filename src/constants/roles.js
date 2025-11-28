// src/constants/roles.js
export const personnelPositions = [
  { value: 'Member', label: 'Member' },
  { value: 'Team Leader', label: 'Team Leader' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Admin', label: 'Admin' }
];

export const dutyStatuses = [
  { value: 'On Duty', label: 'On Duty' },
  { value: 'Off Duty', label: 'Off Duty' },
  { value: 'On Leave', label: 'On Leave' }
];

export const accountStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];
export const ROLES = {
  CITIZEN: 'citizen',
  FIRE_ADMIN: 'fire_admin',
  POLICE_ADMIN: 'police_admin',
  PARAMEDIC_ADMIN: 'paramedic_admin',
  FIRE_RESPONDER: 'fire_responder',
  POLICE_RESPONDER: 'police_responder',
  PARAMEDIC_RESPONDER: 'paramedic_responder',
  SUPER_ADMIN: 'super_admin',
};

// Helper functions
export const isAdminRole = (role) =>
  role && (role.endsWith('_admin') || role === ROLES.SUPER_ADMIN);

export const isResponderRole = (role) =>
  role && role.endsWith('_responder');

export const isSuperAdmin = (role) => role === ROLES.SUPER_ADMIN;