// src/components/ui/TeamCard.jsx
import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import CardDropdown from '@/components/common/CardDropdown';
import ProfileBadge from '@/components/common/ProfileBadge';
import UserHoverCard from '@/components/common/UserHoverCard';

const TeamCard = ({ 
  team, 
  members = [], 
  onEdit, 
  onDelete, 
  onMessage,
  onViewDetails,
  actionLoading = false,
  className = '',
  showStats = false,
  showTimestamps = false,
  compactMode = false
}) => {
  
  // State for expanded description
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ADD NULL SAFETY
  if (!team) {
    return null;
  }

  const getMemberById = (memberId) => {
    return members.find(member => member.id === memberId);
  };

  const getTeamLeader = (team) => {
    if (!team || !team.leaderId) return null;
    return getMemberById(team.leaderId);
  };

  // ADD ACTIVE EMERGENCY CHECK
  const activeEmergencyCount = team.activeEmergencies?.length || 0;
  const hasActiveEmergencies = activeEmergencyCount > 0;

  // ADD CLICK HANDLER
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(team);
    }
  };

  // ADD ACTION CLICK HANDLER TO PREVENT BUBBLING
  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent card click when clicking actions
    if (action) {
      action(team);
    }
  };

  // Handle expand/collapse for description
  const handleExpandClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Component for displaying member badges
  const MemberBadges = ({ team, compact = false }) => {
    const teamMembers = team.memberIds?.map(getMemberById).filter(Boolean) || [];
    const teamLeader = getTeamLeader(team);
    const regularMembers = teamMembers.filter(member => 
      !teamLeader || member.id !== teamLeader.id
    );
    
    const maxDisplay = compact ? 2 : 3;
    const displayMembers = regularMembers.slice(0, maxDisplay);
    const remainingCount = regularMembers.length - maxDisplay;

    return (
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center">
          {displayMembers.map((member, index) => (
            <div 
              key={member.id} 
              className="position-relative"
              style={{ 
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: displayMembers.length - index
              }}
            >
              <UserHoverCard 
                userId={member.id} 
                memberData={member} 
                mode="team-management"
              >
                <div style={{ cursor: 'pointer' }}>
                  <ProfileBadge 
                    firstName={member.firstName} 
                    lastName={member.lastName}
                    size={compact ? "sm" : "md"}
                  />
                </div>
              </UserHoverCard>
            </div>
          ))}
        </div>
        
        {remainingCount > 0 && (
          <Badge 
            bg="secondary" 
            className="ms-2"
            style={{ 
              fontSize: compact ? '10px' : '11px', 
              padding: compact ? '3px 5px' : '4px 6px',
              minWidth: compact ? '24px' : '28px'
            }}
          >
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  const teamLeader = getTeamLeader(team);
  const teamMembers = team.memberIds?.map(getMemberById).filter(Boolean) || [];

  return (
    <Card 
      className={`team-card ${hasActiveEmergencies ? 'team-card-active' : ''} ${className}`} 
      style={{ 
        width: '100%',
        cursor: onViewDetails ? 'pointer' : 'default',
        border: hasActiveEmergencies ? '2px solid #dc3545' : '1px solid #dee2e6',
        transition: 'all 0.2s ease'
      }}
      onClick={handleCardClick}
    >

      {/* Header with Team Name and Actions */}
      <Card.Header className="d-flex justify-content-between align-items-center border-bottom-0 bg-transparent pt-3">
        <h5 className="mb-0 flex-grow-1" style={{ fontSize: compactMode ? '1.1rem' : '1.25rem' }}>
          {team.name}
        </h5>
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          {/* Message Icon Button (only show if there are active emergencies) */}
          {hasActiveEmergencies && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMessage(team);
              }}
              title="Message Team"
              className="d-flex align-items-center justify-content-center p-0"
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <i
                className="fa fa-envelope"
                style={{
                  fontSize: '20px',
                  color: '#6c757d',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}
              ></i>
            </Button>
          )}
          {/* Dropdown Menu */}
          <CardDropdown disabled={actionLoading}>
            <button
              className="dropdown-item"
              onClick={(e) => handleActionClick(e, onEdit)}
              disabled={actionLoading}
            >
              <i className="fa fa-edit me-2"></i>Edit Team
            </button>
            <button
              className="dropdown-item text-danger"
              onClick={(e) => handleActionClick(e, (team) => onDelete?.(team.id))}
              disabled={actionLoading}
            >
              <i className="fa fa-trash me-2"></i>Delete Team
            </button>
          </CardDropdown>
        </div>
      </Card.Header>
      
      <Card.Body className="pb-3">
        {/* Team Leader Section */}
        <div 
          className="d-flex justify-content-center" 
          style={{ 
            marginTop: compactMode ? '5px' : '10px', 
            marginBottom: compactMode ? '25px' : '40px' 
          }}
        >
          {teamLeader ? (
            <div className="position-relative">
              {/* Circle Background */}
              <div 
                className="rounded-circle position-absolute"
                style={{
                  width: compactMode ? '65px' : '145px',
                  height: compactMode ? '65px' : '145px',
                  border: hasActiveEmergencies
                    ? '1px solid #dc3545'
                    : '1px solid #4a4a4a',
                  boxSizing: 'border-box',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0
                }}
              ></div>
                  
              {/* ProfileBadge centered */}
              <div className="position-relative" style={{ zIndex: 1 }}>
                <ProfileBadge 
                  firstName={teamLeader.firstName} 
                  lastName={teamLeader.lastName}
                  size={compactMode ? "lg" : "xl"}
                />
              </div>

              {/* ACTIVE EMERGENCY BADGE */}
              {hasActiveEmergencies && (
                <div
                  className="position-absolute bottom-0 start-50 translate-middle-x"
                  style={{ zIndex: 2 }}
                >
                  <Badge
                    bg="danger"
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      padding: compactMode ? "3px 6px" : "6px 12px",
                      fontSize: compactMode ? "0.65rem" : "0.80rem",
                      borderRadius: compactMode ? "6px" : "8px",
                      minWidth: compactMode ? "70px" : "120px",
                    }}
                  >
                    {/* Icon */}
                    <i
                      className="fa fa-exclamation-triangle"
                      style={{
                        fontSize: compactMode ? "0.65rem" : "0.9rem",
                        marginRight: "6px"
                      }}
                    ></i>

                    {/* Text logic changes based on compactMode */}
                    {compactMode ? (
                      <>
                        {activeEmergencyCount} Emg{activeEmergencyCount > 1 ? "s" : ""}
                      </>
                    ) : (
                      <>
                        {activeEmergencyCount} Active Emergenc
                        {activeEmergencyCount > 1 ? "ies" : "y"}
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="position-relative">
              {/* Circle Background for empty state */}
              <div 
                className="rounded-circle position-absolute"
                style={{
                  width: compactMode ? '115px' : '145px',
                  height: compactMode ? '115px' : '145px',
                  border: '1px solid #4a4a4a',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0
                }}
              ></div>
              
              {/* Empty user icon */}
              <div 
                className="d-flex align-items-center justify-content-center bg-light rounded-circle position-relative"
                style={{ 
                  width: compactMode ? '100px' : '130px', 
                  height: compactMode ? '100px' : '130px',
                  zIndex: 1
                }}
              >
                <i className="fa fa-user text-muted" style={{ fontSize: compactMode ? '35px' : '50px' }}></i>
              </div>
            </div>
          )}
        </div>

        {/* Team Leader Name */}
        <div className="text-start mb-2">
          {teamLeader ? (
            <div className="d-flex align-items-center">
              <h6 className="mb-0 me-0" style={{ fontSize: compactMode ? '1rem' : '1.25rem' }}>
                {teamLeader.firstName} {teamLeader.lastName}
              </h6>
              <Badge bg="outline-primary" text="primary" className="fs-6">
                (TL)
              </Badge>
            </div>
          ) : (
            <h6 className="mb-0 text-muted" style={{ fontSize: compactMode ? '0.9rem' : '1rem' }}>
              No Team Leader
            </h6>
          )}
        </div>
        
        {/* Member badges */}
        <div className="text-start mb-3">
          <MemberBadges team={team} compact={compactMode} />
        </div>
        
        {/* Description with truncation and expand functionality */}
        {team.description && (
          <div className="text-start mb-3">
            <div 
              className="text-muted small mb-0 team-description"
              style={{ 
                lineHeight: '1.4',
                fontSize: compactMode ? '0.8rem' : '0.875rem',
                // Apply multi-line truncation when not expanded and stats not shown
                display: (isExpanded || showStats) ? 'block' : '-webkit-box',
                WebkitLineClamp: (isExpanded || showStats) ? 'unset' : '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
              }}
            >
              {team.description}
            </div>
            
            {/* Show expand/collapse toggle for long descriptions when stats are not shown */}
            {!showStats && team.description.length > 100 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-primary text-decoration-none mt-1"
                onClick={handleExpandClick}
                style={{ fontSize: '0.7rem' }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
            
            {/* Indicator when description is automatically expanded by stats toggle */}
            {showStats && team.description.length > 100 && (
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                (full description shown - stats are toggled on)
              </small>
            )}
          </div>
        )}
        
        {/* ACTIVE EMERGENCY STATS */}
        {showStats && (
          <div className="pt-2 border-top text-center">
            <div className="d-flex justify-content-around">
              <div>
                <div className="fw-bold" style={{ color: hasActiveEmergencies ? '#dc3545' : 'inherit' }}>
                  {activeEmergencyCount}
                </div>
                <small className="text-muted">Active</small>
              </div>
              <div>
                <div className="fw-bold">{teamMembers.length}</div>
                <small className="text-muted">Members</small>
              </div>
              <div>
                <div className="fw-bold">{team.department}</div>
                <small className="text-muted">Dept</small>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
      
      {/* Optional Footer with Timestamps */}
      {showTimestamps && (
        <Card.Footer className="text-muted small text-center">
          Created {new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString()}
          {team.updatedAt && team.updatedAt !== team.createdAt && (
            <span> • Updated {new Date(team.updatedAt?.toDate?.() || team.updatedAt).toLocaleDateString()}</span>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default TeamCard;