import { Component, inject, Inject } from '@angular/core';
import { SavedDiseasesComponent } from '../saved-diseases/saved-diseases.component';
import { UploadedDocsComponent } from '../uploaded-docs/uploaded-docs.component';
import { CommonModule } from '@angular/common';
import { NotificationPageComponent } from '../notification-page/notification-page.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPostsComponent } from '../user-posts/user-posts.component';
import { ProfileSettingsComponent } from '../profile-settings/profile-settings.component';
import { collection, deleteDoc, doc, Firestore, getDocs } from '@angular/fire/firestore';
import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, SavedDiseasesComponent, UploadedDocsComponent, NotificationPageComponent, UserPostsComponent, ProfileSettingsComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

  savedRes=false;
  uploaded=false;
  notifications=false;
  posts=true;
  settings=false;

  currentUser:any;
  displayName: any;
  profileUid:any;
  role:string = "";
  userId:any;

  private authService = inject(AuthService);

  constructor(private dataService:DataService, private route: ActivatedRoute, private firestore: Firestore){

    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName=user?.displayName
    });

    const ref3 = collection(this.firestore, 'users');
          getDocs(ref3).then(snapshot => {
            snapshot.forEach(doc => {
              const docData = doc.data();
              if (docData["username"] === this.currentUser.displayName) {
                this.role = docData["role"];
                this.userId=doc.id
              }
            });
          });
  }

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
      this.profileUid = params.get('uid') || '';
    });
  }

  deleteProfileUser(){
    //adatbazisbol adatok torlese
    const userRef = doc(this.firestore, 'users', this.userId);
    deleteDoc(userRef)   

    //firebase authbol torles
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const email = user.email!;
      const password = prompt("Kérlek írd be újra a jelszavad a megerősítéshez: ");

      if (password) {
        const credential = EmailAuthProvider.credential(email, password);

        reauthenticateWithCredential(user, credential)
          .then(() => {
            deleteUser(user)
          })
      }
    }
  } 

  deleteProfileAdmin(){
    //adatbazisbol adatok torlese
    const userRef = doc(this.firestore, 'users', this.userId);
    deleteDoc(userRef) 

  }

  openSavedResults(){
    this.savedRes=true;
    this.uploaded=false;
    this.notifications=false;
    this.posts=false;
    this.settings=false;
  }

  openUploadedDocs(){
    this.savedRes=false;
    this.uploaded=true;
    this.notifications=false;
    this.posts=false;
    this.settings=false;
  }

  openNotifications(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=true;
    this.posts=false;
    this.settings=false;
  }
  openPosts(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=false;
    this.posts=true;
    this.settings=false;
  }

  profileDataModifying(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=false;
    this.posts=false;
    this.settings=true;
  }

}