import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Ratings } from '../ratings';
import { RatingsComponent } from '../ratings/ratings.component';

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
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    const ref = collection(this.firestore, 'ratings');
          getDocs(ref).then(snapshot => {
            snapshot.forEach(doc => {
              const docData = doc.data();
              if (docData["doctorId"] === this.doc.id) {
                this.ratings.push(docData as Ratings)
              }
            });
          });
  }

  openMoreData() {
    this.opened = !this.opened;
  }

  deleteRequest() {
    const docRef = doc(this.firestore, 'doctors_temp', this.doc.id);
    deleteDoc(docRef)
  }

  acceptRequest() {
    const docRef = doc(this.firestore, 'doctors_temp', this.doc.id);
    const doctorsCollection = collection(this.firestore, 'doctors');
  
    addDoc(doctorsCollection, {
      uid: this.doc.uid,
      name: this.doc.name,
      phone: this.doc.phone,
      city: this.doc.city,
      address: this.doc.address,
      specialty: this.doc.specialty,
      profileUrl: this.doc.profileUrl || '',
      specs: [this.doc.specialty],
      cities: [this.doc.city],
      gender: 'unknown',
      available: true
    }).then(() => {
      return deleteDoc(docRef);
    });
  
    const ref = collection(this.firestore, 'users');
    getDocs(ref).then(snapshot => {
      let userId = "";
      snapshot.forEach(docc => {
        const docData = docc.data();
        if (docData["username"] === this.currentUser.displayName) {
          userId = docc.id;
  
          const userref = doc(this.firestore, 'users', userId);
          updateDoc(userref, {
            role: "doctor"
          });
        }
      });
    });
  }
  

  setRating(star: number) {
    this.selectedRating = star;
  }

  async submitRating() {
    const ratingsCollection = collection(this.firestore, 'ratings');
    console.log(this.doc)
    await addDoc(ratingsCollection, {
      doctorId: this.doc.id,
      rating: this.selectedRating,
      comment: this.comment,
      createdBy: this.currentUser?.uid || 'anonymous',
      createdAt: new Date()
    });
    this.selectedRating = 0;
    this.comment = '';
  }
}
