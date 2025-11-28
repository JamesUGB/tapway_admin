// src/components/ui/EmergencyTable.jsx
import { Table, Button, Badge, Dropdown, Stack, Form, Row, Col } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import CustomToggle from '../common/CustomToggle';
import StableTooltip from '../common/Tooltip';
import TeamAssignmentDrawer from './TeamAssignmentDrawer';
import StatusBadge from '../common/StatusBadge';
import {
  EMERGENCY_STATUS,
  EMERGENCY_STATUS_LABELS,
  EMERGENCY_STATUS_COLORS,
  EMERGENCY_ACTION_LABELS
} from '../../constants/emergencyStatus';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '../../constants/departments';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  formatShortId,
  formatLocation,
  formatDateTime,
  formatDateTimeRelative,
  formatRespondersList,
  formatCitizenInfo,
  getResolvedAt
} from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import UserHoverCard from '../common/UserHoverCard';
import PaginationControl from '../common/PaginationControl';

// Column configuration
const COLUMN_CONFIG = [
  { key: 'id', label: 'Emergency ID', width: '120px' },
  { key: 'citizen', label: 'Citizen Info', width: '150px' },
  // { key: 'department', label: 'Department', width: '130px' },
  { key: 'createdAt', label: 'Created At', width: '140px' },
  { key: 'location', label: 'Location', width: '180px' },
  { key: 'responders', label: 'Responders', width: '160px' },
  { key: 'resolvedAt', label: 'Resolved At', width: '140px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Actions', width: '100px' }
];

export default function EmergencyTable({
  emergencies,
  loading,
  error,
  lastDoc,
  onStatusChange,
  onLoadMore,
  changingStatusId,
  showDepartment = true,
  showActions = true,
  // Remove these filter-related props:
  // filters = {},
  // onFilterChange,
  // onClearFilters,
  // activeFilterCount = 0,
  // showFilters = false,
  userRole = null,
  departmentFilter = null,
  visibleColumns = [],
  onColumnsChange
}) {
  const { userData } = useAuth();

  // State hooks
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [selectedEmergencies, setSelectedEmergencies] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Initialize visible columns if not provided
  useEffect(() => {
    if (visibleColumns.length === 0) {
      const defaultColumns = COLUMN_CONFIG.map(col => col.key)
        .filter(key => {
          if (key === 'department' && !showDepartment) return false;
          if (key === 'actions' && !showActions) return false;
          return true;
        });
      onColumnsChange?.(defaultColumns);
    }
  }, [showDepartment, showActions, visibleColumns.length, onColumnsChange]);

  // Checkbox handlers
  const handleSelectEmergency = (emergencyId) => {
    setSelectedEmergencies(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(emergencyId)) {
        newSelected.delete(emergencyId);
      } else {
        newSelected.add(emergencyId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedEmergencies.size === paginatedEmergencies.length) {
      setSelectedEmergencies(new Set());
    } else {
      const allIds = paginatedEmergencies.map(emergency => emergency.id);
      setSelectedEmergencies(new Set(allIds));
    }
  };

  // Calculate paginated data
  const getPaginatedEmergencies = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return emergencies.slice(startIndex, endIndex);
  };

  // Reset to page 1 when emergencies array changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedEmergencies(new Set());
  }, [emergencies]);

  const paginatedEmergencies = getPaginatedEmergencies();
  const totalPages = Math.ceil(emergencies.length / pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleTeamAssigned = async (emergencyId, teamData) => {
    if (onStatusChange) {
      console.log(`Team ${teamData.teamName} assigned to emergency ${emergencyId}`);
    }
  };

  const getAvailableStatusActions = (currentStatus, emergency) => {
    const actions = [];

    if (
      !userData ||
      ![
        'super_admin',
        'fire_admin',
        'police_admin',
        'medical_admin',
        'fire_responder',
        'police_responder',
        'medical_responder'
      ].includes(userData.role)
    ) {
      return actions;
    }

    if (currentStatus === EMERGENCY_STATUS.PENDING) {
      actions.push({
        type: 'assign_team',
        label: 'Assign Team',
        status: EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS
      });
    }

    if (currentStatus === EMERGENCY_STATUS.ASSIGNED_IN_PROGRESS) {
      actions.push({
        type: 'status_change',
        label: EMERGENCY_ACTION_LABELS[EMERGENCY_STATUS.RESOLVED],
        status: EMERGENCY_STATUS.RESOLVED
      });
      actions.push({
        type: 'status_change',
        label: EMERGENCY_ACTION_LABELS[EMERGENCY_STATUS.CANCELLED],
        status: EMERGENCY_STATUS.CANCELLED
      });
    }

    return actions;
  };

  const handleActionClick = (emergency, action) => {
    if (action.type === 'assign_team') {
      setSelectedEmergency(emergency);
      setShowTeamDrawer(true);
    } else if (action.type === 'status_change') {
      onStatusChange(emergency.id, action.status);
    }
  };

  // const handleFilterChange = (key, value) => {
  //   if (onFilterChange) {
  //     onFilterChange(key, value === 'all' ? null : value);
  //   }
  // };

  // Filter available columns based on permissions
  const availableColumns = COLUMN_CONFIG.filter(col => {
    if (col.key === 'department' && !showDepartment) return false;
    if (col.key === 'actions' && !showActions) return false;
    return true;
  });

  // Helper functions
  // const showDepartmentFilter = userRole === 'super_admin' && !departmentFilter;
  const getStatusCount = (status) => emergencies.filter(emergency => emergency.status === status).length;
  const getTotalCount = () => emergencies.length;

  // Status config for StatusFilterDropdown
  const statusConfig = {
    EMERGENCY_STATUS,
    EMERGENCY_STATUS_LABELS,
    EMERGENCY_STATUS_COLORS
  };

  // Render table header cell based on column key
  const renderHeaderCell = (columnKey) => {
    switch (columnKey) {
      case 'id':
        return <th style={{ whiteSpace: "nowrap", width: "120px" }}>Emergency ID</th>;
      
      case 'citizen':
        return <th style={{ whiteSpace: "nowrap", width: "150px" }}>Citizen Info</th>;
      
      case 'createdAt':
        return <th style={{ whiteSpace: "nowrap", width: "140px" }}>Created At</th>;
      
      case 'location':
        return <th style={{ whiteSpace: "nowrap", width: "180px" }}>Location</th>;
      
      case 'responders':
        return <th style={{ whiteSpace: "nowrap", width: "160px" }}>Responders</th>;
      
      case 'resolvedAt':
        return <th style={{ whiteSpace: "nowrap", width: "140px" }}>Resolved At</th>;
      
      case 'status':
        return (
          <th style={{ whiteSpace: "nowrap", width: "120px" }}>
            Status {/* Just plain text now */}
          </th>
        );
      
      case 'actions':
        return <th style={{ whiteSpace: "nowrap", width: "100px" }}>Actions</th>;
      
      default:
        return null;
    }
  };

  // Render table body cell based on column key
  const renderBodyCell = (emergency, columnKey) => {
    const userId = emergency.userId || emergency.userInfo?.id;
    const availableActions = getAvailableStatusActions(emergency.status, emergency);

    switch (columnKey) {
      case 'id':
        return (
          <td>
            <StableTooltip content={emergency.id}>
              <span style={{ whiteSpace: "nowrap" }}>
                {formatShortId(emergency.id)}
              </span>
            </StableTooltip>
          </td>
        );
      
      case 'citizen':
        return (
          <td>
            {userId ? (
              <UserHoverCard userId={userId}>
                <span
                  className="text-truncate d-inline-block"
                  style={{ maxWidth: "140px", cursor: "pointer" }}
                >
                  {formatCitizenInfo(emergency)}
                </span>
              </UserHoverCard>
            ) : (
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "140px" }}
              >
                {formatCitizenInfo(emergency)}
              </span>
            )}
          </td>
        );
      
      case 'department':
        return (
          <td>
            <span
              className="text-truncate d-inline-block"
              style={{ maxWidth: "120px" }}
            >
              {DEPARTMENT_LABELS[emergency.department]}
            </span>
          </td>
        );
      
      case 'createdAt':
        return (
          <td>
            <StableTooltip content={formatDateTime(emergency.createdAt)}>
              <span style={{ whiteSpace: "nowrap" }}>
                {formatDateTimeRelative(emergency.createdAt)}
              </span>
            </StableTooltip>
          </td>
        );
      
      case 'location':
        return (
          <td>
            <StableTooltip content={formatLocation(emergency.location)}>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "170px" }}
              >
                {formatLocation(emergency.location)}
              </span>
            </StableTooltip>
          </td>
        );
      
      case 'responders':
        return (
          <td>
            <span
              className="text-truncate d-inline-block"
              style={{ maxWidth: "150px" }}
            >
              {formatRespondersList(emergency.assignedResponders) || "-"}
            </span>
          </td>
        );
      
      case 'resolvedAt':
        return (
          <td>
            <span style={{ whiteSpace: "nowrap" }}>
              {formatDateTime(getResolvedAt(emergency)) || "-"}
            </span>
          </td>
        );
      
      case 'status':
        return (
   <td>
      <StatusBadge status={emergency.status} />
    </td>
        );
      
      case 'actions':
        return (
          <td>
            {availableActions.length > 0 ? (
              <Dropdown>
                <Dropdown.Toggle
                  as={CustomToggle}
                  disabled={changingStatusId === emergency.id}
                >
                  {changingStatusId === emergency.id
                    ? "Processing..."
                    : "•••"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {availableActions.map((action, idx) => (
                    <Dropdown.Item
                      key={idx}
                      onClick={() => handleActionClick(emergency, action)}
                      disabled={changingStatusId === emergency.id}
                    >
                      {action.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <span className="text-muted">-</span>
            )}
          </td>
        );
      
      default:
        return null;
    }
  };

  if (error) {
    return <div className="alert alert-danger">Error loading emergencies: {error.message}</div>;
  }

  if (loading && !emergencies.length) {
    return (
      <div className="text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!emergencies.length && !loading) {
    return <div className="alert alert-info text-center">No emergencies found for your department and access level.</div>;
  }

  return (
    <>
      {/* {showFilters && (
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <DepartmentFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  departments={DEPARTMENTS}
                  departmentLabels={DEPARTMENT_LABELS}
                  showDepartmentFilter={showDepartmentFilter}
                />
                
                <GlobalFilterButton
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={onClearFilters}
                  filterCount={activeFilterCount}
                />
              </div>

              <div className="d-flex align-items-center gap-2">
                <ColumnCustomizer
                  columns={availableColumns}
                  visibleColumns={visibleColumns}
                  onColumnsChange={onColumnsChange}
                />
              </div>
            </div>
          </Col>
        </Row>
      )} */}

      {selectedEmergencies.size > 0 && (
        <div className="mb-3 p-2 bg-light rounded">
          <small className="text-muted">
            {selectedEmergencies.size} emergency(ies) selected
          </small>
        </div>
      )}

      <div
        className="table-responsive"
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          minHeight: "500px"
        }}
      >
        <Table className="table table-hover no-vertical-borders table-sm">
          <thead>
            <tr className="align-middle">
              <th style={{ width: "40px" }}>
                <Form.Check
                  type="checkbox"
                  checked={
                    selectedEmergencies.size > 0 &&
                    selectedEmergencies.size === paginatedEmergencies.length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              {visibleColumns.map(columnKey => (
                <React.Fragment key={columnKey}>
                  {renderHeaderCell(columnKey)}
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedEmergencies.map((emergency) => (
              <tr key={emergency.id} className="align-middle">
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedEmergencies.has(emergency.id)}
                    onChange={() => handleSelectEmergency(emergency.id)}
                  />
                </td>

                {visibleColumns.map(columnKey => (
                  <React.Fragment key={columnKey}>
                    {renderBodyCell(emergency, columnKey)}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <TeamAssignmentDrawer
        show={showTeamDrawer}
        onHide={() => {
          setShowTeamDrawer(false);
          setSelectedEmergency(null);
        }}
        emergency={selectedEmergency}
        onTeamAssigned={handleTeamAssigned}
      />

      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={emergencies.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}