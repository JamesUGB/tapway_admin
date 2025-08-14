import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Stack } from 'react-bootstrap';
import { useEmergencies } from '@/hooks/useEmergencies';
import { 
  EMERGENCY_STATUS, 
  EMERGENCY_STATUS_LABELS 
} from '@/constants/emergencyStatus';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '@/constants/departments';
import useAuth from '@/hooks/useAuth';
import { isResponderRole } from '@/constants/roles';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import EmergencyTable from '@/components/ui/EmergencyTable';

export default function EmergenciesPage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;
  const departmentFilter = searchParams.get('department');

  const {
    emergencies,
    loading,
    error,
    lastDoc,
    filters,
    setFilters,
    fetchMore,
    changeStatus
  } = useEmergencies({
    department: departmentFilter || null,
    limitCount: 20
  });

  const [changingStatusId, setChangingStatusId] = useState(null);

  const handleStatusChange = async (emergencyId, newStatus) => {
    setChangingStatusId(emergencyId);
    await changeStatus(
      emergencyId, 
      newStatus,
      isResponderRole(userRole) ? currentUser.uid : 'admin'
    );
    setChangingStatusId(null);
  };

  const handleStatusFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: status === prev.status ? null : status
    }));
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              {departmentFilter 
                ? `${DEPARTMENT_LABELS[departmentFilter]} Emergencies`
                : 'All Emergencies'}
            </h1>
            
            <Stack direction="horizontal" gap={2} className="flex-wrap">
              {Object.values(EMERGENCY_STATUS).map(status => (
                <Button
                  key={status}
                  variant={filters.status === status ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleStatusFilterChange(status)}
                >
                  {EMERGENCY_STATUS_LABELS[status]}
                </Button>
              ))}
              <Button
                variant={!filters.status ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleStatusFilterChange(null)}
              >
                All Statuses
              </Button>
            </Stack>
          </div>

          <EmergencyTable
            emergencies={emergencies}
            loading={loading}
            error={error}
            lastDoc={lastDoc}
            onStatusChange={handleStatusChange}
            onLoadMore={fetchMore}
            changingStatusId={changingStatusId}
            showDepartment={!departmentFilter}
          />
        </main>
      </div>
    </div>
  );
}