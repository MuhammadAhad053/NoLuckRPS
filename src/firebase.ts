import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing. Please set VITE_FIREBASE_* environment variables.");
}

console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
console.log("Using Firestore Database ID:", databaseId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with long polling to avoid WebSocket issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

// Test connection to Firestore
import { getDocFromServer, doc } from 'firebase/firestore';
async function testConnection() {
  try {
    // Try to fetch a non-existent document just to check connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection test successful.");
  } catch (error: any) {
    if (error.message && error.message.includes('client is offline')) {
      console.error("CRITICAL: Firestore client is offline. This usually means the Database ID is incorrect.");
      console.error("Current Database ID:", databaseId);
      console.error("Check your VITE_FIREBASE_DATABASE_ID environment variable.");
    } else {
      console.warn("Firestore connection test warning (expected if rules deny access):", error.message);
    }
  }
}
testConnection();
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Try popup first
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Sign in error:", error);
    // If popup is blocked or fails, we could potentially use redirect, 
    // but in many environments popup is better if the user allows it.
    throw error;
  }
};
export const logout = () => signOut(auth);
