// src/utils/memberHelpers.js
import { parseDate, isValidDate } from './dateHelpers';
import { formatDateForPassword } from './dateHelpers';

export const generateEmployeeId = (department, dob, yearRegistered) => {
  if (!department) {
    console.warn('No department provided for employee ID generation');
    department = 'UNK';
  }
  
  const [month, day, year] = dob.split('/');
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  const birthYearLastTwo = year.slice(-2);
  const dobPart = `${formattedMonth}${formattedDay}${birthYearLastTwo}`;
  const yearPart = yearRegistered.toString().slice(-2);
  const uniquePart = Math.random().toString(36).substring(2, 9);
  
  return `${department}-${dobPart}${yearPart}-${uniquePart}`;
};

export const generateUsername = (firstName, lastName) => {
  // Remove special characters and spaces, convert to lowercase
  const cleanFirstName = firstName.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const cleanLastName = lastName.replace(/[^a-zA-Z]/g, '').toLowerCase();
  return `${cleanFirstName}${cleanLastName}`;
};

export const generatePassword = (dateOfBirth, registrationYear) => {
  // Format: DDMMYYYY + last 2 digits of registration year
  const date = new Date(dateOfBirth);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const yearPart = registrationYear.toString().slice(-2);
  
  return `${day}${month}${year}${yearPart}`;
};

export const calculateAge = (dob) => {
  if (!dob) return "N/A";
  
  try {
    const birthDate = parseDate(dob);
    
    if (!birthDate || !isValidDate(birthDate)) {
      return "N/A";
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return "N/A";
  }
};

export const formatFullName = (firstName, middleName, lastName) => {
  const middle = middleName ? ` ${middleName} ` : ' ';
  return `${firstName}${middle}${lastName}`;
};

export const getMemberDisplayInfo = (member) => {
  if (!member) return { age: "N/A", gender: "N/A", contact: "N/A", address: "N/A" };
  
  return {
    age: calculateAge(member.dateOfBirth),
    gender: member.gender || "N/A",
    contact: member.contactNumber || "N/A",
    address: member.homeAddress || "N/A"
  };
};