import { Component, Inject } from '@angular/core';
import { SavedDiseasesComponent } from '../saved-diseases/saved-diseases.component';
import { UploadedDocsComponent } from '../uploaded-docs/uploaded-docs.component';
import { CommonModule } from '@angular/common';
import { NotificationPageComponent } from '../notification-page/notification-page.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, SavedDiseasesComponent, UploadedDocsComponent, NotificationPageComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

  savedRes=true;
  uploaded=false;
  notifications=false;

  currentUser:any;
  displayName: any;

  constructor(private dataService:DataService, private authService: AuthService){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName=user?.displayName
    });
  }

  openSavedResults(){
    this.savedRes=true;
    this.uploaded=false;
    this.notifications=false;
  }

  openUploadedDocs(){
    this.savedRes=false;
    this.uploaded=true;
    this.notifications=false;
  }

  openNotifications(){
    this.savedRes=false;
    this.uploaded=false;
    this.notifications=true;
  }

}