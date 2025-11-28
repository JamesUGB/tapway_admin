// src/utils/dateHelpers.js

/**
 * Robust date parser that handles multiple formats and null/undefined values
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Handle Firestore Timestamp objects
    if (dateString.toDate && typeof dateString.toDate === 'function') {
      return dateString.toDate();
    }
    
    // Handle Date objects
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Handle string formats
    if (typeof dateString === 'string') {
      // Try ISO format first (YYYY-MM-DD)
      if (dateString.includes('-')) {
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) return isoDate;
      }
      
      // Try MM/DD/YYYY or DD/MM/YYYY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Try MM/DD/YYYY format (US)
          const usDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
          if (!isNaN(usDate.getTime())) return usDate;
          
          // Try DD/MM/YYYY format (EU)
          const euDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(euDate.getTime())) return euDate;
        }
      }
      
      // Try any other format that Date constructor can handle
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) return fallbackDate;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// date helper for password generation
export const formatDateForPassword = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

/**
 * Check if a date is valid
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};