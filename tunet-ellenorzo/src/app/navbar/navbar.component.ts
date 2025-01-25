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

  hamMenu:any;
  offScreen:any;

  constructor(private router:Router){}

  ngAfterViewInit() {
    const navbar: HTMLElement | null = document.getElementById('navbar');
    const offScreenMenu: HTMLElement | null = document.getElementById('offScreenMenu');

    if (navbar && offScreenMenu) {
      navbar.addEventListener('click', () => {
        offScreenMenu.classList.toggle('active');
        navbar.classList.toggle('active');
      });

      document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!offScreenMenu.contains(target) && !navbar.contains(target)) {
          offScreenMenu.classList.remove('active');
          navbar.classList.remove('active');
        }
      });
    }
  }

  navigateSymptomChecker(){
    this.router.navigateByUrl('/symptom-checker');
  }

  navigateProfile(){
    this.router.navigateByUrl('/profile');
  }
  navigateSignOut(){
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  navigateDoctorFinder(){
    this.router.navigateByUrl('/doctor-finder');
  }

  navigateHome(){
    this.router.navigateByUrl('/home');
  }
  
}
