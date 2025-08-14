// src/services/auth.js
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { ROLES, isAdminRole } from '../constants/roles';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verify user exists in Firestore and has admin role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, error: "User not authorized" };
    }
    
    const userData = userDoc.data();
    if (!isAdminRole(userData.role)) {
      await signOut(auth);
      return { success: false, error: "Admin access required" };
    }
    
    return { 
      success: true, 
      user: { 
        ...user, 
        ...userData,
        isSuperAdmin: userData.role === ROLES.SUPER_ADMIN
      } 
    };
  } catch (error) {
    let errorMessage = "Login failed";
    if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Account temporarily locked. Try again later or reset password";
    }
    return { success: false, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        callback({ 
          ...user, 
          ...userData,
          isSuperAdmin: userData.role === ROLES.SUPER_ADMIN
        });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};