import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserType, SubscriptionDetails } from '../types';

export const loginUser = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
};

export const registerUser = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  return credential.user;
};

export const logoutUser = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

/**
 * Creates a user profile in Firestore.
 * This version uses a failsafe method to ensure no 'undefined' values are passed 
 * to Firestore, as they are not supported and will cause a crash.
 */
export const createUserProfile = async (
  user: FirebaseUser, 
  name: string, 
  type: UserType, 
  subscription?: SubscriptionDetails
) => {
  if (!db) throw new Error("Firestore not initialized");
  
  // 1. Build the base profile payload.
  const payload: any = {
    id: user.uid,
    name: name || 'User',
    email: user.email || '',
    type: type
  };

  // 2. Attach subscription only if it has a value.
  if (subscription !== undefined && subscription !== null) {
    payload.subscription = subscription;
  }

  // 3. Failsafe Cleanup: JSON.stringify recursively removes all keys with 'undefined' values.
  // This ensures that even if 'subscription' was undefined, the key is completely removed 
  // from the final object, satisfying Firestore's validation rules.
  const finalizedData = JSON.parse(JSON.stringify(payload));

  const userRef = doc(db, 'users', user.uid);
  
  try {
    await setDoc(userRef, finalizedData);
    return finalizedData as UserProfile;
  } catch (error) {
    console.error("Error writing user profile to Firestore:", error);
    throw error;
  }
};
