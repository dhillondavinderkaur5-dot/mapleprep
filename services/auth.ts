
import * as authModule from 'firebase/auth';
import * as firestoreModule from 'firebase/firestore';
import { auth, db, isFirebaseReady } from './firebase';
import { UserProfile, UserType, SubscriptionDetails, TeacherProfile } from '../types';

const { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail
} = authModule as any;

const { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, increment } = firestoreModule as any;

const ensureAuth = () => {
  if (!isFirebaseReady || !auth) {
    throw new Error("Unable to connect to Canadian Auth Servers. Please check your internet connection or verify your FIREBASE_API_KEY environment variable.");
  }
  return auth;
};

export const updateUserImageUsage = async (uid: string) => {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'subscription.imagesUsedThisMonth': increment(1)
  });
};

export const loginUser = async (email: string, pass: string) => {
  const authInstance = ensureAuth();
  const credential = await signInWithEmailAndPassword(authInstance, email, pass);
  return credential.user;
};

export const registerUser = async (email: string, pass: string) => {
  const authInstance = ensureAuth();
  const credential = await createUserWithEmailAndPassword(authInstance, email, pass);
  return credential.user;
};

export const logoutUser = async () => {
  const authInstance = ensureAuth();
  await signOut(authInstance);
};

export const resetPassword = async (email: string) => {
  const authInstance = ensureAuth();
  await sendPasswordResetEmail(authInstance, email);
};

export const createStaffInvitation = async (email: string, tempPass: string, name: string, role: string, schoolName: string, schoolId: string) => {
  if (!db) return;
  const inviteRef = doc(db, 'staff_invitations', email.toLowerCase().trim());
  await setDoc(inviteRef, {
    email: email.toLowerCase().trim(),
    tempPass,
    name,
    role,
    schoolName,
    schoolId,
    createdAt: new Date().toISOString()
  });
};

export const getSchoolStaff = async (schoolId: string): Promise<TeacherProfile[]> => {
  if (!db) return [];
  
  const staff: TeacherProfile[] = [];
  
  // 1. Get pending invitations
  const inviteQuery = query(collection(db, 'staff_invitations'), where('schoolId', '==', schoolId));
  const inviteSnap = await getDocs(inviteQuery);
  inviteSnap.forEach((doc: any) => {
    const data = doc.data();
    staff.push({
      id: doc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'pending',
      joinedDate: data.createdAt.split('T')[0],
      lessonsCreated: 0
    });
  });

  // 2. Get active teachers linked to this school
  // Note: We'll need to ensure teachers have a schoolId in their profile when they join
  const userQuery = query(collection(db, 'users'), where('schoolId', '==', schoolId), where('type', '==', 'teacher'));
  const userSnap = await getDocs(userQuery);
  userSnap.forEach((doc: any) => {
    const data = doc.data();
    staff.push({
      id: doc.id,
      name: data.name,
      email: data.email,
      role: data.role || 'teaching',
      status: 'active',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      lessonsCreated: data.lessonsCreated || 0
    });
  });

  return staff;
};

export const checkInvitation = async (email: string, pass: string) => {
  if (!db) return null;
  const inviteDoc = await getDoc(doc(db, 'staff_invitations', email.toLowerCase().trim()));
  if (inviteDoc.exists()) {
    const data = inviteDoc.data();
    if (data.tempPass === pass) {
      return data;
    }
  }
  return null;
};

export const claimInvitation = async (email: string) => {
  if (!db) return null;
  const docRef = doc(db, 'staff_invitations', email.toLowerCase().trim());
  const inviteDoc = await getDoc(docRef);
  if (inviteDoc.exists()) {
    const data = inviteDoc.data();
    await deleteDoc(docRef);
    return data;
  }
  return null;
};

export const deleteStaffInvitation = async (email: string) => {
  if (!db) return;
  await deleteDoc(doc(db, 'staff_invitations', email.toLowerCase().trim()));
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (
  user: any, 
  name: string, 
  type: UserType, 
  subscription?: SubscriptionDetails
) => {
  if (!db) throw new Error("Database connection not active.");
  
  const payload: any = {
    id: user.uid,
    name: name || 'User',
    email: user.email || '',
    type: type
  };

  if (subscription !== undefined && subscription !== null) {
    payload.subscription = subscription;
  }

  const finalizedData = JSON.parse(JSON.stringify(payload));
  const userRef = doc(db, 'users', user.uid);
  
  try {
    await setDoc(userRef, finalizedData);
    return finalizedData as UserProfile;
  } catch (error) {
    console.error("Error writing user profile:", error);
    throw error;
  }
};
