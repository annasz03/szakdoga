import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, Timestamp, updateDoc } from '@angular/fire/firestore';
import { ForumCommentComponent } from '../forum-comment/forum-comment.component';
import { IComment } from '../icomment';
import { FormsModule } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

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

  @Output() postDeleted = new EventEmitter<string>();

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService, private http:HttpClient
  ) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.checkIfLiked();
    });
  }

  checkIfLiked() {
    this.likedBy=this.post.likedBy
    if (this.post && this.likedBy && this.currentUser) {
      this.liked = this.likedBy.includes(this.currentUser.uid);
    }
  }
  

  ngOnInit() {
    this.date = this.post.date instanceof Timestamp ? this.post.date.toDate() : this.post.date;
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');
    this.likeCount = this.post.like || 0;
    this.commentCount = this.post.comment || 0;
    this.likedBy = this.post.likedBy || [];

    this.checkIfLiked();
    this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && this.post) {
      this.likedBy = this.post.likedBy || [];
      this.likeCount = this.post.like || 0;
      this.checkIfLiked();
    }
  }

  loadComments() {
    this.http.post<{ comments: IComment[] }>('http://localhost:3000/load-comments', { postid: this.post.id })
      .subscribe({
        next: (res) => {
          this.comments = res.comments;
        },
      });
  }
  

  goToUserProfile() {
    this.router.navigate(['/profile', this.post.uid]);
  }

  addComment() {  
    if (!this.commentBody) {
      alert('Kérjük, töltse ki a hozzászólást!');
      return;
    }
    const commentData = {
      uid: this.currentUser?.uid || '',
      postid: this.post.id,
      body: this.commentBody,
      username: this.currentUser?.displayName
    };
  
    this.http.post('http://localhost:3000/add-comment', commentData)
      .subscribe({
        next: () => {
          this.commentCount++;
          this.updateCommentCount();
          this.loadComments();
          this.commentBody = '';
        }
      });
  }
  
  updateCommentCount() {
    const postData = { postid: this.post.id };
  
    this.http.post('http://localhost:3000/update-comment-count', postData)
      .subscribe({
        next: () => {
          console.log('updated');
        }
      });
  }
  

  like() {
    const likeData = {
      userId: this.currentUser.uid,
      postId: this.post.id,
      liked: this.liked
    };
  
    this.http.post('http://localhost:3000/like-post', likeData)
      .subscribe({
        next: () => {
          this.liked = !this.liked;
          this.likeCount += this.liked ? 1 : -1;
        }
      });
  }
  

  deletePost(postid: string) {
    this.http.delete(`http://localhost:3000/api/delete-post/${this.post.id}`).subscribe({
      next: (response) => {
        this.postDeleted.emit(postid);
      }
    });
  }
  
  onCommentDeleted(postId: string) {
    this.commentCount = Math.max(0, this.commentCount - 1);
    this.post.comment = this.commentCount;
    
    this.loadComments();
  }
  
  
  
  
}
