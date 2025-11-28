import React from 'react';

export const TimePeriodToggle = ({ timePeriod, setTimePeriod }) => {
  const getButtonClass = (period) => {
    const baseClass = "btn btn-sm";
    return timePeriod === period 
      ? `${baseClass} btn-primary` 
      : `${baseClass} btn-outline-primary`;
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'last48', label: 'Last 48 hours' },
    { key: 'thisWeek', label: 'This Week' }
  ];

  return (
    <div className="btn-group" role="group">
      {periods.map((period) => (
        <button
          key={period.key}
          type="button"
          className={getButtonClass(period.key)}
          onClick={() => setTimePeriod(period.key)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};