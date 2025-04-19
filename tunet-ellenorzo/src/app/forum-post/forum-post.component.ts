import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, Timestamp, updateDoc } from '@angular/fire/firestore';
import { format } from 'date-fns';
import { ForumCommentComponent } from '../forum-comment/forum-comment.component';
import { IComment } from '../icomment';
import { FormsModule } from '@angular/forms';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forum-post',
  standalone: true,
  imports: [ForumCommentComponent, CommonModule, FormsModule, I18NextModule],
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

  liked: boolean = false;
  likeCount: number = 0;
  commentCount=0;

  comments:IComment[]=[];
  constructor(private datePipe: DatePipe, private firestore: Firestore, private router: Router) {}


  ngOnInit(){
    this.date = this.post.date.toDate();
    this.formattedDate = this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm:ss');
    this.likeCount = this.post.like || 0;
    this.commentCount = this.post.comment || 0;
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

    const postRef = doc(this.firestore, 'forum_post', this.post.id);
    updateDoc(postRef, {
      comment: this.commentCount
    })
  }

  like() {
    if (this.liked) {
      this.likeCount--;
    } else {
      this.likeCount++;
    }
  
    this.liked = !this.liked;
  
    const postRef = doc(this.firestore, 'forum_post', this.post.id);
    updateDoc(postRef, {
      likes: this.likeCount
    })
  }

  goToUserProfile() {
    this.router.navigate(['/profile', this.post.uid]);
  }
}
