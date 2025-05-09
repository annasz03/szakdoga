import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IComment } from '../icomment';
import { CommonModule, DatePipe } from '@angular/common';
import { collection, Firestore, getDocs, Timestamp } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forum-comment.component.html',
  styleUrl: './forum-comment.component.css'
})
export class ForumCommentComponent {
  userService = inject(UserService)
  forumService = inject(ForumService)

  @Input() comment:any;
  formattedDate:any;
  date:any;
  username:any;
  currentUser:any;

  @Output() commentDeleted = new EventEmitter<string>();

  constructor(private datePipe: DatePipe, private firestore: Firestore, private http:HttpClient, private authService: AuthService){
    this.authService.user$.subscribe(user => {
        this.currentUser = user;
    });
    
  }

  ngOnChanges() {
  if (this.comment) {
    this.date = this.comment.date instanceof Timestamp ? this.comment.date.toDate() : this.comment.date;
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');

    this.getUsernameByUid(this.comment.uid);
  }
}


  getUsernameByUid(uid: string) {
    this.userService.getDisplayName(uid).subscribe({
      next: (response) => {
        this.username = response.displayName;
      }
    });

    //nem biztos jo masik apit hasznal
    /*this.http.post<{ username: string }>('http://localhost:3000/api/get-username-by-uid', { uid })
      .subscribe({
        next: (response) => {
          this.username = response.username;
        }
      });*/
  }

  deleteComment(postid: string) {
    this.forumService.deleteComment(this.comment.postid,this.comment.id).subscribe({
      next: (response) => {
        this.commentDeleted.emit(postid);
      }
    });

    
    /*this.http.delete(`http://localhost:3000/api/delete-comment/${this.comment.postid}/${this.comment.id}`).subscribe({
      next: (response) => {
        this.commentDeleted.emit(postid);
      }
    });*/
  }

}
