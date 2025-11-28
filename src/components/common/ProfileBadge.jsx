// src/components/common/ProfileBadge.jsx
import React from 'react';
import { Badge } from 'react-bootstrap';

const ProfileBadge = ({ 
  firstName, 
  lastName, 
  size = 'md',
  className = '',
  showName = false 
}) => {
  // Generate initials
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Generate consistent gradient based on name
  const generateGradient = () => {
    const nameString = `${firstName}${lastName}`;
    const colors = [
      ['#FF6B6B', '#FFE66D'], // Red to Yellow
      ['#48BB78', '#81E6D9'], // Green to Teal
      ['#4299E1', '#9F7AEA'], // Blue to Purple
      ['#ED8936', '#FBB6CE'], // Orange to Pink
      ['#38B2AC', '#0BC5EA'], // Teal to Cyan
      ['#B794F4', '#F687B3'], // Purple to Pink
    ];
    
    // Simple hash function for consistent color based on name
    let hash = 0;
    for (let i = 0; i < nameString.length; i++) {
      hash = nameString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    
    return `linear-gradient(135deg, ${colors[colorIndex][0]}, ${colors[colorIndex][1]})`;
  };

  // ✅ Define sizes here
  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 40, height: 40, fontSize: 14 },
    lg: { width: 56, height: 56, fontSize: 18 },
    xl: { width: 130, height: 130, fontSize: 50 }
  };

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <Badge
        className="d-flex align-items-center justify-content-center rounded-circle border-0"
        style={{ 
          ...sizeStyles[size], // ✅ Apply dynamic size
          background: generateGradient(),
          color: 'white',
          fontWeight: '600'
        }}
      >
        {getInitials()}
      </Badge>
      {showName && (
        <span className="ms-2">
          {firstName} {lastName}
        </span>
      )}
    </div>
  );
};

export default ProfileBadge;
