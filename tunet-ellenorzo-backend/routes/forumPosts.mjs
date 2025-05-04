
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
    await updateCommentCount(postid);

    res.status(200).send({ message: 'success' });
});


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

      res.status(200).send({ message: 'Hozzászólás szám sikeresen frissítve' });
    }
});

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

router.get('/get-posts', async (req, res) => {
    const snapshot = await db.collection('forum_post').get();
    
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data['uid'],
        body: data['body'],
        date: data['date'],
        tag: data['tag'],
        like: data['like'],
        comment: data['comment'],
        username: data['username'],
        likedBy: data['likedBy']
      };
    });
    posts.sort((a, b) => {
      return b.date.seconds - a.date.seconds;
    });

    res.status(200).send({ posts });
});

router.get('/api/forum-total-count', async (req, res) => {
  const snapshot = await db.collection('forum_post').get();
  res.json({ totalCount: snapshot.size });
});

router.post('/api/forum-load-posts', async (req, res) => {
  const { pageSize, lastVisiblePostId } = req.body;

  let queryRef = db.collection('forum_post').orderBy('date', 'desc').limit(pageSize);

  if (lastVisiblePostId) {
    const lastDoc = await db.collection('forum_post').doc(lastVisiblePostId).get();
    if (lastDoc.exists) {
      queryRef = queryRef.startAfter(lastDoc);
    }
  }

  const snapshot = await queryRef.get();
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const lastVisible = snapshot.docs[snapshot.docs.length - 1]?.id;
  res.status(200).json({ posts, lastVisible });
});

router.post('/load-forum-posts-next', async (req, res) => {
    const { lastVisiblePostId, pageSize } = req.body;

    let queryRef = db.collection('forum_post').orderBy('date', 'desc').limit(pageSize);

    if (lastVisiblePostId) {
      const lastDoc = await db.collection('forum_post').doc(lastVisiblePostId).get();
      if (lastDoc.exists) {
        queryRef = queryRef.startAfter(lastDoc);
      }
    }

    const snapshot = await queryRef.get();
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const newLastVisible = snapshot.docs[snapshot.docs.length - 1]?.id;

    res.status(200).json({
      posts: docs,
      lastVisible: newLastVisible || null
    });
    
});



export default router;
