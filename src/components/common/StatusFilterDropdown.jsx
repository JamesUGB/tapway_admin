// src/components/common/StatusFilterDropdown.jsx
import React from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';

// Remove the custom toggle and use the default Dropdown.Toggle
const StatusFilterDropdown = ({
  filters = {},
  onFilterChange,
  statusConfig = {},
  getStatusCount,
  getTotalCount
}) => {
  const { 
    EMERGENCY_STATUS, 
    EMERGENCY_STATUS_LABELS, 
    EMERGENCY_STATUS_COLORS,
    EMERGENCY_STATUS_ICONS 
  } = statusConfig;

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="outline-primary" 
        size="sm"
        className="d-flex align-items-center gap-2"
      >
        <i className="bi bi-filter"></i>
        Status
        {filters.status && (
          <Badge
            bg="primary"
            pill
            className="ms-1"
            style={{ fontSize: "0.6rem", lineHeight: 1 }}
          >
            1
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span>Filter by Status</span>
          {filters.status && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              onClick={() => onFilterChange("status", null)}
            >
              Clear
            </Button>
          )}
        </Dropdown.Header>

        <Dropdown.Divider />

        <Dropdown.Item
          onClick={() => onFilterChange("status", null)}
          className={`d-flex justify-content-between align-items-center ${
            !filters.status ? "active" : ""
          }`}
        >
          <span>All Statuses</span>
          <Badge bg="secondary" pill>
            {getTotalCount()}
          </Badge>
        </Dropdown.Item>

        <Dropdown.Divider />

        {Object.values(EMERGENCY_STATUS).map((status) => {
          const count = getStatusCount(status);
          return (
            <Dropdown.Item
              key={status}
              onClick={() => onFilterChange("status", status)}
              disabled={count === 0}
              className={`d-flex justify-content-between align-items-center ${
                filters.status === status ? "active" : ""
              }`}
            >
              <span className="d-flex align-items-center gap-2">
                <i className={EMERGENCY_STATUS_ICONS[status]} style={{ width: '16px' }}></i>
                {EMERGENCY_STATUS_LABELS[status]}
              </span>
              <Badge
                bg={count === 0 ? "light" : "secondary"}
                text={count === 0 ? "muted" : "white"}
                pill
              >
                {count}
              </Badge>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default StatusFilterDropdown;