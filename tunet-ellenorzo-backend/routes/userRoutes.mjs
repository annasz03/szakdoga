import { admin } from '../config/firebase.mjs';
import express from 'express';
import { db } from '../config/firebase.mjs';
import nodemailer from 'nodemailer';
import multer from 'multer';
const upload = multer();


const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'szaboanna631@gmail.com',
    pass: 'lorh nlis yxec fwmj'
  }
});

// get user by id - kesz
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


//kesz
router.post('/get-user-profile-picture', async (req, res) => {
  const { uid } = req.body;
    const snapshot = await db.collection('users').where('uid', '==', uid).get();
    const userDoc = snapshot.docs[0].data();

    res.status(200).send({ user: { profilepic: userDoc.profilepic } });
});

//kesz
//get user filter
router.post('/get-user-search', async (req, res) => {
  const { search = '', page = 0, pageSize = 10 } = req.body;
  const p = parseInt(page, 10);
  const ps = parseInt(pageSize, 10);

  const snapshot = await db.collection('users').get();
  const matched = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.username?.toLowerCase().includes(search.toLowerCase()));

  const totalCount = matched.length;

  const start = p * ps;
  const end   = start + ps;
  const pageOfUsers = matched.slice(start, end);

  return res.json({
    users: pageOfUsers,
    totalCount
  });
});
//kesz
router.post('/get-username-by-id', async (req, res) => {
    const { uid } = req.body;

    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    const userData = doc.data();
    const username = userData?.username || null;

    res.status(200).json({ username });
});

//kesz
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


//kesz
//add user
router.post('/register', async (req, res) => {
  const { email, password, username, birth, gender } = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      emailVerified: false
    });

    const user = db.collection('users').doc(userRecord.uid);
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);

    transporter.sendMail({
      from: 'Tünetellenőrző',
      to: email,
      subject: 'Email megerősítés',
      html: `Erősítsd meg az email címed: <a href="${verificationLink}">Link</a>`
    });

    user.set({
      uid: userRecord.uid,
      email,
      username,
      birth,
      gender,
      documents: [],
      role: "user"
    });

    res.status(200).json({ success: true, uid: userRecord.uid});
});

//kesz
//update user
router.post('/update-user', async (req, res) => {
  const { uid, email, password, username, birth, gender, } = req.body;
    const updateData = {};

    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (username) updateData.displayName = username;

    await admin.auth().updateUser(uid, updateData);

    const userRef = db.collection('users').doc(uid);

    const firestoreUpdateData = {};
    if (email){
      firestoreUpdateData.email = email;
    } 
    if (username){
      firestoreUpdateData.username = username;
    } 
    if (birth){
      firestoreUpdateData.birth = birth;
    } 
    if (gender){
      firestoreUpdateData.gender = gender;
    } 

    await userRef.update(firestoreUpdateData);

    res.status(200).send({ message: 'updated' });
});


//kesz
// delete user
router.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
    await admin.auth().deleteUser(uid);

    const userRef = db.collection('users').doc(uid);
    await userRef.delete();

    res.status(200).send({ message: 'deleted' });
});
//kesz
//delet doc
router.post('/delete-doctor-profile', async (req, res) => {
  const { uid } = req.body;

    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('uid', '==', uid).limit(1).get();

    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({role: 'user'});

    const doctorsRef = db.collection('doctors');
    const doctorSnapshot = await doctorsRef.where('uid', '==', uid).limit(1).get();

    const doctorDoc = doctorSnapshot.docs[0];
    await doctorDoc.ref.delete();

    res.status(200).send({ message: 'deleted' });
  }
);

//kesz
// get-user-data-by-username
router.post('/api/get-user-data-by-username', async (req, res) => {
  const { displayName } = req.body;

    const snapshot = await db.collection('users').where('username', '==', displayName).get();
    const doc = snapshot.docs[0];
    const userData = doc.data();

    res.status(200).send({ userId: doc.id, role: userData.role, username: userData.username});
});
//kesz
router.post('/get-profile', async (req, res) => {
  const { uid } = req.body;
  const snapshot = await db.collection('users').where('uid', '==', uid).get();

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  res.status(200).send({
    displayName: userData.username,
  });
});

//kesz
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


//kesz
router.get('/export-results', async (req, res) => {
    const { lang = 'hu', keys } = req.query;

    const keyList = keys.split(',');
    const collectionName = lang === 'en' ? 'diseases_en' : 'diseases_hu';
    const results = [];

    const promises = keyList.map(async (key) => {
      const docRef = db.collection(collectionName).doc(key);
      const snapshot = await docRef.get();
      results.push({ id: key, ...snapshot.data() });
    });

    await Promise.all(promises);
    res.status(200).json(results);
});

//kesz
router.post('/upload-profilepic', upload.single('file'), async (req, res) => {
    const file = req.file;
    const userId = req.body.userId;
    const base64Data = file.buffer.toString('base64');
    const fileType = file.mimetype;

    const profilePicData = `data:${fileType};base64,${base64Data}`;

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('uid', '==', userId).get();
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      profilepic: profilePicData,
    });

    res.status(200).send({ message: 'success' });
});


export default router;
