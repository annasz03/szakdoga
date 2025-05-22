//ua majnem mint a user

import { admin } from '../config/firebase.mjs';
import express from 'express';
import { db } from '../config/firebase.mjs';

const router = express.Router();

//kesz
//doc search
router.post('/get-searched-doctors', async (req, res) => {
    const { searchkey } = req.body;
    const doctorsRef = db.collection('doctors');
    const snapshot = await doctorsRef.get();

    const doctors = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';
      const key = searchkey?.toLowerCase() || '';

      if (name.includes(key)) {
        doctors.push({
          id: doc.id,
          name: data.name,
          city: data.city,
          address: data.address,
          phone: data.phone,
          specialty: data.specialty,
          uid: data.uid
        });
      }
    });

    res.status(200).send(doctors);
});

//kesz
router.post('/load-doctors', async (req, res) => {
    const { pageSize, lastVisibleDocId } = req.body;
    let queryRef = db.collection('doctors').orderBy('name').limit(pageSize);
    if (lastVisibleDocId) {
      const lastVisibleDoc = await db.collection('doctors').doc(lastVisibleDocId).get();
      queryRef = queryRef.startAfter(lastVisibleDoc);
    }

    const snapshot = await queryRef.get();
    const doctors = [];

    snapshot.forEach(doc => {
      const docData = doc.data();
      doctors.push({
        id: doc.id,
        name: docData["name"],
        speciality: docData["specialty"],
        city: docData["city"],
        phone: docData["phone"],
        address: docData["address"],
        uid: docData["uid"]
      });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1]?.id;

    res.status(200).send({ doctors, lastVisible });
});

//kesz
router.post('/load-doctors-uid', async (req, res) => {
  const { pageSize, lastVisibleDocId } = req.body;
  let queryRef = db.collection('doctors').where('uid', '!=', null).orderBy('uid').orderBy('name').limit(pageSize);
  if (lastVisibleDocId) {
    const lastVisibleDoc = await db.collection('doctors').doc(lastVisibleDocId).get();
    queryRef = queryRef.startAfter(lastVisibleDoc);
  }

  const snapshot = await queryRef.get();
  const doctors = [];

  snapshot.forEach(doc => {
    const docData = doc.data();
    doctors.push({
      id: doc.id,
      name: docData["name"],
      speciality: docData["specialty"],
      city: docData["city"],
      phone: docData["phone"],
      address: docData["address"],
      uid: docData["uid"]
    });
  });

  const lastVisible = snapshot.docs[snapshot.docs.length - 1]?.id;

  res.status(200).send({ doctors, lastVisible });
});

//kesz
router.post('/load-doctors-next', async (req, res) => {
  const { lastVisibleDocId, pageSize } = req.body;

  let queryRef = db.collection('doctors').orderBy('name').limit(pageSize);

  if (lastVisibleDocId) {
    const lastDoc = await db.collection('doctors').doc(lastVisibleDocId).get();
    queryRef = queryRef.startAfter(lastDoc);
  }

    const snapshot = await queryRef.get();
    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1]?.id;

    res.status(200).json({
      doctors,
      lastVisible: newLastVisible || null
    });
});

//kesz
router.get('/ratings/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
    const ratingsRef = db.collection('ratings');
    const snapshot = await ratingsRef.where('doctorId', '==', doctorId).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const ratings = snapshot.docs.map(doc => doc.data());
    res.status(200).json(ratings);
});

router.delete('/doctors_temp/:id', async (req, res) => {
  const { id } = req.params;
    const docRef = db.collection('doctors_temp').doc(id);
    await docRef.delete();
    res.status(200).json({ message: 'success' });
});

router.post('/doctors_temp/accept', async (req, res) => {
  const { doc, currentUsername } = req.body;
    await db.collection('doctors').add({
      uid: doc.uid,
      name: doc.name,
      phone: doc.phone,
      city: doc.city,
      address: doc.address,
      specialty: doc.specialty,
      profileUrl: doc.profileUrl || '',
      specs: [doc.specialty],
      cities: [doc.city],
      gender: 'unknown',
      available: true
    });
    await db.collection('doctors_temp').doc(doc.id).delete();
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.username === currentUsername) {
        await db.collection('users').doc(doc.uid).update({
          role: 'doctor'
        });
        break;
      }
    }

    res.status(200).json({ message: 'success' });
});

router.get('/init-data', async (req, res) => {
  const { username } = req.query;
    const [areasSnap, specsSnap, usersSnap] = await Promise.all([
      db.collection('areas').get(),
      db.collection('doctor_spec').get(),
      db.collection('users').get()
    ]);

    const area = areasSnap.docs.map(doc => ({
      key: doc.id,
      value: doc.data().name
    }));

    const specList = specsSnap.docs.map(doc => ({
      key: doc.id,
      value: doc.data().name
    }));

    let role = '';
    usersSnap.forEach(doc => {
      if (doc.data().username === username) {
        role = doc.data().role;
      }
    });

    res.status(200).json({
      area,
      specList,
      role
    });
});


router.get('/search-doctors', async (req, res) => {
  const { name, specialty, city } = req.query;
  let queryRef = db.collection('doctors');

  if (specialty) queryRef = queryRef.where('specialty', '==', specialty);
  if (city) queryRef = queryRef.where('city', '==', city);

  queryRef = queryRef.orderBy('name');

  const snapshot = await queryRef.get();
  const searchTerm = name ? name.trim().toLowerCase() : '';

  const doctors = snapshot.docs
    .map(doc => {
      const d = doc.data();
      return {
        id:        doc.id,
        name:      d.name,
        specialty: d.specialty,
        city:      d.city,
        phone:     d.phone,
        address:   d.address
      };
    })
    .filter(doctor =>
      !searchTerm || doctor.name.toLowerCase().includes(searchTerm)
    );

  res.json({ count: doctors.length, data: doctors });
});


router.post('/submit-rating', async (req, res) => {
  const { doctorId, rating, comment, createdBy } = req.body;
    const docRef = await db.collection('ratings').add({
      doctorId,
      rating,
      comment: comment || '',
      createdBy: createdBy || 'anonymous',
      createdAt: new Date()
    });

    res.json({ message: 'saved', id: docRef.id });
});


router.get('/doctors-temp', async (req, res) => {
    const snapshot = await db.collection('doctors_temp').get();
    const doctorsTemp = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      doctorsTemp.push({
        id: doc.id,
        uid: data.uid,
        name: data.name,
        phone: data.phone,
        city: data.city,
        address: data.address,
        specialty: data.specialty,
        createdAt: data.createdAt,
        profileUrl: data.profileUrl || '',
        number: data.number
      });
    });

    res.json(doctorsTemp);
});

router.post('/doctors-temp', async (req, res) => {
  const newDoc = req.body;
    await db.collection('doctors_temp').add(newDoc);
    res.status(200).json({ message: 'success' });
});

router.post('/doctor-data', async (req, res) => {
  const uid = req.body.uid;
    const querySnapshot = await db.collection('doctors').where('uid', '==', uid).limit(1).get();
    const doc = querySnapshot.docs[0];
    const doctorData = { id: doc.id, ...doc.data() };
    return res.status(200).json(doctorData);
});



export default router;
