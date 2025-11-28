// src/components/common/GlobalFilterButton.jsx
import React, { useState } from 'react';
import { Button, Badge, Dropdown, Form } from 'react-bootstrap';
import CustomToggle from './CustomToggle';

const GlobalFilterButton = ({ 
  filters = {}, 
  onFilterChange, 
  onClearFilters,
  filterCount = 0 
}) => {
  const [show, setShow] = useState(false);

  return (
    <Dropdown show={show} onToggle={setShow}>
      <Dropdown.Toggle as={CustomToggle}>
        <Button 
          variant="outline-primary" 
          size="sm"
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-funnel"></i>
          Filters
          {filterCount > 0 && (
            <Badge bg="primary" pill className="ms-1">
              {filterCount}
            </Badge>
          )}
        </Button>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '280px' }}>
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Active Filters</h6>
            {filterCount > 0 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger text-decoration-none"
                onClick={onClearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
          
          {filterCount === 0 ? (
            <p className="text-muted small mb-0">No active filters</p>
          ) : (
            <div className="small">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                
                let filterText = '';
                switch (key) {
                  case 'status':
                    filterText = `Status: ${value}`;
                    break;
                  case 'department':
                    filterText = `Department: ${value}`;
                    break;
                  default:
                    filterText = `${key}: ${value}`;
                }
                
                return (
                  <div key={key} className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-truncate">{filterText}</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-danger"
                      onClick={() => onFilterChange(key, null)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GlobalFilterButton;