
import express from 'express';
import multer from 'multer';
import { db } from '../config/firebase.mjs';

const router = express.Router();
const upload = multer();

//kesz
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

//kesz
router.post('/get-all-shared-documents', async (req, res) => {
  const { doctor_id, uid } = req.body;

    const sharedRef = db.collection('shared_documents');

    const sharedSnap = await sharedRef.where('doctor_id', '==', doctor_id).where('uid', '==', uid).get();

    const sharedDocs = sharedSnap.docs.map(doc => doc.data());
    const documentIds = sharedDocs.map(doc => doc.document_id).filter(Boolean);
    const documentRef = db.collection('documents');
    const results = [];

    for (let i = 0; i < documentIds.length; i += 10) {
      const batch = documentIds.slice(i, i + 10);
      const batchSnap = await documentRef.where('__name__', 'in', batch).get();

      batchSnap.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    return res.status(200).send(results);

});







//kesz
router.post('/upload-document', upload.single('file'), async (req, res) => {
  const file = req.file;
  const comment = req.body.comment;
  const userId = req.body.userId;

  const base64Data = file.buffer.toString('base64');
  const fileType = file.mimetype;

  const newDoc = {
    file: `data:${fileType};base64,${base64Data}`,
    type: fileType,
    comment: comment,
    userId: userId,
  };

  await db.collection('documents').add(newDoc);

  res.status(200).send({ message: 'success' });
});

//kesz
router.post('/send-to-doctor', async (req, res) => {
  const { uid, doctor_id, document_id } = req.body;
    const newDoc = {
      uid: uid,
      doctor_id: doctor_id,
      document_id: document_id,
    };
    const docRef = await db.collection('shared_documents').add(newDoc);
    
    res.status(200).send({ message: 'success', docId: docRef.id });
});

//kesz
router.get('/load-total-count-uid', async (req, res) => {
    const areasRef = db.collection('doctors').where('uid', '!=', null).orderBy('uid');
    const snapshot = await areasRef.get();
    const totalCount = snapshot.size;

    res.status(200).send({ totalCount: totalCount });
});

//kesz
router.get('/load-total-count', async (req, res) => {
  const areasRef = db.collection('doctors');
  const snapshot = await areasRef.get();
  const totalCount = snapshot.size;

  res.status(200).send({ totalCount: totalCount });
});

router.delete('/delete-document/:id', async (req, res) => {
    const { id } = req.params;
    const docRef = db.collection('documents').doc(id);
    await docRef.delete();
    return res.status(200).send({ message: 'deleted' });
});



export default router;
