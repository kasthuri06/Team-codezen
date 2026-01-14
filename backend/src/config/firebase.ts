import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export const initializeFirebase = (): void => {
  try {
    if (admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Missing Firebase configuration. Please check your environment variables.');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
};

/**
 * Get Firestore database instance
 */
export const getFirestore = () => {
  return admin.firestore();
};

/**
 * Get Firebase Auth instance
 */
export const getAuth = () => {
  return admin.auth();
};