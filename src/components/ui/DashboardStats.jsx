import React from 'react';

const StatCard = ({ title, value, change, description, variant = 'success' }) => {
  const colorClass = variant === 'danger' ? 'text-danger' : 'text-success';
  
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <h3 className="fw-bold mb-1">{value}</h3>
            <div>
              <small className="text-muted">{description}</small>
            </div>
          </div>
          <small className={`${colorClass} text-nowrap`}>
            ↝ {change}%
          </small>
        </div>
      </div>
    </div>
  );
};

export const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      title: 'Total Emergencies',
      value: stats.totalEmergencies,
      change: stats.totalEmergenciesChange,
      description: 'All time emergencies',
      variant: 'danger' // Add this line
    },
    {
      title: 'Resolved Emergencies',
      value: stats.resolvedEmergencies,
      change: stats.resolvedEmergenciesChange,
      description: 'Successfully resolved'
      // variant defaults to 'success'
    },
    {
      title: 'Active Responders',
      value: stats.activeResponders,
      change: stats.activeRespondersChange,
      description: 'Active Responders account'
      // variant defaults to 'success'
    }
  ];

  return (
    <div className="row mb-4">
      {statItems.map((item, index) => (
        <div key={index} className="col-md-4 mb-3">
          <StatCard {...item} />
        </div>
      ))}
    </div>
  );
};