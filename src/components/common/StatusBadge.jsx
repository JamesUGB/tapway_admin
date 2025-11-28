// src/components/common/StatusBadge.jsx
import React from 'react';
import { Badge } from 'react-bootstrap';
import {
  EMERGENCY_STATUS_LABELS,
  EMERGENCY_STATUS_COLORS,
  EMERGENCY_STATUS_ICONS
} from '@/constants/emergencyStatus';

const StatusBadge = ({ status, showIcon = true, className = '' }) => {
  return (
    <Badge 
      bg={EMERGENCY_STATUS_COLORS[status]} 
      className={`d-flex align-items-center gap-1 ${className}`}
      style={{ 
        fontSize: '0.75rem',
        padding: '0.35em 0.65em',
        width: 'fit-content'
      }}
    >
      {showIcon && (
        <i className={EMERGENCY_STATUS_ICONS[status]} style={{ fontSize: '0.8em', display: 'flex' }}></i>
      )}
      {EMERGENCY_STATUS_LABELS[status]}
    </Badge>
  );
};

export default StatusBadge;