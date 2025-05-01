import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

let db;
let messaging;

async function initializeFirebase() {
  try {
    console.log('Initializing Firebase...');
    const serviceAccount = await readFile('C:/prog/szakdoga/tunet-ellenorzo-backend/tunet-ellenorzo-f8999-firebase-adminsdk-jdbfu-bced93a7f8.json', 'utf-8');
    const parsedServiceAccount = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });

    db = admin.firestore();
    messaging = admin.messaging();

    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

await initializeFirebase();

export { db, messaging, admin };