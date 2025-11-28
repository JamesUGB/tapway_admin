// src\constants\emergencyColors.js
export const EMERGENCY_COLORS = {
  medical: {
    primary: '#d32f2f', // Colors.red[700]
    light: '#ef5350',
    dark: '#c62828'
  },
  police: {
    primary: '#1976d2', // Colors.blue[700]
    light: '#42a5f5',
    dark: '#1565c0'
  },
  fire: {
    primary: '#f57c00', // Colors.orange[700]
    light: '#ff9800',
    dark: '#ef6c00'
  },
  default: {
    primary: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828'
  }
};

export const getEmergencyColor = (emergencyType) => {
  const type = emergencyType?.toLowerCase();
  return EMERGENCY_COLORS[type] || EMERGENCY_COLORS.default;
};