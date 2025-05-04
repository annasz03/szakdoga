import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Ratings } from '../ratings';
import { RatingsComponent } from '../ratings/ratings.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, I18NextModule, FormsModule, RatingsComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {
  @Input() doc: any;
  @Input() role: any;
  ratings: Ratings[]=[];

  opened = false;
  selectedRating = 0;
  comment = '';
  currentUser:any;
  private authService = inject(AuthService);

  constructor(private http:HttpClient){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.http.get<Ratings[]>(`http://localhost:3000/api/ratings/${this.doc.id}`)
    .subscribe(data => {
      this.ratings = data;
    });

  }

  openMoreData() {
    this.opened = !this.opened;
  }

  deleteRequest() {
    this.http.delete(`http://localhost:3000/doctors_temp/${this.doc.id}`)
      .subscribe(() => {
      });

  }

  acceptRequest() {
    this.http.post('http://localhost:3000/api/doctors_temp/accept', {
      doc: this.doc,
      currentUsername: this.currentUser.displayName
    }).subscribe(() => {
      console.log('accepted');
    });
    
  }
  

  setRating(star: number) {
    this.selectedRating = star;
  }

  async submitRating() {
    this.http.post('http://localhost:3000/api/submit-rating', {
      doctorId: this.doc.id,
      rating: this.selectedRating,
      comment: this.comment,
      createdBy: this.currentUser?.uid || 'anonymous'
    }).subscribe(() => {
      this.selectedRating = 0;
      this.comment = '';
    });
    
  }
}
