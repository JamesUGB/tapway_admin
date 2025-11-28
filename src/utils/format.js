// src/utils/format.js
export const formatShortId = (id) => {
  if (!id) return '-';
  
  // Return the full ID instead of shortening it
  return id;
};

export const formatDateTimeRelative = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();

    // Normalize to local midnight for date-only comparisons
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfGiven = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffMs = startOfToday - startOfGiven;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isSameYear = date.getFullYear() === now.getFullYear();

    // Military (24h) time string
    const timeStr = date.toLocaleString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Today
    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    }

    // Yesterday
    if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    }

    // This week (2–6 days ago)
    if (diffDays >= 2 && diffDays <= 6) {
      return `${dayNames[date.getDay()]} at ${timeStr}`;
    }

    // Last week (7–13 days ago)
    if (diffDays >= 7 && diffDays <= 13) {
      return `Last ${dayNames[date.getDay()]} at ${timeStr}`;
    }

    // This year but older than last week
    if (isSameYear && diffDays > 13) {
      const monthStr = date.toLocaleString('en-PH', { month: 'short' });
      return `${monthStr} ${date.getDate()} at ${timeStr}`;
    }

    // Last year
    if (date.getFullYear() === now.getFullYear() - 1) {
      const monthStr = date.toLocaleString('en-PH', { month: 'short' });
      return `${monthStr} ${date.getDate()}, ${date.getFullYear()} at ${timeStr}`;
    }

    // Older than 1 year
    const monthStr = date.toLocaleString('en-PH', { month: 'long' });
    return `${monthStr} ${date.getDate()}, ${date.getFullYear()} at ${timeStr}`;
    
  } catch (error) {
    return '-';
  }
};

export const formatLocation = (location) => {
  if (!location) return 'Unknown location';
  
  if (typeof location === 'string') return location;
  
  if (location.address?.formatted) return location.address.formatted;
  if (location.address?.street) {
    return [
      location.address.street,
      location.address.barangay,
      location.address.city,
      location.address.province
    ].filter(Boolean).join(', ');
  }
  if (location.coordinates) {
    return `${location.coordinates.lat?.toFixed(4)}, ${location.coordinates.lng?.toFixed(4)}`;
  }
  if (location.formattedAddress) return location.formattedAddress;
  
  return 'Unknown location';
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-PH', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false  // <-- force 24h format
    }).replace(',', ','); // remove unwanted comma from locale
  } catch (error) {
    return '-';
  }
};

export const formatRespondersList = (assignedResponders) => {
  if (!assignedResponders || assignedResponders.length === 0) {
    return 'No responders assigned';
  }
  
  // Handle team assignment format
  const teams = assignedResponders.filter(responder => responder.teamName);
  const individualResponders = assignedResponders.filter(responder => !responder.teamName);
  
  const parts = [];
  
  // Add team information
  if (teams.length > 0) {
    const teamNames = teams.map(team => team.teamName);
    parts.push(`Team: ${teamNames.join(', ')}`);
  }
  
  // Add individual responders
  if (individualResponders.length > 0) {
    const responderNames = individualResponders.map(responder => 
      responder.name || responder.responderId || 'Responder'
    );
    parts.push(responderNames.join(', '));
  }
  
  return parts.join(' | ') || 'No responders assigned';
};

// You can also add a helper function for team-specific formatting
export const formatTeamInfo = (team) => {
  if (!team) return 'No team assigned';
  
  if (typeof team === 'string') return team;
  
  if (team.teamName) {
    const memberCount = team.members?.length || 0;
    return `${team.teamName} (${memberCount} members)`;
  }
  
  return 'Team assigned';
};

export const formatCitizenInfo = (emergency) => {
  if (!emergency) return '-';
  
  // If we have userInfo with complete name
  if (emergency.userInfo) {
    const { firstName, lastName, displayName, name } = emergency.userInfo;
    
    // Try different name fields
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    if (fullName.trim()) return fullName;
    
    if (displayName) return displayName;
    if (name) return name;
  }
  
  // Fallback to embedded user info if available
  if (emergency.userName) {
    return emergency.userName;
  }
  
  // Check if emergency has name fields directly
  if (emergency.firstName || emergency.lastName) {
    return [emergency.firstName, emergency.lastName].filter(Boolean).join(' ');
  }
  
  // Final fallback to user ID with better formatting
  if (emergency.userId) {
    return `Citizen ${formatShortId(emergency.userId)}`;
  }
  
  return 'Unknown citizen';
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if format doesn't match
};

export const formatRemarks = (emergency) => {
  if (!emergency) return '-';
  
  if (emergency.responseNotes?.length > 0) {
    return `${emergency.responseNotes.length} note(s)`;
  }
  
  if (emergency.remarks) {
    return emergency.remarks.length > 50 
      ? `${emergency.remarks.substring(0, 50)}...` 
      : emergency.remarks;
  }
  
  if (emergency.description) {
    return emergency.description.length > 50 
      ? `${emergency.description.substring(0, 50)}...` 
      : emergency.description;
  }
  
  return '-';
};

export const getResolvedAt = (emergency) => {
  if (!emergency) return null;
  
  // Check if there's a specific resolvedAt timestamp
  if (emergency.resolvedAt) return emergency.resolvedAt;
  
  // If status is resolved, use updatedAt as fallback
  if (emergency.status === 'resolved' && emergency.updatedAt) {
    return emergency.updatedAt;
  }
  
  // Check status history for resolution timestamp
  if (emergency.statusHistory) {
    const resolvedEntry = emergency.statusHistory.find(
      entry => entry.status === 'resolved'
    );
    if (resolvedEntry?.timestamp) return resolvedEntry.timestamp;
  }
  
  return null;
};