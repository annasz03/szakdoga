import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { format } from 'date-fns';


@Component({
  selector: 'app-forum-post',
  standalone: true,
  imports: [],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.css',
  providers: [DatePipe]
})
export class ForumPostComponent {
  @Input() post:any;
  date:any;
  formattedDate:any;
  username:string="";

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
          console.log("Dokumentum ID:", doc.id);
          console.log(" uID:",this.post.uid);
          
          if (doc.id == this.post.uid) {
            this.username = docData["username"]; 
          }
        });
      })
      .catch(error => {
        console.error("Hiba: ", error);
      });

    
  }

}
