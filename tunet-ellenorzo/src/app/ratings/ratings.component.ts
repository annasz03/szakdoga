import { HttpClient } from '@angular/common/http';
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
  
  constructor(private firestore: Firestore, private http:HttpClient){}

  ngOnInit() {
    this.http.post<{ username: string }>('http://localhost:3000/api/get-username-by-id', {
      uid: this.rating.createdBy
    }).subscribe({
      next: (res) => {
        this.username = res.username;
      },
    });
  }
  

}
