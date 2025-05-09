
import express from 'express';
import { db } from '../config/firebase.mjs';
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

//kesz
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

//kesz
router.post('/load-comments', async (req, res) => {
  const { postid } = req.body;
    const snapshot = await db.collection('forum_comment').where('postid', '==', postid).get();
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data['uid'],
        postid: data['postid'],
        body: data['body'],
        date: data['date'],
        username: data['username']
      };
    });
    res.status(200).send({ comments });
});

//kesz
router.post('/add-comment', async (req, res) => {
    const { uid, postid, body, username } = req.body;
    const newComment = {
      uid: uid,
      postid: postid,
      body: body,
      date: new Date().toISOString(),
      username: username
    };
    const docRef = await db.collection('forum_comment').add(newComment);
    
    const postRef = db.collection('forum_post').doc(postid);
    const postDoc = await postRef.get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      const commentCount = postData.comment || 0;
      await postRef.update({
        comment: commentCount + 1
      });
    }

    res.status(200).send({ message: 'success' });
});

//kesz
router.post('/like-post', async (req, res) => {
    const { userId, postId, liked } = req.body;
    const postRef = db.collection('forum_post').doc(postId);
    const postDoc = await postRef.get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      let { like, likedBy } = postData;
      if (liked) {
        like--;
        likedBy = likedBy.filter(uid => uid !== userId);
      } else {
        like++;
        if (!likedBy.includes(userId)) {
          likedBy.push(userId);
        }
      }

      await postRef.update({
        like: like,
        likedBy: likedBy
      });

      res.status(200).send({ message: 'success' });
    }
});

//kesz
router.post('/update-comment-count', async (req, res) => {
    const { postid } = req.body;
    const postRef = db.collection('forum_post').doc(postid);
    const postDoc = await postRef.get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      const commentCount = postData.comment || 0;
      await postRef.update({
        comment: commentCount + 1
      });

      res.status(200).send({ message: 'SUCCESS' });
    }
});

//kesz
router.post('/add-post', async (req, res) => {
    const { uid, body, tag, username } = req.body;
    const newPost = {
      uid: uid,
      body: body,
      date: new Date().toISOString(),
      tag: tag,
      like: 0,
      likedBy: [],
      comment: 0,
      username: username
    };
    const postRef = await db.collection('forum_post').add(newPost);

    res.status(200).send({
      postId: postRef.id
    });
});

//kesz
router.post('/api/forum-load-posts', async (req, res) => {
  const { pageSize, pageIndex } = req.body;
  const postsRef = db.collection('forum_post');
    const totalSnapshot = await postsRef.get();
    const totalCount = totalSnapshot.size; 

    let queryRef = postsRef.orderBy('date', 'desc').limit(pageSize);

    if (pageIndex > 0) {
      const initialQuery = await postsRef.orderBy('date', 'desc').limit(pageSize * pageIndex).get();
      
      const lastVisible = initialQuery.docs[initialQuery.docs.length - 1];
      if (lastVisible) {
        queryRef = queryRef.startAfter(lastVisible);
      }
    }

    const snapshot = await queryRef.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ 
      posts,
      totalCount
    });
});



router.delete('/api/delete-post/:postId', async (req, res) => {
  const postId = req.params.postId;
  const postRef = db.collection('forum_post').doc(postId);
    await postRef.delete();
    return res.status(200).json({ message: ' törölve' });
});

router.delete('/api/delete-comment/:postid/:commentId', async (req, res) => {
  const comment_id = req.params.commentId;
  const post_id = req.params.postid;
  const comment_ref = db.collection('forum_comment').doc(comment_id);
  
  const postRef = db.collection('forum_post').doc(post_id);
    await postRef.update({
      comment: FieldValue.increment(-1)
    });
    
    await comment_ref.delete();
    return res.status(200).json({ message: 'success' });
});

export default router;
