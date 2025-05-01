import { Component, Input } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent {
  @Input() rating:any;
  username="";
  
  constructor(private firestore: Firestore){}

  ngOnInit(){
    getDocs(collection(this.firestore, 'users')).then(snapshot => {
          snapshot.forEach(doc => {
            const docData = doc.data();
            if (doc.id === this.rating.createdBy) {
              this.username = docData["username"];
            }
          });
        });
  }

}
