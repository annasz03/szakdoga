import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Iuser } from '../iuser';
import {  deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { updateProfile, updateEmail } from 'firebase/auth';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import { addDoc } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, I18NextModule
  ],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {
  private authService = inject(AuthService);
  currentUser:any;
  displayName: any;
  currUserData:Iuser| null=null;
  role:any;

  displayNameField: string = '';
  emailField: string = '';
  gender: string = '';
  birth: string = '';


  pass:any;
  passAgain:any;
  passError:any;

  userId:any;

  name: string = '';
  city: string = '';
  address: string = '';
  phone: string = '';
  specialty: string = '';

  constructor(private firestore: Firestore, private http:HttpClient){}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName = user?.displayName;
  
      this.http.post<{ user: any }>('http://localhost:3000/api/get-user', {
        uid: this.currentUser.uid
      }).subscribe({
        next: (response) => {
          const userData = response.user;
          this.userId = userData.id;
          this.displayNameField = userData.username;
          this.emailField = userData.email;
          this.birth = userData.birth;
          this.gender = userData.gender;
          this.role = userData.role;

          console.log(this.role)
        }
    })
    ;
    
  })
  }


  saveProfileData() {
    const updateData = {
      uid: this.userId,
      username: this.displayNameField,
      email: this.emailField,
      gender: this.gender,
      birth: this.birth
    };
  
    this.http.post('http://localhost:3000/api/users/update-user', updateData)
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error(error);
        }
      });
  }


saveNewPassword() {
  if (this.pass !== this.passAgain) {
    this.passError = "A jelszavak nem egyeznek";
  } else if (!this.isStrongPassword(this.pass)) {
    this.passError = "A jelszónak tartalmaznia kell legalább egy nagybetűt, számot és speciális karaktert, és minimum 8 karakter hosszúnak kell lennie.";
  } else {
    this.passError = null;
  }

  const auth = getAuth();
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user!.email!, this.pass);

  reauthenticateWithCredential(user!, credential)
    .then(() => {
      updatePassword(user!, this.pass)
        .then(() => {
          console.log("Jelszó sikeresen módosítva!");
        })
    })
}

isStrongPassword(password: string): boolean {
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
}


saveDoctorData() {
  this.http.post('http://localhost:3000/api/users/save-doctor-data', {
    uid: this.currentUser.uid
  }).subscribe({
    next: (response) => {
      console.log(response);
    }
  });


  this.http.post('http://localhost:3000/api/users/update-doctor-profile', {
    uid: this.currentUser.uid,
    name: this.name,
    city: this.city,
    address: this.address,
    phone: this.phone,
    specialty: this.specialty
  }).subscribe({
    next: (response) => {
      console.log('doc updated', response);
    }
  })
}


deleteDoctorProfile() {
  this.http.post('http://localhost:3000/api/users/delete-doctor-profile', {
    uid: this.currentUser.uid
  }).subscribe({
    next: (response) => {
      console.log(response);
    }
  });
}

}
