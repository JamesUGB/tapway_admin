// src/pages/EmergenciesPage.jsx
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRoleBasedEmergencies } from '@/hooks/useRoleBasedEmergencies';
import { 
  EMERGENCY_STATUS, 
  EMERGENCY_STATUS_LABELS,
  EMERGENCY_STATUS_COLORS,
  EMERGENCY_STATUS_ICONS // ADD THIS IMPORT
} from '@/constants/emergencyStatus';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '@/constants/departments';
import { useAuth } from '@/context/AuthContext';
import { isResponderRole } from '@/constants/roles';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import EmergencyTable from '@/components/ui/EmergencyTable';

// UNCOMMENT THESE IMPORTS:
import StatusFilterDropdown from '@/components/common/StatusFilterDropdown';
import ColumnCustomizer from '@/components/common/ColumnCustomizer';

export default function EmergenciesPage() {
  const [searchParams] = useSearchParams();
  const { userData } = useAuth();
  const userRole = userData?.role;
  const departmentFilter = searchParams.get('department');

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState([
    'id',
    'citizen',
    // 'department',
    'createdAt',
    'location',
    'responders',
    'resolvedAt',
    'status',
    'actions'
  ]);

  const {
    emergencies,
    loading,
    error,
    lastDoc,
    filters,
    setFilters,
    fetchMore,
    changeStatus,
    refreshAll
  } = useRoleBasedEmergencies({
    department: departmentFilter || null,
    limitCount: 20
  });

  const [changingStatusId, setChangingStatusId] = useState(null);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== null && value !== '').length;
  }, [filters]);

  const handleStatusChange = async (emergencyId, newStatus) => {
    setChangingStatusId(emergencyId);
    
    await changeStatus(
      emergencyId, 
      newStatus,
      userData.id,
      isResponderRole(userRole) ? userData.uid : null,
      `Status changed to ${newStatus} by ${userData.name}`
    );
    
    setChangingStatusId(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: null,
      department: null
    });
  };

  const handleColumnsChange = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
  };

  // Don't show department filter for non-super admins
  const showDepartmentFilter = userRole === 'super_admin' && !departmentFilter;

return (
    <div 
      className="d-flex" 
      style={{ 
        minHeight: '100vh', 
        overflow: 'hidden', 
        backgroundColor: '#f8f8f8ff' 
        }}
      >
      {/* Sidebar */}
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Navbar scrolls with content but doesn't shrink */}
        <div style={{ flexShrink: 0 }}>
          <Navbar />
        </div>

        {/* Page content */}
        <main className="container-fluid p-4">
          {/* MOVE BOTH THE TITLE AND BUTTONS INTO THE SAME FLEX CONTAINER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Title on the left */}
            <h1 className="mb-0">
              {departmentFilter
                ? `${DEPARTMENT_LABELS[departmentFilter]} Emergencies`
                : userRole === 'super_admin'
                ? 'All Emergencies'
                : `${DEPARTMENT_LABELS[userData?.department]} Emergencies`}
            </h1>

            {/* Buttons on the right */}
            <div className="d-flex align-items-center gap-2">
              {/* Status Filter Dropdown */}
              <StatusFilterDropdown
                filters={filters}
                onFilterChange={handleFilterChange}
                statusConfig={{
                  EMERGENCY_STATUS,
                  EMERGENCY_STATUS_LABELS,
                  EMERGENCY_STATUS_COLORS,
                  EMERGENCY_STATUS_ICONS // Now this is defined
                }}
                getStatusCount={(status) => emergencies.filter(emergency => emergency.status === status).length}
                getTotalCount={() => emergencies.length}
              />
              
              {/* Column Customizer */}
              <ColumnCustomizer
                columns={[
                  { key: 'id', label: 'Emergency ID' },
                  { key: 'citizen', label: 'Citizen Info' },
                  { key: 'createdAt', label: 'Created At' },
                  { key: 'location', label: 'Location' },
                  { key: 'responders', label: 'Responders' },
                  { key: 'resolvedAt', label: 'Resolved At' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                visibleColumns={visibleColumns}
                onColumnsChange={handleColumnsChange}
              />
            </div>
          </div>

          <EmergencyTable
            emergencies={emergencies}
            loading={loading}
            error={error}
            lastDoc={lastDoc}
            onStatusChange={handleStatusChange}
            onLoadMore={fetchMore}
            changingStatusId={changingStatusId}
            showActions={userRole !== 'citizen'}
            showFilters={false}
            userRole={userRole}
            departmentFilter={departmentFilter}
            visibleColumns={visibleColumns}
            onColumnsChange={handleColumnsChange}
          />
        </main>
      </div>
    </div>
  );
}