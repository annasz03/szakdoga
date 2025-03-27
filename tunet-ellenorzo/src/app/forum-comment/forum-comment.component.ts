import { Component, Input } from '@angular/core';
import { IComment } from '../icomment';
import { DatePipe } from '@angular/common';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';

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

  constructor(private datePipe: DatePipe, private firestore: Firestore){}

  ngOnInit(){
    this.date = this.comment.date.toDate();
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');

    //username
        const ref = collection(this.firestore, 'users');
        getDocs(ref)
          .then(snapshot => {
            snapshot.forEach(doc => {
              const docData = doc.data();
              
              if (doc.id == this.comment.uid) {
                this.username = docData["username"]; 
              }
            });
          })
          .catch(error => {
            console.error("Hiba: ", error);
          });
  }

}
