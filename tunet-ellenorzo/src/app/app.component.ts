import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { signOut } from 'firebase/auth';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from './messaging.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

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

  constructor(private messagingService: MessagingService, private router: Router, private afMessaging: AngularFireMessaging) {
  }

  isAuthPage(curr: string): boolean {
    if(this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/auth')
    {
      return false
    }
      return true;
  }

  ngOnInit(): void {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then((registration) => console.log('Service Worker Registered', registration))
      .catch((error) => console.error('Service Worker Registration Failed', error));

    this.requestPermission();
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        console.log('Permission granted! Token:', token);
      },
      (error) => {
        console.error('Permission denied', error);
      }
    );
  }
}
