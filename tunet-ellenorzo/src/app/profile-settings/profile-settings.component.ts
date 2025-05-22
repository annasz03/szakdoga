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
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { DoctorService } from '../doctor.service';
import { Idoctor } from '../idoctor';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, I18NextModule,  MatInputModule,MatSelectModule,MatButtonModule,MatFormFieldModule, MatDatepickerModule,MatNativeDateModule],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private doctorService = inject(DoctorService);

  currentUser:any;
  displayName: any;
  currUserData:Iuser| null=null;
  selectedFile: File | null = null;
  role:any;

  displayNameField: string = '';
  emailField: string = '';
  gender: string = '';
  birth: string = '';

  currentPass: string = '';
  pass:any;
  passAgain:any;
  passError:any;

  fileTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  errorMessage = "";
  userId:any;

  name: string = '';
  city: string = '';
  address: string = '';
  phone: string = '';
  specialty: string = '';
  constructor(private http:HttpClient, private router:Router){}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName = user?.displayName;
  
      this.userService.getUserData(this.currentUser.uid).subscribe({
        next: (response) => {
          const userData = response.user;
          this.userId = userData.id;
          this.displayNameField = userData.username;
          this.emailField = userData.email;
          this.birth = userData.birth;
          this.gender = userData.gender;
          this.role = userData.role;
        }
      })

      this.doctorService.getDoctorDataByUid(this.currentUser.uid).subscribe({
        next: (response) => {
          const doctor = response as Idoctor;
          this.name = doctor.name;
          this.city = doctor.city;
          this.address = doctor.address;
          this.phone = doctor.phone;
          this.specialty = doctor.specialty;
        }
      })

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
  

    this.userService.updateUser(updateData).subscribe({
      next: (response) => {
        window.location.reload();
      }
    });
  }


 saveNewPassword() {
  if (this.pass !== this.passAgain) {
    this.passError = "A jelszavak nem egyeznek";
    return;
  }

  if (!this.isStrongPassword(this.pass)) {
    this.passError = "A jelszónak tartalmaznia kell legalább egy nagybetűt, számot és speciális karaktert, és minimum 8 karakter hosszúnak kell lennie.";
    return;
  }

  this.passError = null;

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user || !user.email) {
    this.passError = "Hiba történt: nem található bejelentkezett felhasználó.";
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, this.currentPass);

    reauthenticateWithCredential(user, credential).then(() => {
      updatePassword(user, this.pass).then(() => {
        alert("Sikeres jelszóváltoztatás");
        window.location.reload();
      })})
  }


  isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordRegex.test(password);
  }


  saveDoctorData() {
  const doctorData = {
    uid: this.currentUser.uid,
    name: this.name,
    city: this.city,
    address: this.address,
    phone: this.phone,
    specialty: this.specialty
  };

  this.doctorService.updateDoctorProfile(doctorData).subscribe({
    next: (response) => {
      window.location.reload();
    }
  });
}


  deleteDoctorProfile() {
    this.userService.deleteProfile(this.currentUser.uid).subscribe({
      next: (response) => {
        window.location.reload();
      }
    });
  }

  deleteProfileUser() {
    const confirmed = window.confirm('Biztosan törölni szeretnéd a profilodat?');

    if (confirmed) {
      this.http.post('https://szakdoga-dlg2.onrender.com/api/delete-user', { uid: this.userId })
        .subscribe({
          next: () => {
            alert('Profil sikeresen törölve.');
            this.router.navigate(['/login']);
          }
        });
    }
  }

  uploadProfilePicture() {
    if (this.selectedFile && this.fileTypes.includes(this.selectedFile.type)) {
      this.errorMessage = "";

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('userId', this.currentUser.uid);

      this.userService.uploadProfilePicture(formData).subscribe({next: (response) => {
        window.location.reload();
      }
      });
    } else {
      this.errorMessage = "Nem megfelelő file formátum";
    }
  }

  fileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

}
