import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/environment.js';

export const initFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return;
  }

  if (env.FIREBASE_PRIVATE_KEY === 'application_default') {
    initializeApp({
      credential: applicationDefault(),
      projectId: env.FIREBASE_PROJECT_ID,
    });
  } else {
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
    });
  }
};

export const firebaseAuth = () => {
  initFirebaseAdmin();
  return getAuth();
};
