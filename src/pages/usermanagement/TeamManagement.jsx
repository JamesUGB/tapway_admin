// src/pages/usermanagement/TeamManagement.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { 
  getMembers, 
  addTeam, 
  getTeams, 
  updateTeam, 
  deleteTeam, 
  getTeamsByDepartment, 
  getEmergencyConversation, 
  getTeamMemberConversations,
  getEmergencyWithUser
} from '@/services/firestore';
import { db } from '@/services/firebase'; // ADD THIS IMPORT
import { getDepartmentFromRole } from '@/utils/roleHelpers';
import { useAuth } from '@/context/AuthContext';
import Drawer from '@/components/common/Drawer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProfileBadge from '@/components/common/ProfileBadge';
import MasonryGrid from '@/components/common/MasonryGrid';
import TeamCard from '@/components/ui/TeamCard';
import PaginationControl from '@/components/common/PaginationControl';
import { canAssignToTeam, getMemberDisplayStyle } from '@/utils/memberStatusHelpers';
import TeamDrawer from '@/components/ui/TeamDrawer';

export default function TeamManagement() {
  const { currentUser, userData } = useAuth();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  
  // Combined drawer state
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('details'); // 'details' or 'messaging'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderId: ''
  });

  // Layout configuration props
  const [layoutConfig, setLayoutConfig] = useState({
    columns: 3,
    gap: 20,
    breakpoints: {
      576: 1,
      768: 2,
      992: 2,
      1200: 3,
      1400: 4
    },
    compactMode: false,
    showStats: false,
    showTimestamps: false
  });

  const userDepartment = getDepartmentFromRole(userData?.role, userData?.department);

  useEffect(() => {
    loadData();
  }, [currentUser, userData]);

  // Search functionality
  const filteredTeams = teams.filter(team =>
    team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    members.some(member => 
      team.memberIds?.includes(member.id) && 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Update pagination when filtered teams change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredTeams.length,
      currentPage: 1
    }));
  }, [filteredTeams.length, searchTerm]);

  // Get paginated teams
  const paginatedTeams = filteredTeams.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  // Handle team card clicks
  const handleViewTeamDetails = (team) => {
    setSelectedTeam(team);
    setActiveDrawerTab('details');
    setShowTeamDrawer(true);
  };

  // Separate teams with active emergencies
  const teamsWithEmergencies = filteredTeams.filter(team => 
    team.activeEmergencies?.length > 0
  );
  const teamsWithoutEmergencies = filteredTeams.filter(team => 
    !team.activeEmergencies || team.activeEmergencies.length === 0
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      let membersData, teamsData;
      
      // Load all members first
      membersData = await getMembers();

      // Load teams based on user department
      if (userData?.role === 'super_admin') {
        teamsData = await getTeams();
      } else {
        const userDepartment = getDepartmentFromRole(userData?.role, userData?.department);
        try {
          teamsData = await getTeamsByDepartment(userDepartment);
        } catch (err) {
          // Fallback: get all teams and filter manually
          console.log('getTeamsByDepartment not available, filtering manually...');
          const allTeams = await getTeams();
          teamsData = allTeams.filter(team => team.department === userDepartment);
        }
      }

      // Filter members based on user department
      let filteredMembers = membersData;
      if (userData?.role !== 'super_admin' && userDepartment) {
        filteredMembers = membersData.filter(member => 
          member.employeeId?.startsWith(`${userDepartment}-`) || 
          member.department === userDepartment
        );
      }

      setMembers(filteredMembers);
      setTeams(teamsData);
      setPagination(prev => ({
        ...prev,
        totalItems: teamsData.length
      }));
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handlePageSizeChange = (size) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1 // Reset to first page when page size changes
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberSelect = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member.id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      leaderId: ''
    });
    setSelectedMembers([]);
    setEditingTeam(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one team member');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const selectedMemberDetails = members.filter(member => 
        selectedMembers.includes(member.id)
      );

      const teamData = {
        ...formData,
        teamName: formData.name, // Add teamName for consistency
        memberIds: selectedMembers,
        members: selectedMemberDetails.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          employeeId: member.employeeId
        })),
        department: userDepartment,
        status: 'available', // Ensure status is set
        activeEmergencies: [], // Initialize empty array
        createdAt: editingTeam ? undefined : new Date(), // Only set for new teams
        updatedAt: new Date(),
        createdBy: editingTeam ? undefined : currentUser.uid // Only set for new teams
      };

      // Remove undefined values
      Object.keys(teamData).forEach(key => {
        if (teamData[key] === undefined) {
          delete teamData[key];
        }
      });

      console.log('📝 Saving team data:', teamData);

      if (editingTeam) {
        await updateTeam(editingTeam.id, teamData);
      } else {
        await addTeam(teamData);
      }

      await loadData();
      setShowDrawer(false);
      resetForm();
    } catch (err) {
      setError(`Failed to ${editingTeam ? 'update' : 'create'} team: ` + err.message);
      console.error('Error saving team:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTeam = (team) => {
    setFormData({
      name: team.name,
      description: team.description || '',
      leaderId: team.leaderId || ''
    });
    setSelectedMembers(team.memberIds || []);
    setEditingTeam(team);
    setShowDrawer(true);
  };

  const handleCreateTeam = () => {
    resetForm();
    setShowDrawer(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      setActionLoading(true);
      await deleteTeam(teamId);
      await loadData();
    } catch (err) {
      setError('Failed to delete team: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageClick = async (team) => {
    try {
      setActionLoading(true);
      
      // Get the first active emergency for this team
      const activeEmergencyId = team.activeEmergencies?.[0];
      if (!activeEmergencyId) {
        alert('This team has no active emergencies to chat about.');
        return;
      }

      console.log('🔍 Looking for conversation for emergency:', activeEmergencyId, 'team:', team.id);

      // Get the conversation for this emergency and team
      const conversation = await getEmergencyConversation(activeEmergencyId, team.id);
      
      if (!conversation) {
        console.log('❌ No conversation found, checking if we can create one...');
        
        // Try to get emergency data to create conversation
        const emergencyData = await getEmergencyWithUser(activeEmergencyId);
        
        if (emergencyData && emergencyData.userId) {
          // Create conversation manually
          const conversationId = `emergency_${activeEmergencyId}_team_${team.id}`;
          const participants = [
            emergencyData.userId,
            ...(team.memberIds || [])
          ];
          
          const uniqueParticipants = [...new Set(participants)];
          
          console.log('🔄 Creating conversation manually:', conversationId);
          
          // Create the conversation
          const batch = writeBatch(db);
          const conversationRef = doc(db, 'conversations', conversationId);
          
          batch.set(conversationRef, {
            emergencyId: activeEmergencyId,
            teamId: team.id,
            participants: uniqueParticipants,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: null,
            type: 'emergency_chat',
            emergencyStatus: 'assigned_in_progress'
          });
          
          await batch.commit();
          
          // Now get the newly created conversation
          const newConversation = await getEmergencyConversation(activeEmergencyId, team.id);
          setSelectedConversation(newConversation);
          console.log('✅ Successfully created conversation:', newConversation);
        } else {
          alert('Cannot create conversation: Emergency data not found or missing user information.');
          return;
        }
      } else {
        setSelectedConversation(conversation);
        console.log('✅ Found existing conversation:', conversation);
      }

      setSelectedTeam(team);
      setSelectedEmergency({
        id: activeEmergencyId,
        emergencyType: 'Emergency', // You might want to get this from emergency data
        status: 'assigned_in_progress'
      });
      setActiveDrawerTab('messaging');
      setShowTeamDrawer(true);
      
    } catch (error) {
      console.error('Error opening messaging drawer:', error);
      alert('Failed to open chat: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setShowTeamDrawer(false);
    setSelectedTeam(null);
    setSelectedConversation(null);
    setSelectedEmergency(null);
    setActiveDrawerTab('details');
  };

  // Layout configuration handlers
  const updateLayoutConfig = (newConfig) => {
    setLayoutConfig(prev => ({ ...prev, ...newConfig }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Team Management</h2>
          {/* REMOVED THE TEXT AS REQUESTED */}
        </div>
        <div className="d-flex gap-2 align-items-center">
          {/* Search Input */}
          <Form.Group className="mb-0 me-3" style={{ width: '300px' }}>
            <Form.Control
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Form.Group>
          
          {/* Layout Controls */}
          <div className="d-flex gap-2 me-3">
            <Button 
              variant={layoutConfig.compactMode ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => updateLayoutConfig({ compactMode: !layoutConfig.compactMode })}
              title="Toggle compact mode"
            >
              <i className="fa fa-compress-alt"></i>
            </Button>
            <Button 
              variant={layoutConfig.showStats ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => updateLayoutConfig({ showStats: !layoutConfig.showStats })}
              title="Toggle stats"
            >
              <i className="fa fa-chart-bar"></i>
            </Button>
          </div>
          
          <Button 
            variant="primary" 
            onClick={handleCreateTeam}
            disabled={actionLoading}
          >
            <i className="fa fa-plus me-2"></i>Create Team
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Teams Display with Masonry Layout */}
        {filteredTeams.length > 0 ? (
          <>
            {/* Teams with Active Emergencies - Pinned Section */}
            {teamsWithEmergencies.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <h5 className="mb-0 me-3">Active Emergency Teams</h5>
                  <Badge bg="danger">{teamsWithEmergencies.length}</Badge>
                </div>
                <MasonryGrid
                  columns={layoutConfig.columns}
                  gap={layoutConfig.gap}
                  breakpoints={layoutConfig.breakpoints}
                  className="teams-masonry-grid"
                >
                  {teamsWithEmergencies.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      members={members}
                      onEdit={handleEditTeam}
                      onDelete={handleDeleteTeam}
                      onMessage={handleMessageClick}
                      onViewDetails={handleViewTeamDetails}
                      actionLoading={actionLoading}
                      compactMode={layoutConfig.compactMode}
                      showStats={layoutConfig.showStats}
                      showTimestamps={layoutConfig.showTimestamps}
                      className="mb-0"
                    />
                  ))}
                </MasonryGrid>
              </div>
            )}

            {/* All Other Teams */}
            <div className={teamsWithEmergencies.length > 0 ? 'mt-4' : ''}>
              {teamsWithEmergencies.length > 0 && (
                <div className="d-flex align-items-center mb-3">
                  <h5 className="mb-0 me-3">All Teams</h5>
                  <Badge bg="secondary">{teamsWithoutEmergencies.length}</Badge>
                </div>
              )}
              <MasonryGrid
                columns={layoutConfig.columns}
                gap={layoutConfig.gap}
                breakpoints={layoutConfig.breakpoints}
                className="teams-masonry-grid"
              >
                {teamsWithoutEmergencies.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    members={members}
                    onEdit={handleEditTeam}
                    onDelete={handleDeleteTeam}
                    onMessage={handleMessageClick}
                    onViewDetails={handleViewTeamDetails}
                    actionLoading={actionLoading}
                    compactMode={layoutConfig.compactMode}
                    showStats={layoutConfig.showStats}
                    showTimestamps={layoutConfig.showTimestamps}
                    className="mb-0"
                  />
                ))}
              </MasonryGrid>
            </div>

            {/* Pagination Control */}
            <PaginationControl
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(pagination.totalItems / pagination.pageSize)}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showPageSizeControl={true}
              usePortal={false}
            />
          </>
        ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="fa fa-users fa-3x text-muted mb-3"></i>
            <h5>
              {searchTerm ? 'No teams found' : 'No teams created yet'}
            </h5>
            <p className="text-muted">
              {searchTerm 
                ? `No teams match your search for "${searchTerm}"`
                : 'Create your first team to get started'
              }
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={handleCreateTeam}>
                Create Team
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Combined Team Drawer */}
      <TeamDrawer
        show={showTeamDrawer}
        onHide={handleDrawerClose}
        team={selectedTeam}
        members={members}
        activeTab={activeDrawerTab}
        conversation={selectedConversation}
        emergency={selectedEmergency}
      />
      
      {/* Team Creation/Edit Drawer */}
      <Drawer
        show={showDrawer}
        onHide={() => {
          setShowDrawer(false);
          resetForm();
        }}
        title={editingTeam ? "Edit Team" : "Create New Team"}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Team Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter team name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter team description (optional)"
            />
          </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Team Leader</Form.Label>
          <Form.Select
            name="leaderId"
            value={formData.leaderId}
            onChange={handleInputChange}
          >
            <option value="">Select team leader (optional)</option>
            {members.map(member => {
              const isActive = canAssignToTeam(member);
              const displayText = `${member.firstName} ${member.lastName} (${member.employeeId})${!isActive ? ' - Inactive' : ''}`;
              
              return (
                <option 
                  key={member.id} 
                  value={member.id}
                  disabled={!isActive}
                  style={!isActive ? { color: '#6c757d', fontStyle: 'italic' } : {}}
                >
                  {displayText}
                </option>
              );
            })}
          </Form.Select>
          <Form.Text className="text-muted">
            Inactive members cannot be assigned as team leaders
          </Form.Text>
        </Form.Group>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Label className="mb-0">Select Team Members *</Form.Label>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleSelectAll}
              type="button"
            >
              {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {members.map(member => {
              const isActive = canAssignToTeam(member);
              const displayStyle = getMemberDisplayStyle(member);
              
              return (
                <Form.Check
                  key={member.id}
                  type="checkbox"
                  id={`member-${member.id}`}
                  label={
                    <div className="d-flex align-items-center" style={displayStyle}>
                      <ProfileBadge 
                        firstName={member.firstName} 
                        lastName={member.lastName}
                        size="sm"
                        className="me-2"
                      />
                      <span>
                        {member.firstName} {member.lastName} 
                        <small className="text-muted ms-2">({member.employeeId})</small>
                        {!isActive && <Badge bg="secondary" className="ms-2" size="sm">Inactive</Badge>}
                      </span>
                    </div>
                  }
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => {
                    if (isActive) {
                      handleMemberSelect(member.id);
                    }
                  }}
                  disabled={!isActive}
                />
              );
            })}
          </div>
          
          <Form.Text className="text-muted">
            Selected: {selectedMembers.length} member(s)
            {members.some(m => !canAssignToTeam(m)) && (
              <span className="ms-2 text-warning">
                ⚠️ Inactive members cannot be selected
              </span>
            )}
          </Form.Text>
        </div>

          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDrawer(false);
                resetForm();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={actionLoading || !formData.name.trim() || selectedMembers.length === 0}
            >
              {actionLoading 
                ? 'Saving...' 
                : (editingTeam ? 'Update Team' : 'Create Team')}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}