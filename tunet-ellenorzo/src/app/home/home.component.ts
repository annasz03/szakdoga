import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService)
  constructor(private router: Router) {}
  
  logout(){
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  openSymptomChecker(){
    this.router.navigateByUrl('/symptom-checker')
  }
}
