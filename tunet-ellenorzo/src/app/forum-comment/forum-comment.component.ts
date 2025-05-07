import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IComment } from '../icomment';
import { DatePipe } from '@angular/common';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forum-comment',
  standalone: true,
  imports: [],
  templateUrl: './forum-comment.component.html',
  styleUrl: './forum-comment.component.css'
})
export class ForumCommentComponent {

  @Input() comment:any;
  formattedDate:any;
  date:any;
  username:any;

  @Output() commentDeleted = new EventEmitter<string>();

  constructor(private datePipe: DatePipe, private firestore: Firestore, private http:HttpClient){}

  ngOnInit(){
    this.date = this.comment.date
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');

    this.getUsernameByUid(this.comment.uid);
    
  }

  getUsernameByUid(uid: string) {
    this.http.post<{ username: string }>('http://localhost:3000/api/get-username-by-uid', { uid })
      .subscribe({
        next: (response) => {
          this.username = response.username;
        }
      });
  }

  deleteComment(postid: string) {
    this.http.delete(`http://localhost:3000/api/delete-post/${this.comment.id}`).subscribe({
      next: (response) => {
        this.commentDeleted.emit(postid);
      }
    });
  }

}
