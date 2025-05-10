import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let db;
let messaging;

async function initializeFirebase() {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    messaging = admin.messaging();
}

await initializeFirebase();

export { db, messaging, admin };
