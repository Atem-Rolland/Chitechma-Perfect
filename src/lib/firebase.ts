
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getStorage, FirebaseStorage } from 'firebase/storage'; // If using Firebase Storage

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Check for critical Firebase configuration variables before attempting to initialize
if (!firebaseApiKey) {
  throw new Error(
    "CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Firebase cannot be initialized. Please check your environment variable configuration (e.g., .env.local file, and ensure it's prefixed with NEXT_PUBLIC_)."
  );
}
if (!firebaseProjectId) {
  // Although the original error was about API key, project ID is also critical.
  throw new Error(
    "CRITICAL: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or undefined. " +
    "Firebase cannot be initialized. Please check your environment variable configuration."
  );
}
// You could add checks for other firebaseConfig fields if they are essential for your app's initialization.

const firebaseConfig = {
  apiKey: firebaseApiKey, // Use the checked variable
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseProjectId, // Use the checked variable
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  // If initializeApp fails (e.g., due to fundamentally malformed config even if keys are present),
  // it will throw an error here.
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// If the API key was present but *invalid*, getAuth() or other Firebase service calls will likely fail.
// The FirebaseError (auth/invalid-api-key) indicates this scenario.
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// const storage: FirebaseStorage = getStorage(app); // If using Firebase Storage

export { app, auth, db };
// export { app, auth, db, storage }; // If using Firebase Storage
