import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Iuser } from '../iuser';
import { collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { updateProfile, updateEmail } from 'firebase/auth';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import { addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private firestore: Firestore){}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName = user?.displayName;
  
  
      const ref = collection(this.firestore, 'users');
      getDocs(ref).then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data();
          if (docData["username"] === this.currentUser.displayName) {
            this.userId = doc.id;
            this.displayNameField = docData["username"];
            this.emailField = docData["email"];
            this.birth = docData["birth"];
            this.gender = docData["gender"];
            this.role = docData["role"];
          }
        });
      });
    });
  }


saveProfileData() {
  const ref = doc(this.firestore, 'users', this.userId);

  updateDoc(ref, {
    username: this.displayNameField,
    email: this.emailField,
    gender: this.gender,
    birth: this.birth
  })

  updateProfile(this.currentUser, {
    displayName: this.displayNameField
  }).then(() => {
    console.log('Display name frissítve');
  })

  updateEmail(this.currentUser, this.emailField).then(() => {
    console.log('Email frissítve');
  })
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
  const ref2 = collection(this.firestore, 'doctors');
  getDocs(ref2).then(snapshot => {
    snapshot.forEach(docc => {
      const docData = docc.data();
      if (docData["uid"] === this.currentUser.uid) {
        const docRef = doc(this.firestore, 'doctors', docc.id);
        
        updateDoc(docRef, {
          name: this.name,
          city: this.city,
          address: this.address,
          phone: this.phone,
          specialty: this.specialty
        })
      }
    });
  })
}


  deleteDoctorProfile(){
    const ref = doc(this.firestore, 'users', this.userId);
    updateDoc(ref, {
      role:"user"
    })

    const ref2 = collection(this.firestore, 'doctors');
    getDocs(ref2).then(snapshot => {
      snapshot.forEach(docc => {
        const docData = docc.data();
        if(docData["uid"]===this.currentUser.uid){
          const docRef = doc(this.firestore, 'doctors', docc.id);
          deleteDoc(docRef).then(() => {
            console.log('Orvosprofil törölve');
          })
        }
      });
    })

    const userref = doc(this.firestore, 'users', this.userId);
        updateDoc(userref, {
          role: "user"
        });
  }
}
