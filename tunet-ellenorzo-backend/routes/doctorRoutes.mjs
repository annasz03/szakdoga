//ua majnem mint a user

import { admin } from '../config/firebase.mjs';
import express from 'express';
import { db } from '../config/firebase.mjs';

const router = express.Router();

//get doctor
router.get('/get-all-doctors', async (req, res) => {
    const snapshot = await db.collection('doctors').get();

    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).send({ doctors });
});

router.post('/delete-doctor-profile', async (req, res) => {
    const doctorsRef = await db.collection('doctors').get();

    const doctorSnapshot = await doctorsRef.where('uid', '==', uid).limit(1).get();

    const doctorDoc = doctorSnapshot.docs[0];

    await doctorDoc.ref.update({
      name,
      city,
      address,
      phone,
      specialty
    });

    res.status(200).send("doctor succesfully deleted");
})
export default router;
