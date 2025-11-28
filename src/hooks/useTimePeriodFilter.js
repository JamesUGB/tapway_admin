import { useState, useEffect, useCallback } from 'react';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';

export const useTimePeriodFilter = (emergencies, initialPeriod = 'today') => {
  const [timePeriod, setTimePeriod] = useState(initialPeriod);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);

  // Memoize the filter function
  const filterEmergenciesByTimePeriod = useCallback((emergenciesData, period) => {
    const now = new Date();
    
    const resolvedEmergencies = emergenciesData
      .filter(emergency => emergency.status === EMERGENCY_STATUS.RESOLVED)
      .sort((a, b) => {
        const dateA = a.resolvedAt?.toDate ? a.resolvedAt.toDate() : new Date(a.resolvedAt || a.updatedAt);
        const dateB = b.resolvedAt?.toDate ? b.resolvedAt.toDate() : new Date(b.resolvedAt || b.updatedAt);
        return dateB - dateA;
      });

    switch (period) {
      case 'today':
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return resolvedEmergencies.filter(emergency => {
          const resolvedDate = emergency.resolvedAt?.toDate ? 
            emergency.resolvedAt.toDate() : 
            new Date(emergency.resolvedAt || emergency.updatedAt);
          return resolvedDate >= startOfToday;
        }).slice(0, 10);

      case 'last48':
        const last48Hours = new Date(now.getTime() - (48 * 60 * 60 * 1000));
        return resolvedEmergencies.filter(emergency => {
          const resolvedDate = emergency.resolvedAt?.toDate ? 
            emergency.resolvedAt.toDate() : 
            new Date(emergency.resolvedAt || emergency.updatedAt);
          return resolvedDate >= last48Hours;
        }).slice(0, 10);

      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return resolvedEmergencies.filter(emergency => {
          const resolvedDate = emergency.resolvedAt?.toDate ? 
            emergency.resolvedAt.toDate() : 
            new Date(emergency.resolvedAt || emergency.updatedAt);
          return resolvedDate >= startOfWeek;
        }).slice(0, 10);

      default:
        return resolvedEmergencies.slice(0, 10);
    }
  }, []);

  const getTimePeriodInfo = useCallback(() => {
    switch (timePeriod) {
      case 'today': return 'Resolved emergencies today';
      case 'last48': return 'Resolved emergencies in last 48 hours';
      case 'thisWeek': return 'Resolved emergencies this week';
      default: return 'Recent resolved emergencies';
    }
  }, [timePeriod]);

  useEffect(() => {
    if (emergencies.length > 0) {
      const filtered = filterEmergenciesByTimePeriod(emergencies, timePeriod);
      setFilteredEmergencies(filtered);
    }
  }, [timePeriod, emergencies, filterEmergenciesByTimePeriod]);

  return {
    timePeriod,
    setTimePeriod,
    filteredEmergencies,
    timePeriodInfo: getTimePeriodInfo()
  };
};