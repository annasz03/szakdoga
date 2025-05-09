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
import { HttpClient } from '@angular/common/http';
import { SharedDocumentsComponent } from '../shared-documents/shared-documents.component';
import { I18NextModule } from 'angular-i18next';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [I18NextModule,SharedDocumentsComponent,CommonModule, SavedDiseasesComponent, UploadedDocsComponent, NotificationPageComponent, UserPostsComponent, ProfileSettingsComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  userService = inject(UserService)

  savedRes=false;
  profilepic: string = "";
  uploaded=false;
  notifications=false;
  posts=true;
  settings=false;
  shared=false;

  currentUser:any;
  displayName: any;
  profileUid:any;
  role:string = "";
  userId:any;

  private authService = inject(AuthService);

  constructor(private route: ActivatedRoute, private firestore: Firestore, private http: HttpClient) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.loadCurrentUserData();
    });
  }
  
  loadCurrentUserData() {
    this.userService.getUserDataByUsername(this.currentUser.displayName).subscribe({
      next: (res) => {
        this.userId = res.userId;
        this.role = res.role;
      }
    });
  }
  

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.profileUid = params.get('uid');
      this.loadProfileUser();
    });
  }
  
  loadProfileUser() {
    this.userService.getDisplayName(this.profileUid).subscribe({
      next: (res) => {
        this.displayName = res.displayName;
      }
    });

    this.userService.getProfilePicture(this.profileUid).subscribe({
      next: (res) => {
        this.profilepic = res.user.profilepic;
      }
    });
    
  }

  deleteProfileAdmin(){
    this.userService.deleteProfile(this.userId).subscribe({
      next: () => {
        console.log('törölve');
      },
    });
  }

  openSavedResults(){
    this.savedRes=true;
    this.uploaded=false;
    this.notifications=false;
    this.posts=false;
    this.settings=false;
    this.shared=false;
  }

  openUploadedDocs(){
    this.savedRes=false;
    this.uploaded=true;
    this.notifications=false;
    this.posts=false;
    this.settings=false;
    this.shared=false;
  }

  openNotifications(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=true;
    this.posts=false;
    this.settings=false;
    this.shared=false;
  }
  openPosts(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=false;
    this.posts=true;
    this.settings=false;
    this.shared=false;
  }

  profileDataModifying(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=false;
    this.posts=false;
    this.settings=true;
    this.shared=false;
  }

  openSharedDocuments(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=false;
    this.posts=false;
    this.settings=false;
    this.shared=true;
  }

}