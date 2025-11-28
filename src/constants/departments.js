// src\constants\departments.js
export const DEPARTMENTS = {
  PNP: 'PNP',
  BFP: 'BFP', 
  MDDRMO: 'MDDRMO'
};

export const DEPARTMENT_LABELS = {
  [DEPARTMENTS.PNP]: 'Philippine National Police',
  [DEPARTMENTS.BFP]: 'Bureau of Fire Protection',
  [DEPARTMENTS.MDDRMO]: 'MDDRMO', 
  'police': 'Philippine National Police', // mapping for legacy values
  'fire': 'Bureau of Fire Protection',
  'medical': 'MDDRMO'
};