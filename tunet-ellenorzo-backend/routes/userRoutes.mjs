import { admin } from '../config/firebase.mjs';
import express from 'express';
import { db } from '../config/firebase.mjs';
import nodemailer from 'nodemailer';


const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'szaboanna631@gmail.com',
    pass: 'lorh nlis yxec fwmj'
  }
});

//get all user
router.get('/get-all-users', async (req, res) => {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).send({ users });
});

//get user
// get specific user by uid
router.post('/get-user', async (req, res) => {
  const { uid } = req.body;
    const snapshot = await db.collection('users').where('uid', '==', uid).get();

    const userDoc = snapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    res.status(200).send({ user: userData });
});



//get user filter
router.post('/get-user-search', async (req, res) => {
  const { search } = req.body;

    const snapshot = await db.collection('users').get();

    const users = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user =>
        user.username?.toLowerCase().includes(search.toLowerCase())
      );

    res.status(200).send({ users });
});


//add user
router.post('/register', async (req, res) => {
  const { email, password, username, birth, gender } = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      emailVerified: false
    });

    const userRef = db.collection('users').doc(userRecord.uid);

    const verificationLink = await admin.auth().generateEmailVerificationLink(email);

    await transporter.sendMail({
      from: 'Tünetellenőrző',
      to: email,
      subject: 'Email megerősítés',
      html: `<p>Kérlek erősítsd meg az email címed: <a href="${verificationLink}">Kattints ide</a></p>`
    });

    await userRef.set({
      uid: userRecord.uid,
      email,
      username,
      birth,
      gender,
      documents: [],
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ 
      success: true,
      uid: userRecord.uid 
    });
});


//update user
router.post('/update-user', async (req, res) => {
  const { uid, email, password, username, birth, gender, } = req.body;
  try {
    const updateData = {};

    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (username) updateData.displayName = username;

    await admin.auth().updateUser(uid, updateData);

    const userRef = db.collection('users').doc(uid);

    const firestoreUpdateData = {};
    if (email) firestoreUpdateData.email = email;
    if (username) firestoreUpdateData.username = username;
    if (birth) firestoreUpdateData.birth = birth;
    if (gender) firestoreUpdateData.gender = gender;

    await userRef.update(firestoreUpdateData);

    res.status(200).send({ message: 'User updated' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ error: 'Error updating user', details: error.message });
  }
});



//delete user
router.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
  try {
    await admin.auth().deleteUser(uid);
    const userRef = db.collection('users').doc(uid);
    await userRef.deleteUser(uid)
    res.status(200).send({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Error deleting user', details: error });
  }
});
//delet doc
router.post('/delete-doctor-profile', async (req, res) => {
  const { uid } = req.body;

    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('uid', '==', uid).limit(1).get();

    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({ 
      role: 'user' 
    });

    const doctorsRef = db.collection('doctors');
    const doctorSnapshot = await doctorsRef.where('uid', '==', uid).limit(1).get();

    const doctorDoc = doctorSnapshot.docs[0];
    await doctorDoc.ref.delete();

    res.status(200).send({ message: 'error deleting doctor' });
  }
);


export default router;
