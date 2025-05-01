import express from 'express';
import { loadSymptomTranslations } from '../services/symptomService.mjs';
import { processData, orderResult } from '../utils/processData.mjs';
import { db } from '../config/firebase.mjs';

const router = express.Router();

router.post('/diseases', async (req, res) => {
  const data = req.body;
  const language = data.language || 'hu';
  const collectionName = language === 'en' ? 'disease_en' : 'diseases_hu';

    const translationMap = await loadSymptomTranslations();

    const inputSymptoms = (data.symptoms || []).map(symptom => translationMap[symptom] || symptom);
    const inputPainLocation = data.painLocation || [];

    const snapshot = await db.collection(collectionName).get();
    let result = [];

    snapshot.forEach(doc => {
      const key = doc.id;
      const value = doc.data();

      const currRes = processData({
        ...data,
        symptoms: inputSymptoms,
        painLocation: inputPainLocation
      }, key, value);

      if (currRes > 1) {
        result.push({ key, value, currRes });
      }
    });

    result = orderResult(result);
    res.json({ message: 'Result:', result });
  
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const language = req.query.lang || 'hu';
  const collectionName = language === 'en' ? 'disease_en' : 'diseases_hu';

  try {
    const doc = await db.collection(collectionName).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'cannot find disease' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'error while requesting disease' });
  }
});

//get all symptoms
router.get('/get-all-symptoms', async (req, res) => {
  const { lang } = req.body;
  const sympref = db.collection('symptoms');
  const snapshot = await sympref.get();
  const symptoms = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data[lang]) {
        symptoms.push(data[lang]);
      }
    });

  res.status(200).send(symptoms);
});

//get all pain
router.get('/get-all-pain', async (req, res) => {
  const { lang } = req.body;
  const painRef = db.collection('pain');
  const snapshot = await painRef.get();
  const painList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data[lang]) {
        painList.push(data[lang]);
      }
    });

  res.status(200).send(painList);
});

export default router;
