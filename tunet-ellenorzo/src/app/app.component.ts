import { Component, Inject, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {SwPush} from "@angular/service-worker"
import { getToken, getMessaging, } from '@angular/fire/messaging';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { TranslateService } from '@ngx-translate/core';
import { Firestore } from '@angular/fire/firestore';
import { Messaging } from '@angular/fire/messaging';
import { LangService } from './lang-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthPageComponent, NavbarComponent, CommonModule, FormsModule, I18NextModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'tunet-ellenorzo';
  curr='';

  language = 'hu';
  languages: string[] = ['en', 'hu'];


  constructor(private langService: LangService,private firestore: Firestore,
    private messaging: Messaging, private translate: TranslateService, private router: Router, private swPush:SwPush, private authService:AuthService, @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService) {
    translate.setDefaultLang('en');
    this.langService.setLanguage(this.language);
  }

  isAuthPage(curr: string): boolean {
    if(this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/auth')
    {
      return false
    }
      return true;
  }

  ngOnInit(): void {
    this.i18NextService.events.initialized.subscribe((e) => {
      if (e) {
        this.updateState(this.i18NextService.language);
        this.translate.use(this.i18NextService.language);
      }
    });

    this.subscribeToPush();
    this.initializeFCM();
  }

  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
  
    if (lang !== this.i18NextService.language) {
      this.i18NextService.changeLanguage(lang).then(() => {
        this.updateState(lang);
        document.location.reload();
      });
    }

    this.langService.setLanguage(lang);
  }
  
  private updateState(lang: string) {
    this.language = lang;
    this.langService.setLanguage(lang);
  }

  subscribeToPush(): void {
    this.swPush.messages.subscribe(
      (res: any) => {
      }
    );
  }

  initializeFCM(): void {
    navigator.serviceWorker.getRegistration('./ngsw-worker.js').then((registration) => {
      getToken(this.messaging, {
        vapidKey: 'BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI',
        serviceWorkerRegistration: registration
      }).then((currentToken) => {
        if (currentToken) {
          this.updateAlertTokens(currentToken, this.firestore);
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
