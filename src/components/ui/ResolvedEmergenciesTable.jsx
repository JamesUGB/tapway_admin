import React from 'react';
import ProfileBadge from '@/components/common/ProfileBadge';
import UserHoverCard from '@/components/common/UserHoverCard';
import { formatCitizenInfo, formatLocation, formatPhoneNumber } from '@/utils/format';

const EnhancedCitizenInfo = ({ emergency }) => {
  const userId = emergency.userId || emergency.userInfo?.id;
  const citizenInfo = formatCitizenInfo(emergency);
  const phoneNumber = emergency.userInfo?.phone || emergency.userPhone || emergency.userInfo?.phoneNumber || 'N/A';

  return (
    <div className="d-flex align-items-center">
      <ProfileBadge 
        firstName={emergency.userInfo?.firstName} 
        lastName={emergency.userInfo?.lastName}
        size="sm"
      />
      <div className="ms-2">
        {userId ? (
          <UserHoverCard userId={userId}>
            <div style={{ cursor: 'pointer' }}>
              <div className="fw-medium text-primary">
                {citizenInfo}
              </div>
              <small className="text-muted d-block">
                {formatPhoneNumber(phoneNumber)}
              </small>
            </div>
          </UserHoverCard>
        ) : (
          <div>
            <div className="fw-medium">
              {citizenInfo}
            </div>
            <small className="text-muted">
              {formatPhoneNumber(phoneNumber)}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResolvedEmergenciesTable = ({ 
  emergencies, 
  timePeriodInfo, 
  calculateResponseTime,
  showCount = true 
}) => {
  const displayEmergencies = emergencies.slice(0, 10);

  return (
    <div className="card border-0 shadow-sm">
      {/* <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start">
        <div className="d-flex flex-column">
          <h5 className="mb-1">Recent Resolved Emergencies</h5>
          <small className="text-muted mt-1">
            {timePeriodInfo} 
            {showCount && ` • Showing ${Math.min(emergencies.length, 10)} of ${emergencies.length} results`}
          </small>
        </div>
      </div> */}

      <div className="card-body p-0">
        {displayEmergencies.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Citizen Info</th>
                  <th className="border-0">Location</th>
                  <th className="border-0">Responders</th>
                  <th className="border-0">Status</th>
                  <th className="border-0">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {displayEmergencies.map(emergency => (
                  <tr key={emergency.id}>
                    <td>
                      <EnhancedCitizenInfo emergency={emergency} />
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={formatLocation(emergency.location)}>
                        {formatLocation(emergency.location)}
                      </div>
                    </td>
                    <td>
                      {emergency.assignedResponders?.length > 0 ? (
                        <small>
                          {emergency.assignedResponders[0].teamName || 'Team Assigned'}
                        </small>
                      ) : (
                        <small className="text-muted">No responders</small>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-success">Resolved</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {calculateResponseTime(emergency)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-inbox fs-1 text-muted mb-2"></i>
            <p className="text-muted">
              No resolved emergencies found for {timePeriodInfo.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};