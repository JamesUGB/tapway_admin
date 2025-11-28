// src/components/common/UserHoverCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, Spinner } from 'react-bootstrap';
import { formatPhoneNumber } from '../../utils/format';
import { useUserData } from '../../hooks/useUserData';
import { calculateAge } from '../../utils/memberHelpers';

const ESTIMATED_HEIGHT = 200;

// Helper function to format full name (assuming you have this utility)
const formatFullName = (firstName, middleName, lastName) => {
  const parts = [firstName, middleName, lastName].filter(part => part && part.trim());
  return parts.join(' ');
};

// Helper function to format middle name for display
const formatMiddleNameForDisplay = (middleName) => {
  if (!middleName || !middleName.trim()) return '';
  return middleName.charAt(0).toUpperCase() + '.';
};

const UserHoverCard = ({ userId, children, customContent, mode = 'user', memberData }) => {
  const { user, loading, error } = useUserData(userId);
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false, placement: 'bottom' });
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);

  const calculatePosition = () => {
    if (!wrapperRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const cardHeight = cardRef.current?.offsetHeight || ESTIMATED_HEIGHT;
    
    // Calculate available space
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - wrapperRect.bottom;
    const spaceAbove = wrapperRect.top;

    // Decide placement based on available space
    const placement = spaceBelow >= cardHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';
    
    // Calculate position relative to viewport
    let top, left;
    
    if (placement === 'bottom') {
      top = wrapperRect.bottom + window.scrollY + 4; // 4px margin
    } else {
      top = wrapperRect.top + window.scrollY - cardHeight - 4; // 4px margin
    }
    
    left = wrapperRect.left + window.scrollX;

    // Ensure card stays within viewport horizontally
    const viewportWidth = window.innerWidth;
    const cardWidth = 300; // Fixed card width
    if (left + cardWidth > viewportWidth + window.scrollX) {
      left = viewportWidth + window.scrollX - cardWidth - 10; // 10px margin from right edge
    }
    if (left < window.scrollX) {
      left = window.scrollX + 10; // 10px margin from left edge
    }

    setPosition({
      top,
      left,
      visible: true,
      placement
    });
  };

  const handleMouseEnter = () => {
    calculatePosition();
  };

  const handleMouseLeave = () => {
    setPosition(prev => ({ ...prev, visible: false }));
  };

  // Get the display data (either passed memberData or fetched user data)
  const getDisplayData = () => {
    if ((mode === 'member' || mode === 'team-management') && memberData) {
      return memberData;
    }
    return user;
  };

  // Get the full name for display
  const getFullName = () => {
    const data = getDisplayData();
    if (!data) return 'Unknown User';
    
    if ((mode === 'member' || mode === 'team-management') && memberData) {
      // For member mode, use the member data
      return formatFullName(
        data.firstName,
        formatMiddleNameForDisplay(data.middleName),
        data.lastName
      );
    } else {
      // For user mode, use user data structure
      return formatFullName(
        data.firstName || data.displayName?.split(' ')[0],
        '', // Users typically don't have middle names in the system
        data.lastName || data.displayName?.split(' ').slice(1).join(' ')
      );
    }
  };

  // Team Management content - only name and employee ID
  const renderTeamManagementContent = (data) => (
    <div className="small">
      <div className="mb-1">
        <h6 className="mb-0 text-primary fw-bold">{getFullName()}</h6>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted">Employee ID:</span>
        <span>{data?.employeeId || 'N/A'}</span>
      </div>
    </div>
  );

  // Member content using passed memberData
  const renderMemberContent = (data) => (
    <div className="small">
      <div className="mb-2">
        <h6 className="mb-1 text-primary fw-bold">{getFullName()}</h6>
        <small className="text-muted">Employee ID: {data?.employeeId || 'N/A'}</small>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Age:</span>
        <span>{calculateAge(data?.birthDate)}</span>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Gender:</span>
        <span className="text-capitalize">{data?.gender || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Contact:</span>
        <span>{data?.contactNumber ? formatPhoneNumber(data.contactNumber) : "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted">Address:</span>
        <span className="text-end" style={{ maxWidth: '150px', wordBreak: 'break-word' }}>
          {data?.homeAddress || "N/A"}
        </span>
      </div>
    </div>
  );

  // Default user content
  const renderUserContent = (userData) => (
    <div className="small">
      <div className="mb-2">
        <h6 className="mb-1 text-primary fw-bold">{getFullName()}</h6>
        <small className="text-muted">{userData?.email || 'No email'}</small>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Phone:</span>
        <span>{userData?.phone ? formatPhoneNumber(userData.phone) : "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Role:</span>
        <span className="text-capitalize">{userData?.role || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">Department:</span>
        <span className="text-capitalize">{userData?.department || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted">Email Verified:</span>
        <span className={userData?.isEmailVerified ? "text-success" : "text-danger"}>
          {userData?.isEmailVerified ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );

  const getCardContent = () => {
    // Team Management mode - simplified content
    if (mode === 'team-management' && memberData) {
      return renderTeamManagementContent(memberData);
    }

    // Member mode - detailed member content
    if (mode === 'member' && memberData) {
      return renderMemberContent(memberData);
    }

    if (loading) {
      return (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" />
          <div className="mt-2 small text-muted">Loading user info...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-3">
          <i className="fa fa-exclamation-triangle text-warning mb-2"></i>
          <div className="text-danger small">{error}</div>
        </div>
      );
    }

    if (customContent) {
      return customContent;
    }

    const data = user;
    if (!data) {
      return (
        <div className="text-center py-3">
          <i className="fa fa-user text-muted mb-2"></i>
          <div className="text-muted small">User data not available</div>
        </div>
      );
    }

    return mode === 'member' ? renderMemberContent(data) : renderUserContent(data);
  };

  // Create portal target if it doesn't exist
  useEffect(() => {
    if (!document.getElementById('hover-card-portal')) {
      const portalDiv = document.createElement('div');
      portalDiv.id = 'hover-card-portal';
      document.body.appendChild(portalDiv);
    }
  }, []);

  const HoverCardPortal = () => {
    if (!position.visible) return null;

    return createPortal(
      <div
        ref={cardRef}
        className="user-hover-card-portal"
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999, // Very high z-index to ensure it's above everything
          pointerEvents: 'none' // Allow clicks to pass through to elements below
        }}
      >
        <Card className="shadow-lg border-0" style={{ 
          width: mode === 'team-management' ? "220px" : "320px", // Smaller width for team-management mode
          pointerEvents: 'auto' 
        }}>
          <Card.Body className="p-3">
            {getCardContent()}
          </Card.Body>
        </Card>
      </div>,
      document.getElementById('hover-card-portal') || document.body
    );
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className="position-relative d-inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </div>
      <HoverCardPortal />
    </>
  );
};

export default UserHoverCard;