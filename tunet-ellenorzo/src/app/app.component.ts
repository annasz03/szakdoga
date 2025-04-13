import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {SwPush} from "@angular/service-worker"
import { getToken, getMessaging, Messaging } from '@angular/fire/messaging';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from '@angular/fire/app';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthPageComponent, NavbarComponent, CommonModule, FormsModule, I18NextModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'tunet-ellenorzo';
  curr='';

  message:any;

  constructor( private router: Router, private swPush:SwPush, private authService:AuthService) {
  }

  isAuthPage(curr: string): boolean {
    if(this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/auth')
    {
      return false
    }
      return true;
  }

  ngOnInit(): void {
    this.subscribeToPush();
    this.initializeFCM();
  }

  subscribeToPush(): void {
    this.swPush.messages.subscribe(
      (res: any) => {
      }
    );
  }

  initializeFCM(): void {
    const firebaseConfig = {
      apiKey: 'AIzaSyD5JSxkcZOBFie5bfWu1wM7vwMW-c9WzYU',
      authDomain: 'tunet-ellenorzo-f8999.firebaseapp.com',
      projectId: 'tunet-ellenorzo-f8999',
      storageBucket: 'tunet-ellenorzo-f8999.firebasestorage.app',
      messagingSenderId: '371815094536',
      appId: '1:371815094536:web:c25c0e6a29b08715d234bd',
      measurementId: 'G-XQ1DQ23QDG',
      vapidKey: 'BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI'
    };

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const firestore = getFirestore(app);

    navigator.serviceWorker.getRegistration('./ngsw-worker.js').then((registration) => {
      getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
        serviceWorkerRegistration: registration
      }).then((currentToken) => {
        if (currentToken) {
          this.updateAlertTokens(currentToken, firestore);
        }
      })
    })
  }

  updateAlertTokens(newToken: string, firestore: any): void {
    let currentUser= undefined;
    
      this.authService.user$.subscribe(user => {
              currentUser = user;
              console.log(currentUser)
              
            });
    setTimeout(()=> {
      const alertCollection = collection(firestore, 'alerts');
    const alertsQuery = query(alertCollection, where('uid', '==', currentUser!.uid));

    getDocs(alertsQuery).then((querySnapshot) => {
      querySnapshot.forEach((docSnapshot) => {
        const alertDocRef = doc(firestore, 'alerts', docSnapshot.id);
        const alertData = docSnapshot.data();

        if (alertData['fcmToken'] !== newToken) {
          updateDoc(alertDocRef, {
            fcmToken: newToken
          })
        }
      });
    })
    }, 5000)

    
  }
}
