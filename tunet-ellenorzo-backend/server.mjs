import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: ${PORT}`);
});

async function initializeApp() {
  try {
    const serviceAccount = await readFile('C:/prog/szakdoga/tunet-ellenorzo-backend/tunet-ellenorzo-f8999-firebase-adminsdk-jdbfu-6de2a6af13.json', 'utf-8');

    const parsedServiceAccount = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });

  } catch (error) {
    throw error;
  }
}

await initializeApp();

const db = admin.firestore();

async function loadSymptomTranslations() {
  const snapshot = await db.collection('symptoms').get();
  const translationMap = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.hu) translationMap[data.hu] = doc.id;
    if (data.en) translationMap[data.en] = doc.id;
  });

  return translationMap;
}

app.post('/result', async (req, res) => {
  const data = req.body;
  const language = data.language || 'hu';
  const collectionName = language === 'en' ? 'disease_en' : 'diseases_hu';

  try {
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

  } catch (error) {
    res.status(500).json({ error: 'error while connecting to database' });
  }
});

app.get('/diseases/:id', async (req, res) => {
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
    res.status(500).json({ error: 'error while req' });
  }
});

app.get('/diseases/:id', async (req, res) => {
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




function orderResult(result) {
  return result.sort((a, b) => b.currRes - a.currRes);
}

function processData(data, key, value) {
  let matching = 0;

  if (!genderCheck(data.gender, value.gender)) {
    return 0;
  } else {
    matching += ageCheck(data.age, value.age);
    matching += symptomsCheck(data.symptoms, value.symptoms);
    if (data.pain === true && Array.isArray(data.painLocation) && Array.isArray(value.painLocation)) {
      matching += painCheck(data.painLocation, value.painLocation);
    }
  }

  return matching;
}


function ageCheck(inputAge, diseaseAge) {
  if(diseaseAge.age == -1 || (inputAge >= diseaseAge[0] && inputAge <= diseaseAge[1])) {
    return 1;
  }
  return 0;
}

function genderCheck(inputGender, diseaseGender) {
  if(diseaseGender == 'Mindkettő') {
    return true;
  }
  if(inputGender == 'male' && diseaseGender == 'Férfi' || diseaseGender == 'Male') {
    return true;
  }
  if(inputGender == 'female' && diseaseGender == 'Nő' || diseaseGender == 'Female') {
    return true;
  }
  return false;
}

function symptomsCheck(inputSymptoms, diseaseSymptoms) {
  let matchingSymptoms = 0;

  for (let i = 0; i < inputSymptoms.length; i++) {
    for (let j = 0; j < diseaseSymptoms.length; j++) {
      if (inputSymptoms[i] === diseaseSymptoms[j]) {
        matchingSymptoms += 2;
      }
    }
  }

  return matchingSymptoms;
}

function painCheck(inputPainLocation, diseasePainLocation) {
  let matchingSymptoms = 0;

  if (Array.isArray(inputPainLocation) && Array.isArray(diseasePainLocation) && diseasePainLocation.length !== 0) {
    for (let i = 0; i < inputPainLocation.length; i++) {
      for (let j = 0; j < diseasePainLocation.length; j++) {
        if (inputPainLocation[i] === diseasePainLocation[j]) {
          matchingSymptoms += 3;
        }
      }
    }
  }

  return matchingSymptoms;
}








//ertesitesek
import admin from 'firebase-admin';
import cron from 'node-cron';
import { readFile } from 'fs/promises';

const messaging = admin.messaging();

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  const currentDay = now.getDate();
  const currentWeekday = now.getDay();

  try {
    const snapshot = await db.collection('alerts')
      .where('isActive', '==', true)
      .get();

    const messages = [];

    snapshot.forEach(doc => {
      const alert = doc.data();
      const freq = alert.frequency;
      const times = alert.times || [];

      let shouldSend = false;

      if (times.includes(currentTime)) {
        switch (freq) {
          case 'Naponta egyszer':
            shouldSend = times.length === 1;
            break;
          case 'Naponta kétszer':
            shouldSend = times.length === 2;
            break;
          case 'Naponta háromszor':
            shouldSend = times.length === 3;
            break;
          case 'Hetente egyszer':
            shouldSend = currentWeekday === 1;
            break;
          case 'Havonta egyszer':
            shouldSend = currentDay === 1;
            break;
          default:
            shouldSend = false;
        }
      }

      if (shouldSend) {
        messages.push({
          token: alert.fcmToken,
          notification: {
            title: 'Emlékeztető',
            body: alert.name
          },
          android: {
            notification: {
              priority: 'high',
            },
          },
        });
      }
    });

    if (messages.length > 0) {
      for (const message of messages) {
        try {
          const response = await messaging.send(message);
          console.log(`sent: ${response}`);
        } catch (error) {
          console.error('error while sending out alert', error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

//user torlese admin alltal
app.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
  try {
    await admin.auth().deleteUser(uid);
    res.status(200).send({ message: 'user deleted' });
  } catch (error) {
    res.status(500).send({ error: 'error while deleing user', details: error });
  }
});



//scraping