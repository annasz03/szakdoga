import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fakeData from './fakeData.mjs';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';


const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: ${PORT}`);
});

const __dirname = "./";

// TODO: külön fájlba szervezni

app.post('/result', (req, res) => {
  const data = req.body;
  let result = [];

  for (const [key, value] of fakeData.entries()) {
    let currRes = processData(data, key, value);
    if(currRes > 1){ // 1, hogyha csak a kor egyezik, akkor ne rakja bele
      result.push({ key, value, currRes });
    }
  }

  result = orderResult(result);

  res.json({ message: 'Result:', result });
});

function orderResult(result) {
  return result.sort((a, b) => b.currRes - a.currRes);
}

function processData(data, key, value) {
  let matching = 0;

  if(!genderCheck(data.gender, value.gender)){
    return 0;
  } else {
    matching += ageCheck(data.age, value.age);
    matching += symptomsCheck(data.symptoms, value.symptoms);
    if(data.pain == true){
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
  if(inputGender == 'male' && diseaseGender == 'Férfi') {
    return true;
  }
  if(inputGender == 'female' && diseaseGender == 'Nő') {
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

  if(diseasePainLocation.length !== 0) {
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

app.get('/diseases/:name', (req, res) => {
  const diseaseName = req.params.name;
  const result = [];

  for (const [key, value] of fakeData.entries()) {
    if (key === diseaseName) {
      result.push({ key, value });
    }
  }

  res.json({ message: 'Result: ', result });
});


const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });


const dataFilePath = path.resolve('./fakeDocumentsData.json');

async function loadData() {
  const fileContent = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(fileContent);
}

async function saveData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function addToDocument(uid, filename, text) {
  const data = await loadData();
  const newId =data[data.length - 1].id + 1;
  const newDocument = { id: newId, uid, filename, text };
  data.push(newDocument);
  await saveData(data);
  return newDocument;
}

async function deleteDocument(uid, fileName) {
  const data = await loadData();
  const i = data.findIndex(item => item.uid === uid && item.filename === fileName);
  data.splice(i, 1);

  const filePath = path.join(__dirname, 'uploads', fileName);
  //file torlese
  await fs.unlink(filePath)


  await saveData(data);
  return data;
}

//egy adott felhasznalo osszes mentette dokumentuma
app.get('/doc/:uid', async (req, res) => {
  const id = req.params.uid;
  const data = await loadData();

  const result = data.filter(item => item.uid === id);
  console.log(result);

  res.json({ message: 'Result: ', result });
});

//egy adott felhasznalo egy mentette dokumentuma
app.get('/doc/:uid/:filename', async (req, res) => {
  const id = req.params.uid;
  const fileName = req.params.filename;
  const data = await loadData();

  const result = data.filter(item => item.filename === fileName && item.uid === id);

  res.json({ message: 'Result: ', result });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/delete/:uid/:filename', async (req, res) => {
  const id = req.params.uid;
  const fileName = req.params.filename;

  const result = await deleteDocument(id, fileName);

  res.json({ message: 'Result: ', result });
});


//feltoltes
app.post('/upload/:uid', upload.single('file'), async (req, res) => {
  const uid = req.params.uid;
  const text = req.body.text;
  const filename = req.file.filename;
  
  const newDocument = await addToDocument(uid, filename, text);

  res.json({ message: 'Result: ', document: newDocument });
});



//ertesitesek
/*import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';

let serviceAccount; // Make this available to other functions

// Firebase inicializálása
async function initializeFirebase() {
    try {
        serviceAccount = JSON.parse(
            await readFile(new URL('./tunet-ellenorzo-f8999-firebase-adminsdk-jdbfu-f0ceea275b.json', import.meta.url))
        );

        if (admin.apps.length === 0) {
            await admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: serviceAccount.project_id,
                    clientEmail: serviceAccount.client_email,
                    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
                }),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
            });
            console.log('✅ Firebase Admin SDK sikeresen inicializálva');
        }

        return { db: admin.firestore(), projectId: serviceAccount.project_id };
    } catch (error) {
        console.error('❌ Firebase inicializálási hiba:', error);
        process.exit(1);
    }
}

// OAuth 2.0 token beszerzése
async function getAccessToken() {
    try {
        const credential = admin.credential.cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
        });
        const token = await credential.getAccessToken();
        return token.access_token;
    } catch (error) {
        console.error('❌ Token beszerzési hiba:', error);
        return null;
    }
}

// ... rest of your code remains the same ...

// Értesítés küldése v1 API-val
async function sendNotificationToToken(projectId, token, title, body) {
    console.log(`🔍 Token ellenőrzés: ${token?.substring(0, 10)}...`);
    
    if (!token || token.length < 10) {
        console.error('⚠️ Érvénytelen token');
        return false;
    }

    const message = {
        message: {
            token,
            notification: { title, body },
        }
    };

    const accessToken = await getAccessToken();
    if (!accessToken) return false;

    try {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
        
        const result = await response.json();
        console.log('✅ Értesítés elküldve:', result);
        return true;
    } catch (error) {
        console.error('❌ Küldési hiba:', error.message);
        return false;
    }
}

// Tesztfüggvény
async function testSend() {
    try {
        const { db, projectId } = await initializeFirebase();
        const testToken = "cRnCJMebCjVQJBM6hDQ1tA:APA91bGDpCRTZYYC3rbMUhVA29K5N22kWIOik8U8Mta6-KW2x4q8GC4kkHZjSzSlA7Ani8WI8qKQBe9tTDnun5P0q_AMx1FRiLyWbj3sE22uiqx7X87JetE";
        
        console.log("🚀 Teszt értesítés küldése...");
        const result = await sendNotificationToToken(projectId, testToken, "TESZT", "Ez egy teszt üzenet");
        console.log(result ? "✅ Teszt sikeres" : "❌ Teszt sikertelen");
    } catch (error) {
        console.error('❌ Teszt hiba:', error);
    }
}

// Fő program
async function main() {
    try {
        await testSend();
        console.log('🚀 Szerver fut...');
    } catch (error) {
        console.error('❌ Indítási hiba:', error);
        process.exit(1);
    }
}

// Alkalmazás indítása
main().catch(console.error);
*/


import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const registrationTokenFromUI = 'cRnCJMebCjVQJBM6hDQ1tA:APA91bFONou8bQ_amMLchMhdcSWuLPQ7sj3jF_ZwjrlYzI_YbmC7C-YCq2DwK-0plC0XzSKiuGALRPaqS_ctA9nXjgmlhXOs1fpBwQQn4nL9WmhSc2UeJCk';

let serviceAccount= JSON.parse(
  await readFile(new URL('./tunet-ellenorzo-f8999-firebase-adminsdk-jdbfu-f0ceea275b.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
      title: 'Angular PWA Tutorial',
      body: 'It Worked liek a charm!'
  },
  token: registrationTokenFromUI
};

admin.messaging().send(message)
  .then((response) => {
      console.log('Successfully sent message:', response);
  })
  .catch((err) => {
      console.log('Error in sending the message', err);
  });