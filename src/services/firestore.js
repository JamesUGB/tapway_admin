// src/services/firestore.js
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc,
  addDoc,
  orderBy,
  limit,
  startAfter,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { DEPARTMENTS } from '../constants/departments';
import { EMERGENCY_STATUS } from '../constants/emergencyStatus';

// User Operations
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUserRole = async (uid, role) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
};

// Emergency Operations
export const getEmergencies = async ({
  status = null,
  department = null,
  limitCount = 10,
  lastDoc = null,
  sortField = 'createdAt',
  sortDirection = 'desc'
} = {}) => {
  try {
    let q = query(collection(db, 'emergencies'));
    
    // Add filters
    if (status) q = query(q, where('status', '==', status));
    if (department) q = query(q, where('department', '==', department));
    
    // Add sorting
    q = query(q, orderBy(sortField, sortDirection));
    
    // Add pagination
    if (lastDoc) q = query(q, startAfter(lastDoc));
    q = query(q, limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const emergencies = [];
    
    querySnapshot.forEach((doc) => {
      emergencies.push({
        id: doc.id,
        ...normalizeEmergencyData(doc.data())
      });
    });
    
    return {
      data: emergencies,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    throw error;
  }
};

export const getEmergencyById = async (id) => {
  try {
    const docRef = doc(db, 'emergencies', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeEmergencyData(docSnap.data());
    }
    return null;
  } catch (error) {
    console.error('Error fetching emergency:', error);
    throw error;
  }
};

export const createEmergency = async (emergencyData) => {
  const docRef = await addDoc(collection(db, 'emergencies'), {
    ...emergencyData,
    status: EMERGENCY_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getEmergenciesByDepartment = async (department) => {
  if (!Object.values(DEPARTMENTS).includes(department)) return [];
  
  const q = query(collection(db, 'emergencies'), where('department', '==', department));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizeEmergencyData({ id: doc.id, ...doc.data() }));
};

export const getEmergenciesByUser = async (userId) => {
  const q = query(collection(db, 'emergencies'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizeEmergencyData({ id: doc.id, ...doc.data() }));
};

export const updateEmergencyStatus = async (id, status, changedBy = 'system', assignedTo = null) => {
  const emergencyRef = doc(db, 'emergencies', id);
  const timestamp = new Date().toISOString();
  
  await updateDoc(emergencyRef, {
    status,
    ...(assignedTo && { assignedTo }),
    updatedAt: timestamp,
    statusHistory: arrayUnion({
      status,
      timestamp,
      changedBy
    })
  });
};

// Helper function to normalize emergency data structure
const normalizeEmergencyData = (data) => {
  return {
    id: data.id,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    userId: data.userId,
    userInfo: data.userInfo || null,
    location: {
      coordinates: data.location?.coordinates || null,
      address: {
        street: data.location?.street || data.location?.address?.street || null,
        barangay: data.location?.barangay || data.location?.address?.barangay || null,
        city: data.location?.city || data.location?.address?.city || null,
        province: data.location?.province || data.location?.address?.province || null,
        landmark: data.location?.landmark || data.location?.address?.landmark || null,
        formatted: data.location?.formattedAddress || data.location?.address?.formatted || null
      },
      accuracy: data.location?.accuracy || null
    },
    emergencyType: data.emergencyType || null,
    department: data.department || null,
    description: data.description || null,
    media: {
      images: data.media?.images || [],
      audio: data.media?.audio || null,
      video: data.media?.video || null
    },
    status: data.status || EMERGENCY_STATUS.PENDING,
    statusHistory: data.statusHistory || [],
    assignedResponders: data.assignedResponders || data.assignedTo ? [{
      responderId: data.assignedTo,
      assignedAt: data.updatedAt,
      status: 'assigned',
      department: data.department
    }] : [],
    responseNotes: data.responseNotes || [],
    verification: {
      userVerified: data.verification?.userVerified || false,
      deviceVerified: data.verification?.deviceVerified || false,
      locationVerified: data.verification?.locationVerified || false,
      prankScore: data.verification?.prankScore || 0
    }
  };
};