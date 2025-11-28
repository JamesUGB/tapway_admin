import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import Drawer from '@/components/common/Drawer';
import { useRoles } from '@/hooks/useRoles';
import { dutyStatuses } from '@/constants/roles';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EditMemberDrawer({
  show,
  onHide,
  member,
  onSave,
  loading,
  editableFields = ['personnelPosition', 'dutyStatus']
}) {
  const [formData, setFormData] = useState({
    personnelPosition: '',
    dutyStatus: ''
  });
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  // Use the roles hook to get all available positions
  const { roles, loading: rolesLoading } = useRoles();

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        personnelPosition: member.personnelPosition || '',
        dutyStatus: member.dutyStatus || ''
      });
    }
  }, [member]);

  // Get unique personnel positions from roles (both default and custom)
  const availablePositions = React.useMemo(() => {
    if (!roles || roles.length === 0) return [];
    
    // Extract unique role names and sort them
    const uniquePositions = [...new Set(roles.map(role => role.name))];
    
    // Convert to the format expected by the dropdown
    return uniquePositions.map(position => ({
      value: position,
      label: position
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [roles]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    // Validate required fields
    const newErrors = {};
    if (editableFields.includes('personnelPosition') && !formData.personnelPosition) {
      newErrors.personnelPosition = 'Personnel position is required';
    }
    if (editableFields.includes('dutyStatus') && !formData.dutyStatus) {
      newErrors.dutyStatus = 'Duty status is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes');
    }
  };

  const getDutyStatusBadge = (status) => {
    switch (status) {
      case 'On Duty':
        return 'success';
      case 'Off Duty':
        return 'secondary';
      case 'On Leave':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getAccountStatusBadge = (status) => {
    return status === 'active' ? 'success' : 'secondary';
  };

  // Show loading spinner while roles are loading
  if (rolesLoading) {
    return (
      <Drawer show={show} onHide={onHide} title="Edit Member" size="md">
        <LoadingSpinner />
      </Drawer>
    );
  }

  return (
    <Drawer
      show={show}
      onHide={onHide}
      title={member ? `Edit ${member.firstName} ${member.lastName}` : 'Edit Member'}
      size="md"
    >
      {member && (
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-3">Current Information</h6>
          <Row className="mb-2">
            <Col sm={4}><strong>Full Name:</strong></Col>
            <Col sm={8}>{member.firstName} {member.middleName ? `${member.middleName.charAt(0)}. ` : ''}{member.lastName}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Employee ID:</strong></Col>
            <Col sm={8}>{member.employeeId || 'N/A'}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Account Status:</strong></Col>
            <Col sm={8}>
              <Badge bg={getAccountStatusBadge(member.status)}>
                {member.status || 'inactive'}
              </Badge>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Current Position:</strong></Col>
            <Col sm={8}>
              <Badge bg="info">
                {member.personnelPosition || 'Not assigned'}
              </Badge>
            </Col>
          </Row>
          <Row>
            <Col sm={4}><strong>Current Duty Status:</strong></Col>
            <Col sm={8}>
              <Badge bg={getDutyStatusBadge(member.dutyStatus)}>
                {member.dutyStatus || 'Off Duty'}
              </Badge>
            </Col>
          </Row>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        {saveError && (
          <Alert variant="danger" className="mb-3">
            {saveError}
          </Alert>
        )}

        {editableFields.includes('personnelPosition') && (
          <Form.Group className="mb-3">
            <Form.Label>
              Personnel Position 
              <span className="text-muted small ms-1">
                ({availablePositions.length} available roles)
              </span>
            </Form.Label>
            <Form.Select
              value={formData.personnelPosition}
              onChange={(e) => handleChange('personnelPosition', e.target.value)}
              isInvalid={!!errors.personnelPosition}
            >
              <option value="">Select Position</option>
              {availablePositions.map(position => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Includes both default and custom roles
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.personnelPosition}
            </Form.Control.Feedback>
          </Form.Group>
        )}

        {editableFields.includes('dutyStatus') && (
          <Form.Group className="mb-4">
            <Form.Label>Duty Status</Form.Label>
            <Form.Select
              value={formData.dutyStatus}
              onChange={(e) => handleChange('dutyStatus', e.target.value)}
              isInvalid={!!errors.dutyStatus}
            >
              <option value="">Select Duty Status</option>
              {dutyStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.dutyStatus}
            </Form.Control.Feedback>
          </Form.Group>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}