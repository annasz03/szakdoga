import { admin } from '../config/firebase.mjs';
import express from 'express';
import { db } from '../config/firebase.mjs';

const router = express.Router();

router.post('/delete-alert', async (req, res) => {
  const { alertId } = req.body;
  const alertRef = db.collection('alerts').doc(alertId);
  await alertRef.delete();
  res.status(200).send({ message: "torolve"});
});

router.post('/get-alerts', async (req, res) => {
  const { uid } = req.body;
  const alertsRef = db.collection('alerts');
  const snapshot = await alertsRef.where('uid', '==', uid).get();
  const alerts = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    uid: data['uid'],
    createdAt: data['createdAt'],
    fcmToken: data['fcmToken'],
    frequency: data['frequency'],
    isActive: data['isActive'],
    name: data['name'],
    times: data['times']
  };
  });
  
  res.status(200).send({ alerts });
  });


router.post('/save-alert', async (req, res) => {
  const { uid, frequency, times, name, createdAt, fcmToken, isActive, id } = req.body;
  const alertData = {
    uid,
    frequency,
    times,
    name,
    createdAt,
    fcmToken,
    isActive
  };
  let result;
  if (id) {
    const alertRef = db.collection('alerts').doc(id);
    await alertRef.update(alertData);
    result = { ...alertData, id };
  } else {
    const alertRef = db.collection('alerts');
    const newAlertRef = await alertRef.add(alertData);
    result = { ...alertData, id: newAlertRef.id };
  }
  
  res.status(200).send({ alert: result });
  });
  
  

export default router;
