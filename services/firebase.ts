
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// Fix: Use wildcard import for storage to resolve "no exported member" errors in certain environments
import * as storageModule from 'firebase/storage';

// Helper to get env vars safely
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`] || import.meta.env[key];
  }
  return process.env[key] || process.env[`REACT_APP_${key}`];
};

/**
 * --- DATABASE SETUP INSTRUCTIONS ---
 * 1. Open your Firebase Console.
 * 2. Copy your Web App configuration object.
 * 3. Replace the strings below with your actual values.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBhPfMhrmBDaC7_8ciBSHnBfHmTPOVx8iM",
  authDomain: "gen-lang-client-0299624099.firebaseapp.com",
  projectId: "gen-lang-client-0299624099",
  storageBucket: "gen-lang-client-0299624099.firebasestorage.app",
  messagingSenderId: "314044401442",
  appId: "1:314044401442:web:558f3a7a88617a0265077b",
  measurementId: "G-5QHG4THRD7"
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
// Fix: Using any for the storage variable to bypass named type export errors
let storage: any | undefined;

// Check if the user has provided real keys (not the default placeholders)
const hasValidConfig = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("AIzaSyCX3Z6");

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Fix: Access getStorage via wildcard import to bypass named export resolution issues
    storage = (storageModule as any).getStorage(app);
    console.log("🔥 Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { auth, db, storage };
export const isFirebaseReady = !!db;
export const configStatus = hasValidConfig ? 'connected' : 'local';