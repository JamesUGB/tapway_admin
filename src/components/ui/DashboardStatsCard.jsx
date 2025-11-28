import React from 'react';

const DashboardStatsCard = ({ 
  title, 
  value, 
  icon, 
  variant = 'primary', 
  description = '',
  changePercentage = null,
  changeType = 'positive', // 'positive', 'negative', or 'neutral'
  alert = false,
  compact = false,
  className = ''
}) => {
  // Variant color mappings
  const variantConfig = {
    primary: {
      bg: 'bg-primary',
      text: 'text-white',
      light: 'bg-primary-subtle',
      change: 'text-primary'
    },
    secondary: {
      bg: 'bg-secondary',
      text: 'text-white',
      light: 'bg-secondary-subtle',
      change: 'text-secondary'
    },
    success: {
      bg: 'bg-success',
      text: 'text-white',
      light: 'bg-success-subtle',
      change: 'text-success'
    },
    danger: {
      bg: 'bg-danger',
      text: 'text-white',
      light: 'bg-danger-subtle',
      change: 'text-danger'
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-dark',
      light: 'bg-warning-subtle',
      change: 'text-warning'
    },
    info: {
      bg: 'bg-info',
      text: 'text-dark',
      light: 'bg-info-subtle',
      change: 'text-info'
    },
    light: {
      bg: 'bg-light',
      text: 'text-dark',
      light: 'bg-light',
      change: 'text-muted'
    },
    dark: {
      bg: 'bg-dark',
      text: 'text-white',
      light: 'bg-dark-subtle',
      change: 'text-dark'
    }
  };

  const config = variantConfig[variant] || variantConfig.primary;

  // Change indicator configuration
  const changeConfig = {
    positive: {
      color: 'text-success',
      icon: 'fas fa-arrow-up',
      label: 'increase'
    },
    negative: {
      color: 'text-danger', 
      icon: 'fas fa-arrow-down',
      label: 'decrease'
    },
    neutral: {
      color: 'text-muted',
      icon: 'fas fa-minus',
      label: 'no change'
    }
  };

  const change = changeConfig[changeType] || changeConfig.neutral;

  if (compact) {
    return (
      <div className={`card border-0 shadow-sm h-100 ${alert ? 'border-warning border-2' : ''} ${className}`}>
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="flex-grow-1">
              <h6 className="card-title text-muted mb-1 small">{title}</h6>
              <div className="d-flex align-items-baseline gap-2">
                <h4 className="fw-bold mb-0">{value}</h4>
                {changePercentage !== null && (
                  <small className={`${change.color} fw-medium`}>
                    <i className={`${change.icon} me-1`}></i>
                    {changePercentage}%
                  </small>
                )}
              </div>
              {description && (
                <small className="text-muted">{description}</small>
              )}
            </div>
            <div className={`p-2 rounded ${config.bg} ${config.text}`}>
              <i className={`${icon} fs-6`}></i>
            </div>
          </div>
          {alert && (
            <div className="mt-2">
              <span className="badge bg-warning text-dark small">
                <i className="fas fa-exclamation-circle me-1"></i>
                Requires Attention
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`card border-0 shadow-sm h-100 ${alert ? 'border-warning border-2' : ''} ${className}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <h3 className="fw-bold mb-0">{value}</h3>
              {changePercentage !== null && (
                <small className={`${change.color} fw-medium`}>
                  <i className={`${change.icon} me-1`}></i>
                  {changePercentage}%
                </small>
              )}
            </div>
            {description && (
              <small className="text-muted">{description}</small>
            )}
          </div>
          <div className={`p-3 rounded ${config.bg} ${config.text}`}>
            <i className={`${icon} fs-4`}></i>
          </div>
        </div>
        {alert && (
          <div className="mt-2">
            <span className="badge bg-warning text-dark">
              <i className="fas fa-exclamation-circle me-1"></i>
              Requires Attention
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Prop types for better development experience
DashboardStatsCard.defaultProps = {
  variant: 'primary',
  changeType: 'positive',
  alert: false,
  compact: false
};

export default DashboardStatsCard;