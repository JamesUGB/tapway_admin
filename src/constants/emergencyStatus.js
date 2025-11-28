// src/constants/emergencyStatus.js
export const EMERGENCY_STATUS = {
  PENDING: 'pending',
  ASSIGNED_IN_PROGRESS: 'assigned_in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
};

export const EMERGENCY_STATUS_LABELS = {
  [EMERGENCY_STATUS.PENDING]: 'Pending',
  [EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS]: 'In Progress',
  [EMERGENCY_STATUS.RESOLVED]: 'Resolved',
  [EMERGENCY_STATUS.CANCELLED]: 'Cancelled'
};

export const EMERGENCY_STATUS_COLORS = {
  [EMERGENCY_STATUS.PENDING]: 'warning',
  [EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS]: 'info',
  [EMERGENCY_STATUS.RESOLVED]: 'success',
  [EMERGENCY_STATUS.CANCELLED]: 'danger'
};

// ADD THIS - Icon configuration
export const EMERGENCY_STATUS_ICONS = {
  [EMERGENCY_STATUS.PENDING]: 'bi bi-exclamation-circle',
  [EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS]: 'bi bi-arrow-repeat',
  [EMERGENCY_STATUS.RESOLVED]: 'bi bi-check-circle',
  [EMERGENCY_STATUS.CANCELLED]: 'bi bi-x-circle'
};

export const EMERGENCY_ACTION_LABELS = {
  [EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS]: 'Assign Emergency',
  [EMERGENCY_STATUS.RESOLVED]: 'Mark as Resolved',
  [EMERGENCY_STATUS.CANCELLED]: 'Mark as Cancelled'
};