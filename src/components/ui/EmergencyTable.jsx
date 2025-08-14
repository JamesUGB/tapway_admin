// src/components/ui/EmergencyTable.jsx
import { Table, Button, Badge, Stack } from 'react-bootstrap';
import { 
  EMERGENCY_STATUS, 
  EMERGENCY_STATUS_LABELS, 
  EMERGENCY_STATUS_COLORS 
} from '../../constants/emergencyStatus';
import { DEPARTMENT_LABELS } from '../../constants/departments';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatShortId, formatLocation } from '../../utils/format';

export default function EmergencyTable({
  emergencies,
  loading,
  error,
  lastDoc,
  onStatusChange,
  onLoadMore,
  changingStatusId,
  showDepartment = true,
  showActions = true
}) {
  const getAvailableStatusActions = (currentStatus) => {
    const actions = [];
    
    if (currentStatus === EMERGENCY_STATUS.PENDING) {
      actions.push(EMERGENCY_STATUS.ASSIGNED);
    }
    
    if (currentStatus === EMERGENCY_STATUS.ASSIGNED) {
      actions.push(EMERGENCY_STATUS.IN_PROGRESS);
      actions.push(EMERGENCY_STATUS.CANCELLED);
    }
    
    if (currentStatus === EMERGENCY_STATUS.IN_PROGRESS) {
      actions.push(EMERGENCY_STATUS.RESOLVED);
      actions.push(EMERGENCY_STATUS.CANCELLED);
    }
    
    return actions;
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading emergencies: {error.message}
      </div>
    );
  }

  if (loading && !emergencies.length) {
    return (
      <div className="text-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Description</th>
            {showDepartment && <th>Department</th>}
            <th>Location</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {emergencies.map(emergency => (
            <tr key={emergency.id}>
              <td>{formatShortId(emergency.id)}</td>
              <td>{emergency.emergencyType}</td>
              <td>{emergency.description || 'No description'}</td>
              {showDepartment && (
                <td>{DEPARTMENT_LABELS[emergency.department]}</td>
              )}
              <td>{formatLocation(emergency.location)}</td>
              <td>
                <Badge bg={EMERGENCY_STATUS_COLORS[emergency.status]}>
                  {EMERGENCY_STATUS_LABELS[emergency.status]}
                </Badge>
              </td>
              {showActions && (
                <td>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {getAvailableStatusActions(emergency.status).map(status => (
                      <Button
                        key={status}
                        variant="outline-primary"
                        size="sm"
                        disabled={changingStatusId === emergency.id}
                        onClick={() => onStatusChange(emergency.id, status)}
                      >
                        {changingStatusId === emergency.id ? (
                          'Processing...'
                        ) : (
                          `Mark as ${EMERGENCY_STATUS_LABELS[status]}`
                        )}
                      </Button>
                    ))}
                  </Stack>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      
      {lastDoc && (
        <div className="text-center mt-3">
          <Button 
            onClick={onLoadMore} 
            disabled={loading}
            variant="outline-primary"
          >
            {loading ? 'Loading...' : 'Load More Emergencies'}
          </Button>
        </div>
      )}
    </>
  );
}