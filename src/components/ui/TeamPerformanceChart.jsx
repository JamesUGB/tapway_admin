import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ProfileBadge from '@/components/common/ProfileBadge';
import UserHoverCard from '@/components/common/UserHoverCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EnhancedTeamLeader = ({ team }) => {
  if (!team.leaderData) {
    return <span className="text-muted">N/A</span>;
  }

  return (
    <UserHoverCard 
      userId={team.leaderId} 
      memberData={team.leaderData}
      mode="team-management"
    >
      <div style={{ cursor: 'pointer' }}>
        <ProfileBadge 
          firstName={team.leaderData.firstName} 
          lastName={team.leaderData.lastName}
          size="sm"
          showName={false}
        />
      </div>
    </UserHoverCard>
  );
};

const formatSuccessRate = (successRate) => {
  const rate = parseFloat(successRate.toFixed(2));
  let arrow = '↝';
  if (rate >= 80) arrow = '↝';
  else if (rate >= 50) arrow = '↝';  
  else arrow = '↘';
  return `${arrow}${rate}%`;
};

export const TeamPerformanceChart = ({ teamStats }) => {
  const topTeams = teamStats.slice(0, 3);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0">Team Distribution</h5>
      </div>
      <div className="card-body">
        {teamStats.length > 0 ? (
          <>
            <div className="text-center mb-4" style={{ height: '250px', minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="memberCount"
                    nameKey="teamName"
                    // label={({ teamName, memberCount }) => `${teamName}: ${memberCount}`}
                  >
                    {teamStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <h6 className="text-muted mb-3">Top Team Performance</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th className="text-center">Top</th>
                      <th>Team Leader</th>
                      <th className="text-center">Responded</th>
                      <th className="text-center">Resolved</th>
                      <th className="text-center">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTeams.map((team, index) => (
                      <tr key={team.teamId}>
                        <td className="text-center fw-bold">{index + 1}</td>
                        <td><EnhancedTeamLeader team={team} /></td>
                        <td className="text-center">
                          <span className="badge bg-primary">{team.responded}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-success">{team.resolved}</span>
                        </td>
                        <td className="text-center fw-medium">
                          {formatSuccessRate(team.successRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-chart-pie fs-1 text-muted mb-2"></i>
            <p className="text-muted">No team data available</p>
          </div>
        )}
      </div>
    </div>
  );
};