import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, Timestamp, updateDoc } from '@angular/fire/firestore';
import { ForumCommentComponent } from '../forum-comment/forum-comment.component';
import { IComment } from '../icomment';
import { FormsModule } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forum-post',
  standalone: true,
  imports: [ForumCommentComponent, CommonModule, FormsModule, I18NextModule],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
  providers: [DatePipe]
})
export class ForumPostComponent implements OnInit, OnChanges {
  @Input() post!: any;

  date: any;
  formattedDate: any;
  username: string = '';
  commentBody: string = '';

  liked: boolean = false;
  likeCount: number = 0;
  likedBy: string[] = [];

  commentCount: number = 0;
  comments: IComment[] = [];

  currentUser: any;

  constructor(
    private datePipe: DatePipe,
    private firestore: Firestore,
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.checkIfLiked();
    });
  }

  checkIfLiked() {
    this.likedBy=this.post.likedBy
    console.log(this.post)
    console.log(this.likedBy)
    console.log(this.currentUser.uid)
    if (this.post && this.likedBy && this.currentUser) {
      this.liked = this.likedBy.includes(this.currentUser.uid);
    }
  }
  

  async ngOnInit() {
    this.date = this.post.date.toDate();
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');
    this.likeCount = this.post.like || 0;
    this.commentCount = this.post.comment || 0;
    this.likedBy = this.post.likedBy || [];

    this.checkIfLiked();
    await this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && this.post) {
      this.likedBy = this.post.likedBy || [];
      this.likeCount = this.post.like || 0;
      this.checkIfLiked();
    }
  }

  async loadComments() {
    const ref = collection(this.firestore, 'forum_comment');
    const snapshot = await getDocs(ref);

    const comments: IComment[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      if (data['postid'] === this.post.id) {
        comments.push({
          id: docSnap.id,
          uid: data['uid'],
          postid: data['postid'],
          body: data['body'],
          date: data['date'],
          username: data['username']
        });
      }
    });

    this.comments = comments;
  }

  goToUserProfile() {
    this.router.navigate(['/profile', this.post.uid]);
  }

  addComment() {
    const commentCollection = collection(this.firestore, 'forum_comment');
    const newDoc = {
      uid: this.currentUser?.uid || '',
      postid: this.post.id,
      body: this.commentBody,
      date: Timestamp.now(),
      username: this.currentUser?.displayName
    };

    addDoc(commentCollection, newDoc)
      .then(() => {
        console.log('Sikeres hozzáadás');
        this.commentCount++;
        this.updateCommentCount();
        this.loadComments();
        this.commentBody = '';
      })
      .catch(error => {
        console.error('Nem sikerült hozzáadni', error);
      });
  }

  updateCommentCount() {
    const postRef = doc(this.firestore, 'forum_post', this.post.id);
    updateDoc(postRef, {
      comment: this.commentCount
    });
  }

  like() {
    const userId = this.currentUser.uid;
    const postRef = doc(this.firestore, 'forum_post', this.post.id);

    if (this.liked) {
      this.likeCount--;
      this.likedBy = this.likedBy.filter(uid => uid !== userId);
    } else {
      this.likeCount++;
      if (!this.likedBy.includes(userId)) {
        this.likedBy.push(userId);
      }
    }

    this.liked = !this.liked;

    updateDoc(postRef, {
      like: this.likeCount,
      likedBy: this.likedBy
    }).catch(error => {
      console.error(error);
    });
  }
}
