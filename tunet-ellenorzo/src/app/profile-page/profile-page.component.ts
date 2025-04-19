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

  private authService = inject(AuthService);

  constructor(private dataService:DataService, private route: ActivatedRoute){}

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
      this.profileUid = params.get('uid') || '';
    });

    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName=user?.displayName
    });
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