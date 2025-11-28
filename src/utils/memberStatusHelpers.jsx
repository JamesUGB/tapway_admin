// src/utils/memberStatusHelpers.js
import { Badge } from 'react-bootstrap';

/**
 * Check if member is active
 */
export const isMemberActive = (member) => {
  return member?.status === 'active';
};

/**
 * Get member display style based on status
 */
export const getMemberDisplayStyle = (member) => {
  if (!isMemberActive(member)) {
    return {
      textDecoration: 'line-through',
      opacity: 0.6,
      color: '#6c757d'
    };
  }
  return {};
};

/**
 * Get member badge variant based on status
 */
export const getMemberStatusBadge = (member) => {
  return isMemberActive(member) ? 'success' : 'secondary';
};

/**
 * Check if member can be assigned to team
 */
export const canAssignToTeam = (member) => {
  return isMemberActive(member);
};

/**
 * Check if duty status can be changed
 */
export const canChangeDutyStatus = (member) => {
  return isMemberActive(member);
};

/**
 * Get enforced duty status for member
 */
export const getEnforcedDutyStatus = (member) => {
  if (!isMemberActive(member)) {
    return 'Off Duty';
  }
  return member.dutyStatus || 'Off Duty';
};

/**
 * Wrapper component for member display with status styling
 */
export const MemberDisplayWrapper = ({ member, children, className = '' }) => {
  const style = getMemberDisplayStyle(member);
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};

/**
 * Status badge component for members
 */
export const MemberStatusBadge = ({ member }) => {
  return (
    <Badge bg={getMemberStatusBadge(member)}>
      {member?.status || 'inactive'}
    </Badge>
  );
};