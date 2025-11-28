// src/services/storage.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadIdImage = async (uid, file) => {
  const storageRef = ref(storage, `user_ids/${uid}/${Date.now()}.jpg`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};