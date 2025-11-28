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
  onSnapshot,
  startAfter,
  arrayUnion,
  getDoc,
  deleteDoc,
  writeBatch,
  arrayRemove, 
  serverTimestamp 
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

// MEMBER OPERATIONS
export const getMembers = async () => {
  const snapshot = await getDocs(collection(db, 'members'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addMember = async (memberData) => {
  const docRef = await addDoc(collection(db, 'members'), {
    ...memberData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'active',
    personnelPosition: 'Member', // Default position
    dutyStatus: 'Off Duty' // Default duty status
  });
  return docRef.id;
};

export const updateMember = async (memberId, memberData, modifiedBy = null, modifierDepartment = null) => {
  const memberRef = doc(db, 'members', memberId);
  
  // Enforce business rules
  const enforcedData = { ...memberData };
  
  // If member is inactive, force duty status to "Off Duty"
  if (enforcedData.status === 'inactive') {
    enforcedData.dutyStatus = 'Off Duty';
  }
  
  // If updating duty status for inactive member, block it
  const currentMember = await getDoc(memberRef);
  if (currentMember.exists()) {
    const currentData = currentMember.data();
    if (currentData.status === 'inactive' && enforcedData.dutyStatus && enforcedData.dutyStatus !== 'Off Duty') {
      throw new Error('Cannot change duty status of inactive members');
    }
  }
  
  await updateDoc(memberRef, {
    ...enforcedData,
    updatedAt: serverTimestamp(),
    lastModifiedBy: modifiedBy || null,
    lastModifiedDepartment: modifierDepartment || null
  });
};

export const deleteMember = async (memberId) => {
  const memberRef = doc(db, 'members', memberId);
  await deleteDoc(memberRef);
};

export const updateMemberStatus = async (memberId, status) => {
  const memberRef = doc(db, 'members', memberId);
  
  const updateData = { 
    status,
    updatedAt: serverTimestamp()
  };
  
  // If setting to inactive, enforce "Off Duty" status
  if (status === 'inactive') {
    updateData.dutyStatus = 'Off Duty';
  }
  
  await updateDoc(memberRef, updateData);
};

export const getMembersByDepartment = async (department) => {
  if (!department) {
    return await getMembers(); // Return all if no department specified
  }
  
  const q = query(
    collection(db, 'members'),
    where('employeeId', '>=', `${department}-`),
    where('employeeId', '<=', `${department}-\uf8ff`)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update getRoles to ensure memberCount is included
export const getRoles = async () => {
  const snapshot = await getDocs(collection(db, 'roles'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      memberCount: data.memberCount || 0, // Use stored count or default to 0
      ...data
    };
  });
};

export const addRole = async (roleData, createdBy = null, creatorDepartment = null) => {
  const docRef = await addDoc(collection(db, 'roles'), {
    ...roleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDefault: false, // Custom roles are never default
    // Audit trail fields
    createdBy: createdBy || null,
    creatorDepartment: creatorDepartment || null,
    lastModifiedBy: createdBy || null,
    lastModifiedDepartment: creatorDepartment || null
  });
  return docRef.id;
};

export const updateRole = async (roleId, roleData, modifiedBy = null, modifierDepartment = null) => {
  const roleRef = doc(db, 'roles', roleId);
  await updateDoc(roleRef, {
    ...roleData,
    updatedAt: serverTimestamp(),
    // Update audit trail for modifications
    lastModifiedBy: modifiedBy || null,
    lastModifiedDepartment: modifierDepartment || null
  });
};

// update member counts
export const updateRoleMemberCount = async (roleId, memberCount, modifiedBy = null, modifierDepartment = null) => {
  const roleRef = doc(db, 'roles', roleId);
  await updateDoc(roleRef, {
    memberCount: memberCount,
    updatedAt: serverTimestamp(),
    lastModifiedBy: modifiedBy || null,
    lastModifiedDepartment: modifierDepartment || null
  });
};

export const deleteRole = async (roleId, deletedBy = null, deleterDepartment = null) => {
  const roleRef = doc(db, 'roles', roleId);
  
  // Instead of deleting, we can mark as archived for audit purposes
  // Or we can move to a separate collection for deleted roles
  // For now, let's just delete and log the action
  console.log(`Role ${roleId} deleted by ${deletedBy} from department ${deleterDepartment}`);
  
  await deleteDoc(roleRef);
};

export const getRoleByName = async (roleName) => {
  const q = query(
    collection(db, 'roles'),
    where('name', '==', roleName)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get roles created by a specific user
export const getRolesByCreator = async (userId) => {
  const q = query(
    collection(db, 'roles'),
    where('createdBy', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get roles by department
export const getRolesByDepartment = async (department) => {
  const q = query(
    collection(db, 'roles'),
    where('creatorDepartment', '==', department)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUsersByIds = async (userIds) => {
  try {
    if (!userIds.length) return [];
    
    // Firestore doesn't support OR queries with more than 10 items easily,
    // so we'll fetch users one by one or in batches if needed
    const users = [];
    
    for (const userId of userIds) {
      try {
        const user = await getUserById(userId);
        if (user) {
          users.push(user);
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getRoleBasedFilters = (userRole, userDepartment = null) => {
  const filters = {};
  
  // Map department names to consistent format
  const departmentMap = {
    'police': 'PNP',
    'fire': 'BFP',
    'medical': 'MDDRMO'
  };
  
  // If userDepartment is provided, map it
  const mappedDepartment = userDepartment ? departmentMap[userDepartment] || userDepartment : null;
  
  switch (userRole) {
    case 'police_admin':
      filters.department = 'PNP';
      filters.emergencyType = 'police';
      break;
    case 'fire_admin':
      filters.department = 'BFP';
      filters.emergencyType = 'fire';
      break;
    case 'medical_admin':
      filters.department = 'MDDRMO';
      filters.emergencyType = 'medical';
      break;
    case 'super_admin':
      // No filters for super admin - can see everything
      break;
    default:
      // For other roles, use the mapped department
      if (mappedDepartment) {
        filters.department = mappedDepartment;
        
        // Map department to emergency type
        if (mappedDepartment === 'PNP') filters.emergencyType = 'police';
        if (mappedDepartment === 'BFP') filters.emergencyType = 'fire';
        if (mappedDepartment === 'MDDRMO') filters.emergencyType = 'medical';
      }
  }
  
  return filters;
};

// User Management Functions
export const addUser = async (userData) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  });
  return docRef.id;
};

export const updateUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};

export const updateUserStatus = async (userId, status) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    status,
    updatedAt: new Date().toISOString()
  });
};

export const getEmergencyWithUser = async (emergencyId) => {
  try {
    const emergencyDoc = await getDoc(doc(db, 'emergencies', emergencyId));
    if (!emergencyDoc.exists()) {
      return null;
    }
    
    const emergencyData = emergencyDoc.data();
    
    // Get user data
    let userInfo = null;
    if (emergencyData.userId) {
      const userDoc = await getDoc(doc(db, 'users', emergencyData.userId));
      userInfo = userDoc.exists() ? userDoc.data() : null;
    }
    
    return {
      id: emergencyDoc.id,
      ...emergencyData,
      userInfo: userInfo
    };
  } catch (error) {
    console.error('Error fetching emergency with user:', error);
    throw error;
  }
};

// Team Management Functions firestore
export const addTeam = async (teamData) => {
  const docRef = await addDoc(collection(db, 'teams'), teamData);
  return docRef.id;
};

export const getTeams = async () => {
  const snapshot = await getDocs(collection(db, 'teams'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTeam = async (teamId, teamData) => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    ...teamData,
    updatedAt: serverTimestamp()
  });
};

export const deleteTeam = async (teamId) => {
  const teamRef = doc(db, 'teams', teamId);
  await deleteDoc(teamRef);
};

export const getTeamsByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, 'teams'),
      where('department', '==', department)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teams by department:', error);
    throw error;
  }
};

// Team Assignment Functions
export const assignTeamToEmergency = async (emergencyId, teamData, changedBy) => {
  try {
    const emergencyRef = doc(db, 'emergencies', emergencyId);
    const batch = writeBatch(db);

    // Create the team assignment data
    const teamAssignment = {
      responderId: teamData.id,
      assignedAt: new Date(),
      status: 'en_route',
      department: teamData.department,
      teamName: teamData.teamName || teamData.name,
      teamMembers: teamData.members || teamData.memberIds || []
    };

    // Update emergency with team assignment
    const updateData = {
      status: 'assigned_in_progress',
      updatedAt: new Date(),
      statusHistory: arrayUnion({
        status: 'assigned_in_progress',
        timestamp: new Date(),
        changedBy: changedBy,
      }),
      assignedResponders: arrayUnion(teamAssignment),
      team: {
        teamId: teamData.id,
        teamName: teamData.teamName || teamData.name,
        department: teamData.department,
        assignedAt: new Date(),
        assignedBy: changedBy,
        members: teamData.members || teamData.memberIds || []
      }
    };

    batch.update(emergencyRef, updateData);

    // Also update the team document with this emergency assignment
    const teamRef = doc(db, 'teams', teamData.id);
    batch.update(teamRef, {
      activeEmergencies: arrayUnion(emergencyId),
      updatedAt: new Date(),
      status: 'active'
    });

    // ✅ ADD THIS: Create the conversation document when team is assigned
    const conversationId = `emergency_${emergencyId}_team_${teamData.id}`;
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Get emergency data to get the userId
    const emergencyDoc = await getDoc(emergencyRef);
    const emergencyData = emergencyDoc.data();
    
    if (emergencyData && emergencyData.userId) {
      // Create participants array: user + all team members
      const participants = [
        emergencyData.userId, // The user who created the emergency
        ...(teamData.memberIds || []) // All team members
      ];
      
      // Remove duplicates
      const uniqueParticipants = [...new Set(participants)];
      
      batch.set(conversationRef, {
        emergencyId: emergencyId,
        teamId: teamData.id,
        participants: uniqueParticipants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        type: 'emergency_chat',
        emergencyStatus: 'assigned_in_progress'
      });
      
      console.log('✅ Created conversation:', conversationId, 'with participants:', uniqueParticipants);
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error assigning team to emergency:', error);
    throw error;
  }
};

export const getAvailableTeams = async (department) => {
  try {
    console.log('🔍 Searching for teams in department:', department);
    
    const teamsRef = collection(db, 'teams');
    const snapshot = await getDocs(teamsRef);
    
    const allTeams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📋 All teams in database:', allTeams);
    
    // Filter teams by department and status manually
    const availableTeams = allTeams.filter(team => {
      // Check department
      const teamDept = team.department;
      const departmentMatch = teamDept === department;
      
      // Check status - treat empty string as available
      const teamStatus = team.status || '';
      const statusMatch = [
        'available', 'active', 'Available', 'Active', 'ready', 'Ready', ''
      ].includes(teamStatus);
      
      // Check if team has members
      const hasMembers = (team.members && team.members.length > 0) || 
                        (team.memberIds && team.memberIds.length > 0);
      
      console.log(`Team: ${team.teamName || team.name}`, {
        department: teamDept,
        matchesDepartment: departmentMatch,
        status: teamStatus,
        matchesStatus: statusMatch,
        hasMembers: hasMembers
      });
      
      return departmentMatch && statusMatch && hasMembers;
    });
    
    console.log(`✅ Found ${availableTeams.length} available teams for ${department}:`, 
      availableTeams.map(t => ({
        id: t.id,
        name: t.teamName || t.name,
        department: t.department,
        status: t.status,
        members: t.members?.length || t.memberIds?.length || 0
      }))
    );
    
    return availableTeams;
  } catch (error) {
    console.error('❌ Error fetching available teams:', error);
    throw error;
  }
};

export const getTeamDetails = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (teamDoc.exists()) {
      return { id: teamDoc.id, ...teamDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching team details:', error);
    throw error;
  }
};

export const getEmergenciesWithDetails = async (options = {}, userRole = null, userDepartment = null) => {
  const {
    department = null,
    status = null,
    limitCount = 20,
    lastDoc = null,
    include = []
  } = options;

  try {
    let q = query(collection(db, 'emergencies'));
    
     // Apply role-based filters if userRole is provided
    if (userRole && userRole !== 'super_admin') {
      const roleFilters = getRoleBasedFilters(userRole, userDepartment);
      
      if (roleFilters.department) {
        q = query(q, where('department', '==', roleFilters.department));
      }
      
      if (roleFilters.emergencyType) {
        q = query(q, where('emergencyType', '==', roleFilters.emergencyType));
      }
    }
    
    // Apply additional filters from options
    if (department && (!userRole || userRole === 'super_admin')) {
      q = query(q, where('department', '==', department));
    }
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    q = query(q, limit(limitCount));
    
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    const data = snapshot.docs.map(doc => {
      const emergencyData = doc.data();
      return {
        id: doc.id,
        ...normalizeEmergencyData(emergencyData)
      };
    });
    
    // Fetch user data for all emergencies
    const userIds = [...new Set(data.map(emg => emg.userId).filter(Boolean))];
    const users = await getUsersByIds(userIds);
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    // Enhance emergencies with user data
    const enhancedData = data.map(emg => ({
      ...emg,
      userInfo: userMap[emg.userId] || null
    }));
    
    return { data: enhancedData, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error fetching emergencies with details:', error);
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

  // function to handle team cleanup
  export const updateEmergencyStatus = async (id, status, changedBy = 'system', assignedTo = null, notes = '') => {
    const emergencyRef = doc(db, 'emergencies', id);
    const timestamp = new Date().toISOString();
    
    const updateData = {
      status,
      updatedAt: timestamp,
      statusHistory: arrayUnion({
        status,
        timestamp,
        changedBy,
        ...(notes && { notes })
      })
    };
    
    // Add assigned responder if provided
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      updateData.assignedResponders = arrayUnion({
        responderId: assignedTo,
        assignedAt: timestamp,
        status: 'assigned'
      });
    }
    
    // Add response note if provided
    if (notes) {
      updateData.responseNotes = arrayUnion({
        note: notes,
        addedBy: changedBy,
        timestamp,
        noteType: 'status_update'
      });
    }
    
    // If resolving, set resolvedAt and remove from team's active emergencies
    if (status === 'resolved' || status === 'cancelled') {
      updateData.resolvedAt = timestamp;
      
      // Get current emergency data to check for team assignment
      const emergencyDoc = await getDoc(emergencyRef);
      const emergencyData = emergencyDoc.data();
      
      if (emergencyData.team && emergencyData.team.teamId) {
        const teamRef = doc(db, 'teams', emergencyData.team.teamId);
        await updateDoc(teamRef, {
          activeEmergencies: arrayRemove(id),
          updatedAt: serverTimestamp(),
          status: 'available' // Set team back to available
        });
      }
    }
    
    await updateDoc(emergencyRef, updateData);
  };

  export const getEmergenciesRealtime = (config = {}, userRole = null, userDepartment = null, onUpdate, onError) => {
    const {
      status = null,
      department = null,
      limit: limitCount = 50,
      lastDoc = null
    } = config;

    try {
      let q = collection(db, 'emergencies');
      const constraints = [];
      
      // Apply role-based filters if userRole is provided (from getEmergenciesWithDetails)
      if (userRole && userRole !== 'super_admin') {
        const roleFilters = getRoleBasedFilters(userRole, userDepartment);
        
        if (roleFilters.department) {
          constraints.push(where('department', '==', roleFilters.department));
        }
        
        if (roleFilters.emergencyType) {
          constraints.push(where('emergencyType', '==', roleFilters.emergencyType));
        }
      }
      
      // Apply additional filters from options
      if (department && (!userRole || userRole === 'super_admin')) {
        constraints.push(where('department', '==', department));
      }
      
      // Status filter
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      // Order by creation date (newest first)
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Apply pagination
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      
      // Limit results
      constraints.push(limit(limitCount));
      
      // Create the query
      q = query(q, ...constraints);
      
      const unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          try {
            // Process emergencies (same as getEmergenciesWithDetails)
            const data = querySnapshot.docs.map(doc => {
              const emergencyData = doc.data();
              return {
                id: doc.id,
                ...normalizeEmergencyData(emergencyData)
              };
            });
            
            // Fetch user data for all emergencies (same as getEmergenciesWithDetails)
            const userIds = [...new Set(data.map(emg => emg.userId).filter(Boolean))];
            const users = await getUsersByIds(userIds);
            const userMap = {};
            users.forEach(user => {
              userMap[user.id] = user;
            });
            
            // Enhance emergencies with user data (same as getEmergenciesWithDetails)
            const enhancedData = data.map(emg => ({
              ...emg,
              userInfo: userMap[emg.userId] || null,
              citizenInfo: userMap[emg.userId] || null // Add for compatibility
            }));
            
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            
            onUpdate({
              data: enhancedData,
              lastDoc: lastVisible
            });
            
          } catch (processingError) {
            console.error('Error processing real-time data:', processingError);
            onError?.(processingError);
          }
        },
        (error) => {
          console.error('Real-time listener error:', error);
          onError?.(error);
        }
      );
      
      return unsubscribe;
      
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      onError?.(error);
      return () => {};
    }
  };

  // Get emergencies assigned to a specific team
  export const getTeamEmergencies = async (teamId) => {
    try {
      const q = query(
        collection(db, 'emergencies'),
        where('team.teamId', '==', teamId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const emergencies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...normalizeEmergencyData(doc.data())
      }));
      
      // Fetch user data for emergencies
      const userIds = [...new Set(emergencies.map(emg => emg.userId).filter(Boolean))];
      const users = await getUsersByIds(userIds);
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });
      
      // Enhance emergencies with user data
      return emergencies.map(emg => ({
        ...emg,
        userInfo: userMap[emg.userId] || null
      }));
    } catch (error) {
      console.error('Error fetching team emergencies:', error);
      throw error;
    }
  };

  // Get conversations for a team member
  export const getTeamMemberConversations = async (userId) => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        where('type', '==', 'emergency_chat'),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Enhance with emergency and team data
      const enhancedConversations = await Promise.all(
        conversations.map(async (conv) => {
          try {
            // Get emergency data
            const emergencyDoc = await getDoc(doc(db, 'emergencies', conv.emergencyId));
            const emergencyData = emergencyDoc.exists() ? emergencyDoc.data() : null;
            
            // Get team data
            const teamDoc = await getDoc(doc(db, 'teams', conv.teamId));
            const teamData = teamDoc.exists() ? teamDoc.data() : null;
            
            // Get user data (the citizen who created the emergency)
            let userData = null;
            if (emergencyData?.userId) {
              const userDoc = await getDoc(doc(db, 'users', emergencyData.userId));
              userData = userDoc.exists() ? userDoc.data() : null;
            }

            return {
              ...conv,
              emergency: emergencyData ? {
                id: conv.emergencyId,
                ...emergencyData,
                userInfo: userData
              } : null,
              team: teamData ? {
                id: conv.teamId,
                ...teamData
              } : null
            };
          } catch (error) {
            console.error('Error enhancing conversation:', error);
            return conv;
          }
        })
      );

      return enhancedConversations;
    } catch (error) {
      console.error('Error fetching team member conversations:', error);
      throw error;
    }
  };

  // Get messages for a conversation
  export const getConversationMessages = async (conversationId) => {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('sentAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  };

  // Real-time messages listener
  export const subscribeToConversationMessages = (conversationId, callback) => {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('sentAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  };

  // Send message from admin/team member
  export const sendTeamMessage = async (conversationId, messageData) => {
    try {
      const batch = writeBatch(db);
      const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
      
      // Add the message
      batch.set(messageRef, {
        ...messageData,
        id: messageRef.id,
        sentAt: serverTimestamp()
      });

      // Update conversation last message
      const conversationRef = doc(db, 'conversations', conversationId);
      batch.update(conversationRef, {
        lastMessage: {
          text: messageData.text,
          senderId: messageData.senderId,
          sentAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      return messageRef.id;
    } catch (error) {
      console.error('Error sending team message:', error);
      throw error;
    }
  };

  // Get conversation by emergency and team
  export const getEmergencyConversation = async (emergencyId, teamId) => {
    try {
      const conversationId = `emergency_${emergencyId}_team_${teamId}`;
      const docRef = doc(db, 'conversations', conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting emergency conversation:', error);
      throw error;
    }
  };

// Helper function to normalize emergency data structure
const normalizeEmergencyData = (data) => {
  return {
    id: data.id,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    resolvedAt: data.resolvedAt?.toDate?.() || data.resolvedAt || null,
    userId: data.userId,
    userName: data.userName || data.userInfo?.name || null,
    userPhone: data.userPhone || data.userInfo?.phone || null,
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
    emergencyType: data.emergencyType || data.type || null,
    department: data.department || null,
    description: data.description || null,
    remarks: data.remarks || null,
    media: {
      images: data.media?.images || data.imageUrls || [],
      audio: data.media?.audio || null,
      video: data.media?.video || null
    },
    status: data.status || EMERGENCY_STATUS.PENDING,
    statusHistory: data.statusHistory || [],
    assignedResponders: data.assignedResponders || (data.assignedTo ? [{
      responderId: data.assignedTo,
      assignedAt: data.updatedAt,
      status: 'assigned',
      department: data.department
    }] : []),
    responseNotes: data.responseNotes || [],
    verification: {
      userVerified: data.verification?.userVerified || false,
      deviceVerified: data.verification?.deviceVerified || false,
      locationVerified: data.verification?.locationVerified || false,
      prankScore: data.verification?.prankScore || 0
    }
  };
};