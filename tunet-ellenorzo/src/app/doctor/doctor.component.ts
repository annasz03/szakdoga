import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Ratings } from '../ratings';
import { RatingsComponent } from '../ratings/ratings.component';
import { HttpClient } from '@angular/common/http';
import { DoctorService } from '../doctor.service';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, I18NextModule, FormsModule, RatingsComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {
  doctorService = inject(DoctorService)
  @Input() doc: any;
  @Input() role: any;
  ratings: Ratings[]=[];

  opened = false;
  selectedRating = 0;
  comment = '';
  currentUser:any;
  @Input() temp:boolean = false;
  private authService = inject(AuthService);
  @Output() requestHandled = new EventEmitter<void>();

  constructor(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(){
    this.getRatings()
  }

  getRatings(){
    this.doctorService.getRatings(this.doc.id).subscribe(data => {
      this.ratings = data;
    });
  }

  openMoreData() {
    this.opened = !this.opened;
  }

  deleteRequest() {
    this.doctorService.deleteDoctorTemp(this.doc.id).subscribe(() => {
      this.requestHandled.emit();
    });
  }

  acceptRequest() {
    this.doctorService.acceptDoctorTemp(this.doc,this.currentUser.displayName).subscribe(() => {
      this.requestHandled.emit();
    });
  }
  
  setRating(star: number) {
    this.selectedRating = star;
  }

  async submitRating() {
    this.doctorService.submitRating(this.doc.id,this.selectedRating,this.comment,this.currentUser.uid).subscribe(() => {
      this.selectedRating = 0;
      this.comment = '';
      this.getRatings()
    });    
  }
}
