// src/constants/roles.js

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