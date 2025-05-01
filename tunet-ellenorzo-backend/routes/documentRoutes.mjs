
import express from 'express';
import multer from 'multer';
import { db } from '../config/firebase.mjs';

const router = express.Router();
const upload = multer();


router.post('/get-all-documents', async (req, res) => {
    const docref = db.collection('documents');
    const uid = req.body.uid;
    const snapshot = await docref.where('userId', '==', uid).get();

    const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));


    res.status(200).send(documents);
});

router.post('/get-all-shared-documents', async (req, res) => {
  const docref = db.collection('sharedDocuments');
  const uid = req.body.uid;
  const snapshot = await docref.where('userId', '==', uid).get();

  const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


  res.status(200).send(documents);
});

router.post('/upload-document', upload.single('file'), async (req, res) => {
  const file = req.file;
  const comment = req.body.comment;
  const userId = req.body.userId;

  if (!file) {
      return res.status(400).send({ message: 'Nincs fájl feltöltve.' });
  }

  const base64Data = file.buffer.toString('base64');
  const fileType = file.mimetype;

  const newDoc = {
    file: `data:${fileType};base64,${base64Data}`,
    type: fileType,
    comment: comment,
    userId: userId,
  };

  await db.collection('documents').add(newDoc);

  res.status(200).send({ message: 'Dokumentum sikeresen feltöltve' });
});




export default router;
