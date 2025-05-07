import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [I18NextModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService)

  hamMenu:any;
  offScreen:any;
  currentUser:any;
  profilepic:string = ""
  name:string = "";

  constructor(private router:Router,private dataService: DataService, private http:HttpClient){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;

      this.http.post<{ user: { profilepic: string } }>('http://localhost:3000/get-user-profile-picture', {
        uid: this.currentUser.uid
      }).subscribe({
        next: (res) => {
          this.profilepic = res.user.profilepic;
        }
      });
    });
  }

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

  navigateForum(){
    this.router.navigateByUrl('/forum');
  }

  navigateProfile(){
    this.router.navigate(['/profile', this.currentUser.uid]);
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

  searchProfile(){
    this.dataService.setProfileSearch =  this.name;

    this.router.navigateByUrl('/search-result');
  }
  
}
