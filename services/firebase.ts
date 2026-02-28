
import * as storageModule from 'firebase/storage';
import * as appModule from 'firebase/app';
import * as authModule from 'firebase/auth';
import * as firestoreModule from 'firebase/firestore';

const { initializeApp, getApps } = appModule as any;
const { getAuth } = authModule as any;
const { getFirestore } = firestoreModule as any;

/**
 * FIREBASE CONFIGURATION (Provided by user)
 * This ensures the app connects to the correct project immediately.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBhPfMhrmBDaC7_8ciBSHnBfHmTPOVx8iM",
  authDomain: "gen-lang-client-0299624099.firebaseapp.com",
  projectId: "gen-lang-client-0299624099",
  storageBucket: "gen-lang-client-0299624099.firebasestorage.app",
  messagingSenderId: "314044401442",
  appId: "1:314044401442:web:558f3a7a88617a0265077b",
  measurementId: "G-5QHG4THRD7"
};

let app: any;
let auth: any;
let db: any;
let storage: any;

try {
  // Check if an app is already initialized to prevent duplicate initialization errors
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("%c🔥 Firebase App Initialized", "color: #10b981; font-weight: bold;");
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = (storageModule as any).getStorage(app);
  
} catch (error) {
  console.error("CRITICAL: Firebase failed to initialize with provided config:", error);
}

export { auth, db, storage, firebaseConfig };
export const isFirebaseReady = !!auth && !!db;
