import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, Timestamp } from '@angular/fire/firestore';
import { format } from 'date-fns';
import { ForumCommentComponent } from '../forum-comment/forum-comment.component';
import { IComment } from '../icomment';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-forum-post',
  standalone: true,
  imports: [ForumCommentComponent, CommonModule, FormsModule],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
  providers: [DatePipe]
})
export class ForumPostComponent {
  @Input() post:any;
  date:any;
  formattedDate:any;
  username:string="";
  commentBody:string = "";

  comments:IComment[]=[];
  constructor(private datePipe: DatePipe, private firestore: Firestore) {}


  ngOnInit(){
    this.date = this.post.date.toDate();
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');

    //username
    const ref = collection(this.firestore, 'users');
    getDocs(ref)
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data();
          
          if (doc.id == this.post.uid) {
            this.username = docData["username"]; 
          }
        });
      })
      .catch(error => {
        console.error("Hiba: ", error);
      });

    //kommentek
    const ref2 = collection(this.firestore, 'forum_comment');
    getDocs(ref2)
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data();

          //szures hogy csak ezen postok kommentjet rakja bele
          if(docData["postid"]===this.post.id){
            this.comments.push({id: doc.id, uid:docData["uid"], postid:docData["postid"], body:docData["body"], date: docData["date"]});
          }
          
        });
      })
      .catch(error => {
        console.error("Hiba: ", error);
      });
  }


  addComment(){
    const commentCollection = collection(this.firestore, 'forum_comment');
    const newDoc= {
      uid: this.post.uid,
      postid: this.post.id,
      body: this.commentBody,
      date: Timestamp.now(),
    }

    addDoc(commentCollection,newDoc).then((docref)=>{
      console.log('Sikeres hozzáadás');
        }).catch((error) => {
          console.error('Nem sikerült hozzáadni', error);
    })
  }
}
