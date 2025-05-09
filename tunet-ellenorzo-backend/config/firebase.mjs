import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

let db;
let messaging;

async function initializeFirebase() {
    const serviceAccount = await readFile('C:/prog/szakdoga/tunet-ellenorzo-backend/tunet-ellenorzo-f8999-firebase-adminsdk-jdbfu-e892ce01ac.json', 'utf-8');
    const parsedServiceAccount = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });

    db = admin.firestore();
    messaging = admin.messaging();
}

await initializeFirebase();

export { db, messaging, admin };