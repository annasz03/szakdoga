import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, I18NextModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {
  @Input() doc: any;
  @Input() role: any;

  opened = false;
  currentUser:any;
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  openMoreData() {
    this.opened = !this.opened;
  }

  deleteRequest() {
    const docRef = doc(this.firestore, 'doctors_temp', this.doc.id);
    deleteDoc(docRef)
      .then(() => console.log('Doktor kérés törölve.'))
      .catch(error => console.error('Hiba a törlés során:', error));
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
    })

    let userId="";
    const ref = collection(this.firestore, 'users');
          getDocs(ref).then(snapshot => {
            snapshot.forEach(doc => {
              const docData = doc.data();
              if (docData["username"] === this.currentUser.displayName) {
                userId = doc.id;
              }
            });
          });

    const userref = doc(this.firestore, 'users', userId);
    updateDoc(userref, {
      role: "doctor"
    });
  }
}
