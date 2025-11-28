// src/hooks/useMemberStatus.js
import { useMemo } from 'react';
import { 
  isMemberActive, 
  getMemberDisplayStyle, 
  canAssignToTeam, 
  canChangeDutyStatus,
  getEnforcedDutyStatus 
} from '@/utils/memberStatusHelpers';

export const useMemberStatus = (member) => {
  return useMemo(() => ({
    isActive: isMemberActive(member),
    displayStyle: getMemberDisplayStyle(member),
    canAssign: canAssignToTeam(member),
    canChangeDuty: canChangeDutyStatus(member),
    enforcedDutyStatus: getEnforcedDutyStatus(member)
  }), [member]);
};