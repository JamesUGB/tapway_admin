//emergencyStatus.js
export const EMERGENCY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

export const EMERGENCY_STATUS_LABELS = {
  [EMERGENCY_STATUS.PENDING]: 'Pending',
  [EMERGENCY_STATUS.ASSIGNED]: 'Assigned',
  [EMERGENCY_STATUS.IN_PROGRESS]: 'In Progress',
  [EMERGENCY_STATUS.RESOLVED]: 'Resolved',
  [EMERGENCY_STATUS.CANCELLED]: 'Cancelled',
};

export const EMERGENCY_STATUS_COLORS = {
  [EMERGENCY_STATUS.PENDING]: 'warning',
  [EMERGENCY_STATUS.ASSIGNED]: 'info',
  [EMERGENCY_STATUS.IN_PROGRESS]: 'primary',
  [EMERGENCY_STATUS.RESOLVED]: 'success',
  [EMERGENCY_STATUS.CANCELLED]: 'danger',
};