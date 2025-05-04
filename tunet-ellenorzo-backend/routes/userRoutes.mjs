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

router.post('/get-username-by-id', async (req, res) => {
    const { uid } = req.body;

    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    const userData = doc.data();
    const username = userData?.username || null;

    res.status(200).json({ username });
});


//get saved results
router.post('/get-user-saved-results', async (req, res) => {
  const { uid } = req.body;
    const snapshot = await db.collection('savedResults').where('uid', '==', uid).get();

    if (snapshot.empty) {
      return res.status(200).json({ savedDiseases: [] });
    }

    const savedDiseases = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const resultMap = data.resultMap;

      if (Array.isArray(resultMap)) {
        savedDiseases.push(resultMap);
      } else if (typeof resultMap === 'object' && resultMap !== null) {
        Object.values(resultMap).forEach((item) => {
          if (typeof item === 'string') {
            savedDiseases.push([item]);
          } else if (Array.isArray(item)) {
            savedDiseases.push(item);
          }
        });
      }
    });

    res.status(200).json({ savedDiseases });
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



// delete user
router.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
    await admin.auth().deleteUser(uid);

    const userRef = db.collection('users').doc(uid);
    await userRef.delete();

    res.status(200).send({ message: 'User deleted' });
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

// get-user-data-by-username
router.post('/api/get-user-data-by-username', async (req, res) => {
  const { displayName } = req.body;

    const snapshot = await db.collection('users').where('username', '==', displayName).get();
    const doc = snapshot.docs[0];
    const userData = doc.data();

    res.status(200).send({ userId: doc.id, role: userData.role, username: userData.username});
});

router.post('/get-profile', async (req, res) => {
  const { uid } = req.body;
  const snapshot = await db.collection('users').where('uid', '==', uid).get();

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  res.status(200).send({
    displayName: userData.username,
  });
});

router.post('/get-username-by-uid', async (req, res) => {
  const { uid } = req.body;

    const snapshot = await db.collection('users').where('uid', '==', uid).get();
    const userDoc = snapshot.docs[0];
    const username = userDoc.data().username;

    res.status(200).send({ username });
});

router.post('/api/get-user-search', async (req, res) => {
    const { search, page = 1, pageSize = 10 } = req.body;
    const offset = (page - 1) * pageSize;

    let query = db.collection('users')
                  .where('username', '>=', search)
                  .where('username', '<=', search + '\uf8ff')
                  .limit(pageSize)
                  .offset(offset);

    const snapshot = await query.get();
    const totalSnapshot = await db.collection('users').where('username', '>=', search).where('username', '<=', search + '\uf8ff').get();

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json({
      users,
      totalCount: totalSnapshot.data().count
    });
});

router.post('/saved-results', async (req, res) => {
    const { result, uid } = req.body;

    const tempNames = result.map(item => item.key);
    const resultMap = {};

    tempNames.forEach((name, index) => {
      resultMap[index + 1] = name;
    });

    const newDocRef = db.collection('savedResults').doc();
    await newDocRef.set({
      resultMap,
      timestamp: new Date(),
      uid
    });

    res.status(200).json({ message: 'saved' });
});

router.get('/export-results', async (req, res) => {
    const { lang = 'hu', keys } = req.query;

    const keyList = keys.split(',');
    const collectionName = lang === 'en' ? 'diseases_en' : 'diseases_hu';
    const results = [];

    const promises = keyList.map(async (key) => {
      const docRef = db.collection(collectionName).doc(key);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        results.push({ id: key, ...snapshot.data() });
      }
    });

    await Promise.all(promises);
    res.status(200).json(results);
});

export default router;
