import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { signOut } from 'firebase/auth';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthPageComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'tunet-ellenorzo';
  curr='';

  constructor(private router: Router) {}

  isAuthPage(curr: string): boolean {
    if(this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/auth')
    {
      return false
    }
      return true;
  }
}
