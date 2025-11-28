// src/components/common/DepartmentFilter.jsx
import React from 'react';
import { Form } from 'react-bootstrap';

const DepartmentFilter = ({
  filters = {},
  onFilterChange,
  departments = {},
  departmentLabels = {},
  showDepartmentFilter = true
}) => {
  if (!showDepartmentFilter) return null;

  return (
    <div className="d-flex align-items-center gap-2">
      <small className="text-muted fw-medium">Department:</small>
      <Form.Select
        size="sm"
        value={filters.department || "all"}
        onChange={(e) => onFilterChange("department", e.target.value)}
        style={{ width: "auto", minWidth: "150px" }}
      >
        <option value="all">All Departments</option>
        {Object.values(departments).map((dept) => (
          <option key={dept} value={dept}>
            {departmentLabels[dept]}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default DepartmentFilter;