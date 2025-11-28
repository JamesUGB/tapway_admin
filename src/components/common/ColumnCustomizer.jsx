// src/components/common/ColumnCustomizer.jsx
import React, { useState } from 'react';
import { Button, Dropdown, Form, Stack } from 'react-bootstrap';

const ColumnCustomizer = ({ 
  columns = [], 
  visibleColumns = [],
  onColumnsChange 
}) => {
  const [show, setShow] = useState(false);

  const handleColumnToggle = (columnKey, isVisible) => {
    if (isVisible) {
      // When showing, maintain original column order by filtering from full column list
      const newVisibleColumns = columns
        .map(col => col.key)
        .filter(key => key === columnKey || visibleColumns.includes(key));
      onColumnsChange(newVisibleColumns);
    } else {
      // When hiding, simply remove the column
      const newVisibleColumns = visibleColumns.filter(col => col !== columnKey);
      onColumnsChange(newVisibleColumns);
    }
  };

  const isColumnVisible = (columnKey) => visibleColumns.includes(columnKey);

  return (
    <Dropdown show={show} onToggle={setShow}>
      <Dropdown.Toggle 
        variant="outline-secondary" 
        size="sm"
        className="d-flex align-items-center gap-2"
      >
        <i className="bi bi-columns-gap"></i>
        Columns
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '250px' }}>
        <div className="p-3">
          <h6 className="mb-3">Customize Columns</h6>
          <Stack gap={2}>
            {columns.map(column => (
              <Form.Check
                key={column.key}
                type="checkbox"
                id={`column-${column.key}`}
                label={column.label}
                checked={isColumnVisible(column.key)}
                onChange={(e) => handleColumnToggle(column.key, e.target.checked)}
              />
            ))}
          </Stack>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ColumnCustomizer;