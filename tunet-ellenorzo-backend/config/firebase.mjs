import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

let db;
let messaging;

async function initializeFirebase() {
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const parsedServiceAccount = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });

    db = admin.firestore();
    messaging = admin.messaging();
}

await initializeFirebase();

export { db, messaging, admin };