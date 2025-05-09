import express from 'express';
import { loadSymptomTranslations } from '../services/symptomService.mjs';
import { processData, orderResult } from '../utils/processData.mjs';
import { db } from '../config/firebase.mjs';

const router = express.Router();

router.post('/result', async (req, res) => {
  const data = req.body;
  const language = data.language || 'hu';
  const collectionName = language === 'en' ? 'diseases_en' : 'diseases_hu';

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
    res.json({ message: 'result:', result });
  
});

router.get('/diseases/:lang/:id', async (req, res) => {
  const { lang, id } = req.params;
  const collectionName = lang === 'en' ? 'diseases_en' : 'diseases_hu';
    const doc = await db.collection(collectionName).doc(id).get();

    res.json({ id: doc.id, ...doc.data() });
});


//get all symptoms
router.post('/get-all-symptoms', async (req, res) => {
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
router.post('/get-all-pain', async (req, res) => {
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

//get disease data hu
router.post('/get-disease-data-hu', async (req, res) => {
  const { diseaseId } = req.body;
    const doc = await db.collection('diseases_hu').doc(diseaseId).get();
    const data = doc.data();
    res.status(200).send(data);
});

//get disease data en
router.post('/get-disease-data-en', async (req, res) => {
  const { diseaseId } = req.body;
    const doc = await db.collection('diseases_en').doc(diseaseId).get();
    const data = doc.data();
    res.status(200).send(data);
});

router.post('/save-disease', async (req, res) => {
  const { diseaseData, lang, diseaseId } = req.body;
    const diseaseRef = db.collection(`diseases_${lang}`).doc(diseaseId);
    await diseaseRef.set(diseaseData);

    res.status(200).send({ message: 'A betegség sikeresen elmentve!' });
});

router.post('/delete-disease', async (req, res) => {
  const { diseaseId } = req.body;
    const diseaseRefHu = db.collection('diseases_hu').doc(diseaseId);
    const diseaseRefEn = db.collection('diseases_en').doc(diseaseId);

    await Promise.all([diseaseRefHu.delete(), diseaseRefEn.delete()]);

    res.status(200).send({ message: 'success' });
});
router.post('/api/load-diseases', async (req, res) => {
  try {
    const { pageSize, lastVisiblePostId, lang } = req.body;
    const collectionRef = db.collection(`diseases_${lang}`);
    
    let queryRef = collectionRef.orderBy('name', 'asc').limit(pageSize);
    
    if (lastVisiblePostId) {
      const lastDoc = await collectionRef.doc(lastVisiblePostId).get();
      if (lastDoc.exists) {
        queryRef = queryRef.startAfter(lastDoc);
      }
    }
    const snapshot = await queryRef.get();
    const diseases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const countSnapshot = await collectionRef.count().get();

    res.status(200).json({
      diseases,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id,
      totalCount: countSnapshot.data().count
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post('/api/disease-total-count', async (req, res) => {
  const { lang } = req.body;
  const snapshot = await db.collection(`diseases_${lang}`).count().get();
  res.json({ totalCount: snapshot.data().count });
});

router.get('/get-all-disease-names', async (req, res) => {
    const [huSnapshot, enSnapshot] = await Promise.all([
      db.collection('diseases_hu').get(),
      db.collection('diseases_en').get()
    ]);

    const mergedDiseases = {};

    huSnapshot.forEach(doc => {
      mergedDiseases[doc.id] = {
        name_hu: doc.data().name,
        name_en: ''
      };
    });

    enSnapshot.forEach(doc => {
      if (mergedDiseases[doc.id]) {
        mergedDiseases[doc.id].name_en = doc.data().name;
      } else {
        mergedDiseases[doc.id] = {
          name_hu: '',
          name_en: doc.data().name
        };
      }
    });

    res.status(200).json(mergedDiseases);
  })

export default router;
