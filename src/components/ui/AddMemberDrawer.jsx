// src\components\ui\AddMemberDrawer.jsx
import { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import Drawer from '@/components/common/Drawer';
import GlobalDialog from '@/components/common/GlobalDialog';
import {
  generateEmployeeId,
  generateUsername,
  generatePassword
} from '@/utils/memberHelpers';
import { useAuth } from '@/hooks/useAuth';
import { getDepartmentFromRole } from '@/utils/roleHelpers';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/constants/employmentTypes';

export default function AddMemberDrawer({
  show,
  onHide,
  member,
  onSave,
  loading
}) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState(getInitialFormData());
  const [autoCredentials, setAutoCredentials] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialFormDataRef = useRef(null);

  function getInitialFormData() {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      civilStatus: '',
      contactNumber: '',
      emailAddress: '',
      homeAddress: '',
      governmentId: '',
      governmentIdNumber: '',
      badgeIdNumber: '',
      employmentType: '',
      remarks: ''
    };
  }

  const hasFormChanges = (currentData, initialData) =>
    JSON.stringify(currentData) !== JSON.stringify(initialData);

  useEffect(() => {
    if (member) {
      const memberFormData = {
        firstName: member.firstName || '',
        middleName: member.middleName || '',
        lastName: member.lastName || '',
        gender: member.gender || '',
        dateOfBirth: member.dateOfBirth || '',
        civilStatus: member.civilStatus || '',
        contactNumber: member.contactNumber || '',
        emailAddress: member.emailAddress || '',
        homeAddress: member.homeAddress || '',
        governmentId: member.governmentId || '',
        governmentIdNumber: member.governmentIdNumber || '',
        badgeIdNumber: member.badgeIdNumber || '',
        employmentType: member.employmentType || '',
        remarks: member.remarks || ''
      };

      setFormData(memberFormData);
      initialFormDataRef.current = memberFormData;
      setAutoCredentials({ username: '', password: '' });
    } else {
      const initialData = getInitialFormData();
      setFormData(initialData);
      initialFormDataRef.current = initialData;
      setAutoCredentials({ username: '', password: '' });
    }
    setErrors({});
    setSubmitError('');
    setHasUnsavedChanges(false);
  }, [member, show]);

  useEffect(() => {
    if (
      !member &&
      formData.firstName &&
      formData.lastName &&
      formData.dateOfBirth
    ) {
      const username = generateUsername(
        formData.firstName,
        formData.lastName
      );
      const currentYear = new Date().getFullYear();
      const password = generatePassword(formData.dateOfBirth, currentYear);

      setAutoCredentials({ username, password });
    }
  }, [formData.firstName, formData.lastName, formData.dateOfBirth, member]);

  useEffect(() => {
    if (initialFormDataRef.current) {
      setHasUnsavedChanges(
        hasFormChanges(formData, initialFormDataRef.current)
      );
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.civilStatus) newErrors.civilStatus = 'Civil status is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';

    if (formData.contactNumber && !/^09\d{9}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 11 digits starting with 09';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    try {
      const userDepartment = getDepartmentFromRole(
        userData?.role,
        userData?.department
      );

      const memberData = {
        ...formData,
        employeeId:
          member?.employeeId ||
          generateEmployeeId(
            userDepartment,
            formData.dateOfBirth
              .split('-')
              .reverse()
              .join('/')
              .replace(
                /(\d{4})\/(\d{2})\/(\d{2})/,
                '$2/$3/$1'
              ),
            new Date().getFullYear()
          ),
        dutyStatus: member?.dutyStatus || 'Off Duty',
        ...(!member && {
          autoGeneratedUsername: autoCredentials.username,
          autoGeneratedPassword: autoCredentials.password
        })
      };

      await onSave(memberData);
      
      // Reset local state to avoid stale data on next open
      const resetData = getInitialFormData();
      setFormData(resetData);
      initialFormDataRef.current = resetData;
      setAutoCredentials({ username: '', password: '' });
      setErrors({});
      setSubmitError('');
      setHasUnsavedChanges(false);

      // Close the drawer properly
      onHide();
    } catch (error) {
      console.error('Error saving member:', error);
      setSubmitError('Failed to save member. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      onHide();
    }
  };

  const handleConfirmClose = (shouldClose) => {
    setShowConfirmModal(false);
    if (shouldClose) {
      onHide();
    }
  };

  return (
    <>
      <Drawer
        show={show}
        onHide={handleClose}
        title={member ? 'Edit Member' : 'Member Registration'}
        size="lg"
      >
        {submitError && (
          <Alert variant="danger" className="mb-3">
            {submitError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="row">
            {/* Required Fields */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  isInvalid={!!errors.firstName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Middle Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  isInvalid={!!errors.lastName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  isInvalid={!!errors.gender}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  isInvalid={!!errors.dateOfBirth}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dateOfBirth}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Civil Status</Form.Label>
                <Form.Select
                  value={formData.civilStatus}
                  onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                  isInvalid={!!errors.civilStatus}
                  required
                >
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Legally Separated">Legally Separated</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.civilStatus}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  isInvalid={!!errors.contactNumber}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Employment Type</Form.Label>
                <Form.Select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  isInvalid={!!errors.employmentType}
                  required
                >
                  <option value="">Select Employment Type</option>
                  {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.employmentType}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            {/* Auto-generated credentials (only for new members) */}
            {!member && (
              <div className="col-12">
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Auto-generated Credentials</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            value={autoCredentials.username}
                            readOnly
                            placeholder="Will be generated automatically"
                          />
                          <Form.Text className="text-muted">
                            Format: firstNamelastName (e.g., JuanCruz)
                          </Form.Text>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="text"
                            value={autoCredentials.password}
                            readOnly
                            placeholder="Will be generated automatically"
                          />
                          <Form.Text className="text-muted">
                            Format: DDMMYYYY + last 2 digits of registration year (e.g., 29120125)
                          </Form.Text>
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Optional Fields */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>Home Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.homeAddress}
                  onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Government ID</Form.Label>
                <Form.Select
                  value={formData.governmentId}
                  onChange={(e) => handleInputChange('governmentId', e.target.value)}
                >
                  <option value="">Select ID Type</option>
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver's License</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Government ID Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.governmentIdNumber}
                  onChange={(e) => handleInputChange('governmentIdNumber', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Badge/ID Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.badgeIdNumber}
                  onChange={(e) => handleInputChange('badgeIdNumber', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Additional notes or comments"
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
            </Button>
          </div>
        </Form>
      </Drawer>

       {/*Global confirmation dialog */}
      <GlobalDialog
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        title="Unsaved Changes"
        body={
          <>
            <p>You have unsaved changes. Are you sure you want to close this form?</p>
            <p className="text-muted small">
              Your changes will be lost if you proceed.
            </p>
          </>
        }
        actions={[
          {
            label: 'Continue Editing',
            variant: 'secondary',
            onClick: () => handleConfirmClose(false)
          },
          {
            label: 'Discard Changes',
            variant: 'primary',
            onClick: () => handleConfirmClose(true)
          }
        ]}
      />
    </>
  );
}
