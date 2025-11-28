// src/components/ui/MemberTable.jsx
import React, { useState, useRef, useCallback } from 'react';
import CustomToggle from '../common/CustomToggle';
import PortalDropdown, { PortalDropdownToggle } from '../common/PortalDropdown';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import UserHoverCard from '../common/UserHoverCard';
import PaginationControl from '../common/PaginationControl';
import ProfileBadge from '../common/ProfileBadge';
import { calculateAge, formatFullName } from '@/utils/memberHelpers';
import { formatDateTime } from '@/utils/format';

export default function MemberTable({
  members,
  onEdit,
  onDelete,
  onToggleStatus,
  searchTerm,
  onSearchChange,
  setShowDrawer,
  actionLoading
}) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [changingStatusId, setChangingStatusId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create a ref for each member using useRef and useCallback
  const memberToggleRefs = useRef({});

  const getMemberToggleRef = useCallback((memberId) => {
    if (!memberToggleRefs.current[memberId]) {
      memberToggleRefs.current[memberId] = React.createRef();
    }
    return memberToggleRefs.current[memberId];
  }, []);

  // Helper function to format middle name (show only first letter)
  const formatMiddleNameForDisplay = (middleName) => {
    if (!middleName) return '';
    return middleName.charAt(0).toUpperCase() + '.';
  };

  const filteredMembers = members.filter(member =>
    member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatFullName(member.firstName, member.middleName, member.lastName)
      .toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.personnelPosition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMembers(paginatedMembers.map(member => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedMembers([]);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setSelectedMembers([]);
  };

  const handleSearchChange = (value) => {
    onSearchChange(value);
    setCurrentPage(1);
    setSelectedMembers([]);
  };
  
  const handleSelectMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getAvailableActions = (member) => {
    const actions = [];
    
    if (onEdit) actions.push('edit');
    if (onToggleStatus) actions.push('toggleStatus');
    if (onDelete) actions.push('delete');
    
    return actions;
  };

  const MEMBER_ACTION_LABELS = {
    delete: 'Delete Member',
    edit: 'Edit Member',
    toggleStatus: 'Toggle Status'
  };

  const handleAction = async (memberId, action) => {
    setChangingStatusId(memberId);
    setDropdownOpen(null);
    try {
      if (action === 'edit') {
        const member = members.find(m => m.id === memberId);
        onEdit(member);
      } else if (action === 'delete') {
        onDelete(memberId);
      } else if (action === 'toggleStatus') {
        const member = members.find(m => m.id === memberId);
        onToggleStatus(memberId, member.status);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setChangingStatusId(null);
    }
  };

  const toggleDropdown = (memberId) => {
    if (dropdownOpen === memberId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(memberId);
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Group className="mb-0" style={{ width: '300px' }}>
          <Form.Control
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Form.Group>
        <Button 
          variant="primary" 
          onClick={() => setShowDrawer(true)}
          disabled={actionLoading}
        >
          <i className="fa fa-plus me-2"></i>Add Member
        </Button>
      </div>

      <Table className="table table-hover no-vertical-borders">
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedMembers.length === paginatedMembers.length && paginatedMembers.length > 0}
              />
            </th>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Personnel Position</th>
            <th>Employment Type</th>
            <th>Created At</th>
            <th>Last Updated</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMembers.map(member => {
            const availableActions = getAvailableActions(member);
            const memberToggleRef = getMemberToggleRef(member.id);
            const isDropdownOpen = dropdownOpen === member.id;
            
            return (
              <tr key={member.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                  />
                </td>
                <td>{member.employeeId}</td>
                <td>
                  <UserHoverCard 
                    userId={member.id} 
                    mode="member"
                    customContent={
                      <div className="small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Age:</span>
                          <span>{calculateAge(member.dateOfBirth)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Gender:</span>
                          <span className="text-capitalize">{member.gender || "N/A"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Contact:</span>
                          <span>{member.contactNumber || "N/A"}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span className="text-muted">Address:</span>
                          <span>{member.homeAddress || "N/A"}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Remarks:</span>
                          <span>{member.remarks || "N/A"}</span>
                        </div>
                      </div>
                    }
                  >
                    <div className="d-flex align-items-center">
                      <ProfileBadge 
                        firstName={member.firstName} 
                        lastName={member.lastName}
                        size="sm"
                        className="me-2"
                      />
                      <span className="text-primary cursor-pointer">
                        {formatFullName(
                          member.firstName, 
                          formatMiddleNameForDisplay(member.middleName),
                          member.lastName
                        )}
                      </span>
                    </div>
                  </UserHoverCard>
                </td>
                <td>{member.personnelPosition}</td>
                <td>
                  <Badge bg="info" className="text-capitalize">
                    {member.employmentType || "N/A"}
                  </Badge>
                </td>
                <td>{formatDateTime(member.createdAt)}</td>
                <td>{formatDateTime(member.updatedAt)}</td>
                <td>
                  <Badge bg={member.status === 'active' ? 'success' : 'secondary'}>
                    {member.status}
                  </Badge>
                </td>
                <td className="align-middle">
                  {availableActions.length > 0 ? (
                    <>
                      <CustomToggle
                        ref={memberToggleRef}
                        onClick={() => toggleDropdown(member.id)}
                        disabled={changingStatusId === member.id}
                      >
                        {changingStatusId === member.id ? (
                          <span className="text-muted">Processing...</span>
                        ) : (
                          <span>•••</span>
                        )}
                      </CustomToggle>
                      
                      <PortalDropdown
                        show={isDropdownOpen}
                        onClose={closeDropdown}
                        targetElement={memberToggleRef.current}
                      >
                        <div className="dropdown-menu show">
                          {availableActions.map((action) => (
                            <button
                              key={action}
                              className={`dropdown-item ${action === 'delete' ? 'text-danger' : ''}`}
                              onClick={() => handleAction(member.id, action)}
                              disabled={changingStatusId === member.id}
                            >
                              {MEMBER_ACTION_LABELS[action]}
                            </button>
                          ))}
                        </div>
                      </PortalDropdown>
                    </>
                  ) : (
                    <span className="text-muted">No actions</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showPageSizeControl={true}
      />
    </>
  );
}