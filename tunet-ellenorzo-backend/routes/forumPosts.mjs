
import express from 'express';
import { db } from '../config/firebase.mjs';

const router = express.Router();


router.post('/get-all-posts', async (req, res) => {
    const forumPostRef = db.collection('forum_post');
    const uid = req.body.uid;
    const postSnap = await forumPostRef.where('uid', '==', uid).get();

    const postsArray = [];

    postSnap.forEach(doc => {
      const docData = doc.data();
      postsArray.push({
        id: doc.id,
        uid: docData.uid,
        body: docData.body,
        date: docData.date,
        tag: docData.tag,
        like: docData.like,
        comment: docData.comment,
        username: docData.username,
        likedBy: docData.likedBy
      });
    });

    postsArray.sort((a, b) => b.date.seconds - a.date.seconds);

    res.status(200).send(postsArray);
});




export default router;
