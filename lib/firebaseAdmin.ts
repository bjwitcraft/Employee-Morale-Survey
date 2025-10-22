import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID as string;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL as string;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase Admin env vars');
}

const app = getApps()[0] || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
});

export const db = getFirestore(app);
