import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getEmergencies, 
  getEmergenciesByDepartment,
  getEmergenciesByUser,
  getMembersByDepartment,
  getTeamsByDepartment,
  getUserById
} from '@/services/firestore';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';

export const useDashboardData = () => {
  const { currentUser, isSuperAdmin, isAdmin, isResponder, department } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmergencies: 0,
    resolvedEmergencies: 0,
    activeResponders: 0,
    totalEmergenciesChange: 0,
    resolvedEmergenciesChange: 0,
    activeRespondersChange: 0
  });
  const [teamStats, setTeamStats] = useState([]);

  const enrichEmergenciesWithUserData = async (emergenciesData) => {
    try {
      const enrichedEmergencies = await Promise.all(
        emergenciesData.map(async (emergency) => {
          if (emergency.userInfo?.firstName && emergency.userInfo?.lastName) {
            return emergency;
          }
          
          if (emergency.userId && !emergency.userInfo?.firstName) {
            try {
              const userData = await getUserById(emergency.userId);
              if (userData) {
                return {
                  ...emergency,
                  userInfo: {
                    ...emergency.userInfo,
                    ...userData,
                    id: emergency.userId
                  }
                };
              }
            } catch (error) {
              console.warn(`Could not fetch user data for ${emergency.userId}:`, error);
            }
          }
          
          return emergency;
        })
      );
      
      return enrichedEmergencies;
    } catch (error) {
      console.error('Error enriching emergencies with user data:', error);
      return emergenciesData;
    }
  };

  // Use useCallback to memoize these functions
  const calculateStats = useCallback((emergenciesData, membersData, teamsData) => {
    const totalEmergencies = emergenciesData.length;
    const resolvedEmergencies = emergenciesData.filter(e => e.status === EMERGENCY_STATUS.RESOLVED).length;
    const activeResponders = membersData.filter(m => m.status !== 'inactive').length;

    return {
      totalEmergencies,
      resolvedEmergencies,
      activeResponders,
      totalEmergenciesChange: 12.3,
      resolvedEmergenciesChange: 73.1,
      activeRespondersChange: 96.3
    };
  }, []);

  const calculateTeamStats = useCallback((teamsData, emergenciesData, membersData) => {
    const calculateSuccessRate = (responded, resolved) => {
      if (responded === 0) return 0;
      return (resolved / responded) * 100;
    };

    const teamStatsData = teamsData.map(team => {
      const teamEmergencies = emergenciesData.filter(emergency => 
        emergency.assignedResponders?.some(responder => 
          responder.responderId === team.id || responder.teamName === team.teamName
        )
      );
      
      const responded = teamEmergencies.length;
      const resolved = teamEmergencies.filter(e => e.status === EMERGENCY_STATUS.RESOLVED).length;
      const successRate = calculateSuccessRate(responded, resolved);
      const teamLeader = membersData.find(member => member.id === team.leaderId);

      return {
        teamId: team.id,
        teamName: team.teamName || team.name,
        leaderId: team.leaderId,
        leaderData: teamLeader,
        memberCount: team.members?.length || team.memberIds?.length || 0,
        responded,
        resolved,
        successRate
      };
    });

    return teamStatsData.sort((a, b) => {
      if (b.resolved !== a.resolved) return b.resolved - a.resolved;
      return b.successRate - a.successRate;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        let emergenciesData = [];
        let membersData = [];
        let teamsData = [];
        
        if (isSuperAdmin) {
          emergenciesData = await getEmergencies();
        } else if (isAdmin && department) {
          emergenciesData = await getEmergenciesByDepartment(department);
        } else if (isResponder && department) {
          emergenciesData = await getEmergenciesByDepartment(department);
        } else if (currentUser) {
          emergenciesData = await getEmergenciesByUser(currentUser.uid);
        }
        
        emergenciesData = await enrichEmergenciesWithUserData(emergenciesData);
        
        if ((isAdmin || isSuperAdmin) && department) {
          membersData = await getMembersByDepartment(department);
          teamsData = await getTeamsByDepartment(department);
        } else if (isSuperAdmin) {
          const allMembers = await getMembersByDepartment();
          const allTeams = await getTeamsByDepartment();
          membersData = allMembers;
          teamsData = allTeams;
        }
        
        if (isMounted) {
          setEmergencies(emergenciesData);
          setMembers(membersData);
          setTeams(teamsData);
          
          // Calculate stats immediately after data is set
          const calculatedStats = calculateStats(emergenciesData, membersData, teamsData);
          setStats(calculatedStats);
          
          const teamStatsData = calculateTeamStats(teamsData, emergenciesData, membersData);
          setTeamStats(teamStatsData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data. You may not have sufficient permissions.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, isSuperAdmin, isAdmin, isResponder, department, calculateStats, calculateTeamStats]);

  return {
    emergencies,
    members,
    teams,
    stats,
    teamStats,
    loading,
    error
  };
};