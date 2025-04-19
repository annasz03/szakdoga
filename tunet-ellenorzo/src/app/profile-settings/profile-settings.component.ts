import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {
  private authService = inject(AuthService);
  currentUser:any;
  displayName: any;

  constructor(){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.displayName=user?.displayName
    });
  }

}
