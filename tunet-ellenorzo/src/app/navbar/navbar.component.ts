import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService)
  constructor(private router:Router){}

  navigateSymptomChecker(){
    this.router.navigateByUrl('/symptom-checker');
  }

  navigateProfile(){
    this.router.navigateByUrl('/profile');
  }
  navigateSignOut(){
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  navigateDoctorFinder(){
    this.router.navigateByUrl('/doctor-finder');
  }
  
}
