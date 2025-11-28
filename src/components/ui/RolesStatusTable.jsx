// C:\Users\Zino\Documents\tapway_admin\src\components\ui\RolesStatusTable.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import CustomToggle from '../common/CustomToggle';
import PortalDropdown, { PortalDropdownToggle } from '../common/PortalDropdown';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import UserHoverCard from '../common/UserHoverCard';
import PaginationControl from '../common/PaginationControl';
import ProfileBadge from '../common/ProfileBadge';
import { calculateAge, formatFullName } from '@/utils/memberHelpers';
// import { formatDateTime } from '@/utils/format';

export default function RolesStatusTable({
  members,
  onEdit,
  onToggleStatus,
  searchTerm,
  onSearchChange,
  setShowAddRoleDrawer,
  setShowManageRolesDrawer,
  actionLoading,
  refreshTrigger // Add this prop to force refresh when roles are updated
}) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [changingStatusId, setChangingStatusId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [manageRolesDropdownOpen, setManageRolesDropdownOpen] = useState(false);
  const [localMembers, setLocalMembers] = useState(members);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create refs for dropdowns
  const memberToggleRefs = useRef({});
  const manageRolesToggleRef = useRef(null);

  // Sync local members with props
  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

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

  const filteredMembers = localMembers.filter(member =>
    formatFullName(member.firstName, member.middleName, member.lastName)
      .toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.personnelPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.dutyStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.status?.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    return actions;
  };

  const MEMBER_ACTION_LABELS = {
    edit: 'Edit Member',
    toggleStatus: 'Toggle Status'
  };

  const handleAction = async (memberId, action) => {
    setChangingStatusId(memberId);
    setDropdownOpen(null);
    try {
      if (action === 'edit') {
        const member = localMembers.find(m => m.id === memberId);
        // Pass a callback to refresh the data after edit
        onEdit(member, () => {
          // This callback will be called after successful edit
          console.log('Member edited successfully, refreshing display...');
          // Force a refresh by updating local state
          // The parent component should refresh the members data
        });
      } else if (action === 'toggleStatus') {
        const member = localMembers.find(m => m.id === memberId);
        await onToggleStatus(memberId, member.status);
        // Update local state immediately
        setLocalMembers(prev => 
          prev.map(m => 
            m.id === memberId 
              ? { ...m, status: member.status === 'active' ? 'inactive' : 'active' }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setChangingStatusId(null);
    }
  };

  // Update member data locally when props change (for immediate UI update)
  const updateMemberLocally = (memberId, updates) => {
    setLocalMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, ...updates }
          : member
      )
    );
  };

  const toggleDropdown = (memberId) => {
    if (dropdownOpen === memberId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(memberId);
    }
  };

  const toggleManageRolesDropdown = () => {
    setManageRolesDropdownOpen(!manageRolesDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  const closeManageRolesDropdown = () => {
    setManageRolesDropdownOpen(false);
  };

  const getDutyStatusBadge = (dutyStatus) => {
    switch (dutyStatus) {
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
        <div className="d-flex align-items-center gap-2">
          {/* Manage Roles Dropdown */}
          <div className="position-relative">
            <CustomToggle
              ref={manageRolesToggleRef}
              onClick={toggleManageRolesDropdown}
              disabled={actionLoading}
              className="btn-outline-secondary"
            >
              <div className="d-flex flex-column" style={{ lineHeight: '0.8' }}>
                <span style={{ fontSize: '12px' }}>•</span>
                <span style={{ fontSize: '12px' }}>•</span>
                <span style={{ fontSize: '12px' }}>•</span>
              </div>
            </CustomToggle>
            
            <PortalDropdown
              show={manageRolesDropdownOpen}
              onClose={closeManageRolesDropdown}
              targetElement={manageRolesToggleRef.current}
            >
              <div className="dropdown-menu show">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowManageRolesDrawer(true);
                    closeManageRolesDropdown();
                  }}
                >
                  View all Roles
                </button>
              </div>
            </PortalDropdown>
          </div>

          {/* Add Role Button - Now opens AddRoleDrawer */}
          <Button 
            variant="primary" 
            onClick={() => setShowAddRoleDrawer(true)}
            disabled={actionLoading}
          >
            <i className="fa fa-plus me-2"></i>Add Role
          </Button>
        </div>
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
            <th>Full Name</th>
            <th>Personnel Position</th>
            <th>Account Status</th>
            <th>Duty Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedMembers.map(member => {
            const availableActions = getAvailableActions(member);
            const memberToggleRef = getMemberToggleRef(member.id);
            const isDropdownOpen = dropdownOpen === member.id;
            const isActive = member.status === 'active';
            const displayStyle = !isActive ? {
              textDecoration: 'line-through',
              opacity: 0.6,
              color: '#6c757d'
            } : {};
            
            return (
              <tr key={member.id} style={displayStyle}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    disabled={!isActive}
                  />
                </td>
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
                          <span className="text-muted">Employee ID:</span>
                          <span>{member.employeeId || "N/A"}</span>
                        </div>
                        {!isActive && (
                          <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                            <span className="text-warning">
                              <small>⚠️ Account is inactive</small>
                            </span>
                          </div>
                        )}
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
                <td>
                  <Badge bg="info" className="text-capitalize">
                    {member.personnelPosition || "Member"}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getAccountStatusBadge(member.status)}>
                    {member.status || 'inactive'}
                  </Badge>
                </td>
                <td>
                  <Badge 
                    bg={getDutyStatusBadge(member.dutyStatus)} 
                    className="text-capitalize"
                  >
                    {member.dutyStatus || 'Off Duty'}
                  </Badge>
                  {/* {!isActive && (
                    <div className="text-warning small mt-1">
                      <small>Locked for inactive accounts</small>
                    </div>
                  )} */}
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